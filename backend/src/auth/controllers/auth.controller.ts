import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';

import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Nota: Register y Login son manejados por Clerk en el frontend
  // Estos endpoints ya no son necesarios

  @Get('profile')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(@CurrentUser() user: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario autenticado (Clerk)' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      clerkId: user.clerkId,
    };
  }

  @Get('clerk-profile')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario desde Clerk' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getClerkProfile(@CurrentUser() user: any) {
    // Obtener información adicional del usuario desde la base de datos
    const userProfile = await this.authService.getUserById(user.id);

    return {
      id: userProfile.id,
      clerkId: user.clerkId, // clerkId viene del objeto user, no del DTO
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      role: userProfile.role,
      status: userProfile.status,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Token de refresh',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresh inválido',
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    // Nota: Refresh tokens son manejados por Clerk
    throw new BadRequestException('Este endpoint ya no está disponible. Usa Clerk para manejar tokens.');
  }

  @Post('logout')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
  })
  async logout(@CurrentUser() user: any) {
    // En una implementación completa, aquí se invalidaría el token
    // Por ahora solo retornamos un mensaje de éxito
    return {
      message: 'Sesión cerrada exitosamente',
      userId: user.id,
    };
  }

  @Get('verify-token')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar validez del token' })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido',
  })
  async verifyToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get('admin-only')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint solo para administradores' })
  @ApiResponse({
    status: 200,
    description: 'Acceso autorizado para administrador',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Se requiere rol de administrador',
  })
  async adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso autorizado para administrador',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get('provider-only')
  @UseGuards(ClerkAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint para proveedores y administradores' })
  @ApiResponse({
    status: 200,
    description: 'Acceso autorizado para proveedor o administrador',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Se requiere rol de proveedor o administrador',
  })
  async providerOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso autorizado para proveedor o administrador',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Post('sync-user')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar usuario existente de Clerk' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clerkId: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario sincronizado exitosamente',
  })
  async syncUser(@Body() userData: any) {
    try {
      const result = await this.authService.syncWithClerk(
        userData.clerkId,
        {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }
      );

      return {
        message: 'Usuario sincronizado exitosamente',
        user: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('sync-user-role')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sincronizar rol del usuario actual desde BD a Clerk' })
  @ApiResponse({
    status: 200,
    description: 'Rol sincronizado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async syncUserRole(@CurrentUser() user: any) {
    try {
      const result = await this.authService.syncRoleToClerk(user.clerkId);

      return {
        message: 'Rol sincronizado exitosamente',
        role: result.role,
        user: {
          id: result.id,
          email: result.email,
          role: result.role,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}