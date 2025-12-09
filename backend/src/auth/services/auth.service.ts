import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UserRole } from '@prisma/client';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerkApi;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    // Inicializar Clerk API
    this.clerkApi = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  /**
   * Verificar token de Clerk
   */
  async verifyClerkToken(token: string): Promise<any> {
    try {
      this.logger.log('Verificando token de Clerk...');

      // Verificar el token con Clerk
      const clerkUser = await this.clerkApi.verifyToken(token);

      if (!clerkUser) {
        throw new UnauthorizedException('Token de Clerk inválido');
      }

      this.logger.log(`Token verificado para usuario: ${clerkUser.sub}`);

      return {
        id: clerkUser.sub,
        email: clerkUser.email,
        firstName: clerkUser.given_name || '',
        lastName: clerkUser.family_name || '',
        phone: clerkUser.phone_number || null,
        emailVerified: clerkUser.email_verified || false,
        metadata: clerkUser.metadata || {}
      };
    } catch (error) {
      this.logger.error('Error verificando token de Clerk:', error);
      throw new UnauthorizedException('Token de Clerk inválido o expirado');
    }
  }

  /**
   * Sincronizar usuario con Clerk
   */
  async syncWithClerk(clerkId: string, userData: any): Promise<UserResponseDto> {
    try {
      this.logger.log(`Sincronizando usuario con Clerk ID: ${clerkId}`);

      // Validar que se reciban los datos necesarios
      if (!clerkId || !userData || !userData.email) {
        this.logger.error('Datos incompletos para sincronización', { clerkId, userData });
        throw new Error('Datos incompletos: clerkId y userData.email son requeridos');
      }

      // Buscar usuario existente por clerkId
      let user = await this.prisma.user.findUnique({
        where: { clerkId },
        include: { providerProfile: true },
      });

      if (user) {
        // Actualizar datos del usuario si es necesario
        if (user.email !== userData.email ||
          user.firstName !== userData.firstName ||
          user.lastName !== userData.lastName) {

          user = await this.prisma.user.update({
            where: { clerkId },
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone || user.phone,
              lastLoginAt: new Date(),
            },
            include: { providerProfile: true },
          });

          this.logger.log(`Usuario actualizado: ${user.email}`);
        } else {
          // Solo actualizar último login
          await this.prisma.user.update({
            where: { clerkId },
            data: { lastLoginAt: new Date() },
          });
        }

        return this.mapUserToResponse(user);
      }

      // Verificar si ya existe un usuario con el mismo email
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUserByEmail) {
        // Vincular el usuario existente con Clerk
        user = await this.prisma.user.update({
          where: { email: userData.email },
          data: {
            clerkId,
            lastLoginAt: new Date(),
          },
          include: { providerProfile: true },
        });

        this.logger.log(`Usuario existente vinculado con Clerk: ${user.email}`);
      } else {
        // Determinar rol basado en userData - asegurar que sea un valor válido del enum
        let role: UserRole = UserRole.CUSTOMER;
        if (userData.role && ['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(userData.role)) {
          role = userData.role as UserRole;
        }

        // Crear nuevo usuario desde datos de Clerk
        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: userData.email,
            firstName: userData.firstName || 'Usuario',
            lastName: userData.lastName || 'Nuevo',
            phone: userData.phone || null,
            role: role,
            status: 'ACTIVE',
            lastLoginAt: new Date(),
          },
          include: { providerProfile: true },
        });

        // Si es provider, crear el perfil de proveedor
        if (role === UserRole.PROVIDER && userData.providerData) {
          await this.prisma.provider.create({
            data: {
              userId: user.id,
              businessName: userData.providerData.businessName,
              businessType: userData.providerData.businessType || 'CAR_WASH',
              description: userData.providerData.description || '',
              phone: userData.phone || '',
              email: userData.email,
              address: userData.providerData.address || '',
              city: userData.providerData.city || '',
              region: userData.providerData.region || '',
              latitude: userData.providerData.latitude || 0,
              longitude: userData.providerData.longitude || 0,
              operatingHours: {
                monday: { open: '09:00', close: '19:00', isOpen: true },
                tuesday: { open: '09:00', close: '19:00', isOpen: true },
                wednesday: { open: '09:00', close: '19:00', isOpen: true },
                thursday: { open: '09:00', close: '19:00', isOpen: true },
                friday: { open: '09:00', close: '19:00', isOpen: true },
                saturday: { open: '10:00', close: '18:00', isOpen: true },
                sunday: { open: '10:00', close: '14:00', isOpen: false },
              },
              status: 'PENDING_APPROVAL',
            },
          });

          this.logger.log(`Provider profile creado para: ${user.email}`);
        }

        this.logger.log(`Nuevo usuario creado desde Clerk: ${user.email}`);
      }

      return this.mapUserToResponse(user);
    } catch (error) {
      this.logger.error('Error sincronizando usuario con Clerk:', error);
      this.logger.error('Error stack:', error.stack);
      this.logger.error('Error details:', { clerkId, userData });
      // Re-lanzar el error original en lugar de uno genérico
      throw error;
    }
  }

  // Nota: Refresh tokens son manejados por Clerk
  // Estos métodos ya no son necesarios

  /**
   * Manejar creación de usuario desde webhook de Clerk
   */
  async handleUserCreated(data: any): Promise<void> {
    try {
      this.logger.log(`Creando usuario desde webhook: ${data.id}`);

      await this.syncWithClerk(data.id, {
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone_numbers[0]?.phone_number,
      });

      this.logger.log(`Usuario creado exitosamente: ${data.email_addresses[0]?.email_address}`);
    } catch (error) {
      this.logger.error('Error creando usuario desde webhook:', error);
    }
  }

  /**
   * Manejar actualización de usuario desde webhook de Clerk
   */
  async handleUserUpdated(data: any): Promise<void> {
    try {
      this.logger.log(`Actualizando usuario desde webhook: ${data.id}`);

      await this.syncWithClerk(data.id, {
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone_numbers[0]?.phone_number,
      });

      this.logger.log(`Usuario actualizado exitosamente: ${data.email_addresses[0]?.email_address}`);
    } catch (error) {
      this.logger.error('Error actualizando usuario desde webhook:', error);
    }
  }

  /**
   * Manejar eliminación de usuario desde webhook de Clerk
   */
  async handleUserDeleted(data: any): Promise<void> {
    try {
      this.logger.log(`Eliminando usuario desde webhook: ${data.id}`);

      await this.prisma.user.updateMany({
        where: { clerkId: data.id },
        data: { status: 'INACTIVE' },
      });

      this.logger.log(`Usuario desactivado exitosamente: ${data.id}`);
    } catch (error) {
      this.logger.error('Error eliminando usuario desde webhook:', error);
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { providerProfile: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return this.mapUserToResponse(user);
    } catch (error) {
      this.logger.error('Error obteniendo usuario por ID:', error);
      throw new UnauthorizedException('Error al obtener usuario');
    }
  }

  /**
   * Sincronizar rol del usuario de BD a Clerk
   */
  async syncRoleToClerk(clerkId: string) {
    try {
      this.logger.log(`[syncRoleToClerk] Iniciando sincronización de rol para: ${clerkId}`);

      // Obtener usuario de la BD
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      });

      if (!user) {
        this.logger.error(`[syncRoleToClerk] Usuario no encontrado en BD: ${clerkId}`);
        throw new UnauthorizedException('Usuario no encontrado');
      }

      this.logger.log(`[syncRoleToClerk] Usuario encontrado en BD - Email: ${user.email}, Role: ${user.role}`);

      // Actualizar metadata en Clerk
      await this.clerkApi.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          role: user.role,
        },
      });

      this.logger.log(`[syncRoleToClerk] Metadata actualizada en Clerk para ${user.email} con rol: ${user.role}`);

      return user;
    } catch (error) {
      this.logger.error('[syncRoleToClerk] Error sincronizando rol a Clerk:', error);
      throw new UnauthorizedException('Error al sincronizar rol con Clerk');
    }
  }

  /**
   * Mapear usuario de Prisma a UserResponseDto
   */
  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      defaultLatitude: user.defaultLatitude,
      defaultLongitude: user.defaultLongitude,
      defaultAddress: user.defaultAddress,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}