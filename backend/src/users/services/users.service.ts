import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { QueryUsersDto } from '../dto/query-users.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UserResponseDto, UserListResponseDto } from '../dto/user-response.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crear un nuevo usuario
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, firstName, lastName, phone, role, status, avatar, dateOfBirth, defaultLatitude, defaultLongitude, defaultAddress } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe con este email');
    }

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phone,
        role: role || UserRole.CUSTOMER,
        status: status || UserStatus.ACTIVE,
        avatar,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        defaultLatitude,
        defaultLongitude,
        defaultAddress,
      },
    });

    return this.mapUserToResponse(user);
  }

  /**
   * Obtener todos los usuarios con filtros y paginación
   */
  async findAll(queryDto: QueryUsersDto): Promise<UserListResponseDto> {
    const { search, role, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    // Calcular offset
    const skip = (page - 1) * limit;

    // Obtener usuarios y total
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
          dateOfBirth: true,
          defaultLatitude: true,
          defaultLongitude: true,
          defaultAddress: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(user => this.mapUserToResponse(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        dateOfBirth: true,
        defaultLatitude: true,
        defaultLongitude: true,
        defaultAddress: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Obtener un usuario por email
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        dateOfBirth: true,
        defaultLatitude: true,
        defaultLongitude: true,
        defaultAddress: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return user ? this.mapUserToResponse(user) : null;
  }

  /**
   * Actualizar un usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const { firstName, lastName, phone, role, status, avatar, dateOfBirth, defaultLatitude, defaultLongitude, defaultAddress } = updateUserDto;

    // Verificar si el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar usuario
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        role,
        status,
        avatar,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        defaultLatitude,
        defaultLongitude,
        defaultAddress,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        dateOfBirth: true,
        defaultLatitude: true,
        defaultLongitude: true,
        defaultAddress: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return this.mapUserToResponse(user);
  }

  /**
   * Actualizar el estado de un usuario
   */
  async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<UserResponseDto> {
    const { status } = updateStatusDto;

    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        dateOfBirth: true,
        defaultLatitude: true,
        defaultLongitude: true,
        defaultAddress: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    return this.mapUserToResponse(user);
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete - cambiar estado a INACTIVE
    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }

  /**
   * Eliminar un usuario permanentemente
   */
  async permanentDelete(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado permanentemente' };
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getStats(): Promise<any> {
    const [total, active, inactive, customers, providers, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
    ]);

    return {
      total,
      active,
      inactive,
      byRole: {
        customers,
        providers,
        admins,
      },
    };
  }

  /**
   * Mapear usuario de Prisma a DTO de respuesta
   */
  private mapUserToResponse(user: any): UserResponseDto {
    return {
      id: user.id,
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
