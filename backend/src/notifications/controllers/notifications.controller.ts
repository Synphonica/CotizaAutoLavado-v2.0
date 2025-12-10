import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { NotificationsByUserDto } from '../dto/notifications-by-user.dto';
import { MarkAsReadDto, MarkAllAsReadDto } from '../dto/mark-as-read.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Crear una nueva notificación',
    description: 'Permite a los administradores crear notificaciones para usuarios (solo admin)'
  })
  @ApiResponse({
    status: 201,
    description: 'Notificación creada exitosamente',
    type: NotificationResponseDto
  })
  @ApiResponse({
    status: 204,
    description: 'Notificación no creada porque el usuario tiene deshabilitado este tipo de notificación'
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario, proveedor o servicio no encontrado' })
  @ApiBearerAuth()
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const result = await this.notificationsService.create(createNotificationDto);
    if (!result) {
      throw new BadRequestException('El usuario tiene deshabilitadas las notificaciones de este tipo');
    }
    return result;
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener todas las notificaciones',
    description: 'Obtiene una lista paginada de todas las notificaciones (solo admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificaciones obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        notifications: { type: 'array', items: { $ref: '#/components/schemas/NotificationResponseDto' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 10 }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID del usuario' })
  @ApiQuery({ name: 'type', required: false, enum: ['PRICE_DROP', 'NEW_OFFER', 'NEW_PROVIDER', 'SYSTEM_UPDATE'] })
  @ApiQuery({ name: 'status', required: false, enum: ['UNREAD', 'READ'] })
  @ApiBearerAuth()
  async findAll(@Query() queryDto: QueryNotificationsDto) {
    return this.notificationsService.findAll(queryDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas de notificaciones',
    description: 'Obtiene estadísticas generales de todas las notificaciones (solo admin)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalNotifications: { type: 'number', example: 1000 },
        unreadNotifications: { type: 'number', example: 250 },
        readNotifications: { type: 'number', example: 750 },
        notificationsByType: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'PRICE_DROP' },
              count: { type: 'number', example: 400 }
            }
          }
        },
        notificationsByUser: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string', example: 'user_123' },
              count: { type: 'number', example: 15 }
            }
          }
        }
      }
    }
  })
  @ApiBearerAuth()
  async getStats() {
    return this.notificationsService.getStats();
  }

  @Get('my-notifications')
  @ApiOperation({
    summary: 'Obtener mis notificaciones',
    description: 'Obtiene las notificaciones del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones del usuario obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        notifications: { type: 'array', items: { $ref: '#/components/schemas/NotificationResponseDto' } },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 3 }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['PRICE_DROP', 'NEW_OFFER', 'NEW_PROVIDER', 'SYSTEM_UPDATE'] })
  @ApiQuery({ name: 'status', required: false, enum: ['UNREAD', 'READ'] })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiBearerAuth()
  async getMyNotifications(
    @Query() queryDto: NotificationsByUserDto,
    @CurrentUser() user: any
  ) {
    return this.notificationsService.findByUser(user.id, queryDto);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Obtener contador de notificaciones no leídas',
    description: 'Obtiene el número de notificaciones no leídas del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Contador obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        unreadCount: { type: 'number', example: 5 }
      }
    }
  })
  @ApiBearerAuth()
  async getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener notificaciones por usuario',
    description: 'Obtiene todas las notificaciones de un usuario específico (solo admin)'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones del usuario obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        notifications: { type: 'array', items: { $ref: '#/components/schemas/NotificationResponseDto' } },
        total: { type: 'number', example: 15 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 2 }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiBearerAuth()
  async findByUser(
    @Param('userId') userId: string,
    @Query() queryDto: NotificationsByUserDto
  ) {
    return this.notificationsService.findByUser(userId, queryDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obtener una notificación por ID',
    description: 'Obtiene los detalles de una notificación específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación obtenida exitosamente',
    type: NotificationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una notificación',
    description: 'Permite al usuario propietario o admin actualizar una notificación'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({
    status: 200,
    description: 'Notificación actualizada exitosamente',
    type: NotificationResponseDto
  })
  @ApiResponse({ status: 403, description: 'No tienes permisos para editar esta notificación' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @CurrentUser() user: any
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.update(id, updateNotificationDto, user.id);
  }

  @Patch('mark-as-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar notificaciones como leídas',
    description: 'Marca múltiples notificaciones como leídas'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones marcadas como leídas exitosamente',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', example: 3 }
      }
    }
  })
  @ApiBearerAuth()
  async markAsRead(@Body() markAsReadDto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(markAsReadDto);
  }

  @Patch('mark-all-as-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leídas',
    description: 'Marca todas las notificaciones del usuario autenticado como leídas'
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas exitosamente',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number', example: 10 }
      }
    }
  })
  @ApiBearerAuth()
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una notificación',
    description: 'Permite al usuario propietario o admin eliminar una notificación'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 204, description: 'Notificación eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar esta notificación' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiBearerAuth()
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<void> {
    return this.notificationsService.remove(id, user.id);
  }

  @Delete('user/:userId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar todas las notificaciones de un usuario',
    description: 'Elimina todas las notificaciones de un usuario específico (solo admin)'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones eliminadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', example: 25 }
      }
    }
  })
  @ApiBearerAuth()
  async removeAllByUser(@Param('userId') userId: string) {
    return this.notificationsService.removeAllByUser(userId);
  }

  @Delete('my-notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar todas mis notificaciones',
    description: 'Elimina todas las notificaciones del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones eliminadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number', example: 15 }
      }
    }
  })
  @ApiBearerAuth()
  async removeAllMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.removeAllByUser(user.id);
  }

  // ============================================
  // ENDPOINTS DE PREFERENCIAS DE NOTIFICACIONES
  // ============================================

  @Get('preferences')
  @ApiOperation({
    summary: 'Obtener preferencias de notificación',
    description: 'Obtiene las preferencias de notificación del usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencias obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        preferences: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'pref_123' },
              userId: { type: 'string', example: 'user_123' },
              type: { type: 'string', example: 'PRICE_DROP' },
              enabled: { type: 'boolean', example: true },
              createdAt: { type: 'string', example: '2025-01-15T10:30:00Z' },
              updatedAt: { type: 'string', example: '2025-01-15T10:30:00Z' }
            }
          }
        },
        allEnabled: { type: 'boolean', example: false },
        enabledCount: { type: 'number', example: 3 },
        totalCount: { type: 'number', example: 4 }
      }
    }
  })
  @ApiBearerAuth()
  async getMyPreferences(@CurrentUser() user: any) {
    return this.notificationsService.getUserPreferences(user.id);
  }

  @Patch('preferences/:type')
  @ApiOperation({
    summary: 'Actualizar preferencia de notificación',
    description: 'Actualiza la preferencia de un tipo específico de notificación'
  })
  @ApiParam({
    name: 'type',
    enum: ['PRICE_DROP', 'NEW_OFFER', 'NEW_PROVIDER', 'SYSTEM_UPDATE'],
    description: 'Tipo de notificación'
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencia actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'pref_123' },
        userId: { type: 'string', example: 'user_123' },
        type: { type: 'string', example: 'PRICE_DROP' },
        enabled: { type: 'boolean', example: true },
        createdAt: { type: 'string', example: '2025-01-15T10:30:00Z' },
        updatedAt: { type: 'string', example: '2025-01-15T10:30:00Z' }
      }
    }
  })
  @ApiBearerAuth()
  async updateMyPreference(
    @CurrentUser() user: any,
    @Param('type') type: string,
    @Body() body: { enabled: boolean }
  ) {
    return this.notificationsService.updateUserPreference(user.id, type as any, body.enabled);
  }

  @Patch('preferences')
  @ApiOperation({
    summary: 'Actualizar múltiples preferencias',
    description: 'Actualiza múltiples preferencias de notificación a la vez'
  })
  @ApiResponse({
    status: 200,
    description: 'Preferencias actualizadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        preferences: { type: 'array' },
        allEnabled: { type: 'boolean', example: false },
        enabledCount: { type: 'number', example: 3 },
        totalCount: { type: 'number', example: 4 }
      }
    }
  })
  @ApiBearerAuth()
  async updateMyPreferences(
    @CurrentUser() user: any,
    @Body() body: { preferences: Record<string, boolean> }
  ) {
    return this.notificationsService.updateUserPreferences(user.id, body.preferences as any);
  }

  @Post('preferences/enable-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Habilitar todas las notificaciones',
    description: 'Habilita todos los tipos de notificaciones para el usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones habilitadas',
    schema: {
      type: 'object',
      properties: {
        preferences: { type: 'array' },
        allEnabled: { type: 'boolean', example: true },
        enabledCount: { type: 'number', example: 4 },
        totalCount: { type: 'number', example: 4 }
      }
    }
  })
  @ApiBearerAuth()
  async enableAllMyPreferences(@CurrentUser() user: any) {
    return this.notificationsService.enableAllPreferences(user.id);
  }

  @Post('preferences/disable-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deshabilitar todas las notificaciones',
    description: 'Deshabilita todos los tipos de notificaciones para el usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones deshabilitadas',
    schema: {
      type: 'object',
      properties: {
        preferences: { type: 'array' },
        allEnabled: { type: 'boolean', example: false },
        enabledCount: { type: 'number', example: 0 },
        totalCount: { type: 'number', example: 4 }
      }
    }
  })
  @ApiBearerAuth()
  async disableAllMyPreferences(@CurrentUser() user: any) {
    return this.notificationsService.disableAllPreferences(user.id);
  }
}
