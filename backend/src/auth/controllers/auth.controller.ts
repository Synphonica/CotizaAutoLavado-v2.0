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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
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

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: CreateAuthDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  async register(@Body() createUserDto: CreateAuthDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
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
    if (!refreshToken) {
      throw new BadRequestException('Token de refresh requerido');
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    const newAccessToken = await this.authService.generateRefreshToken(payload.sub);

    return {
      accessToken: newAccessToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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

  @Get('clerk-profile')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado con Clerk' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario sincronizado con Clerk',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getClerkProfile(@CurrentUser() user: any) {
    return {
      message: 'Usuario sincronizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        clerkId: user.clerkId,
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
}