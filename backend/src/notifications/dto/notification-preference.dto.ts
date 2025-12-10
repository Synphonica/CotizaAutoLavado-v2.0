import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '@prisma/client';

/**
 * DTO para actualizar preferencias de notificaciones
 */
export class UpdateNotificationPreferenceDto {
    @ApiProperty({
        description: 'Tipo de notificación',
        enum: NotificationType,
        example: 'PRICE_DROP'
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Si las notificaciones de este tipo están habilitadas',
        example: true
    })
    @IsBoolean()
    enabled: boolean;
}

/**
 * DTO para actualizar múltiples preferencias
 */
export class UpdateNotificationPreferencesDto {
    @ApiProperty({
        description: 'Mapa de tipo de notificación a estado habilitado',
        example: {
            PRICE_DROP: true,
            NEW_OFFER: true,
            NEW_PROVIDER: false,
            SYSTEM_UPDATE: true
        }
    })
    preferences: Record<NotificationType, boolean>;
}

/**
 * DTO de respuesta para una preferencia de notificación
 */
export class NotificationPreferenceResponseDto {
    @ApiProperty({
        description: 'ID de la preferencia',
        example: 'pref_123456789'
    })
    id: string;

    @ApiProperty({
        description: 'ID del usuario',
        example: 'user_123456789'
    })
    userId: string;

    @ApiProperty({
        description: 'Tipo de notificación',
        enum: NotificationType,
        example: 'PRICE_DROP'
    })
    type: NotificationType;

    @ApiProperty({
        description: 'Si las notificaciones de este tipo están habilitadas',
        example: true
    })
    enabled: boolean;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2025-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2025-01-15T10:30:00Z'
    })
    updatedAt: Date;
}

/**
 * DTO de respuesta para todas las preferencias de un usuario
 */
export class NotificationPreferencesResponseDto {
    @ApiProperty({
        description: 'Lista de preferencias de notificación',
        type: [NotificationPreferenceResponseDto]
    })
    preferences: NotificationPreferenceResponseDto[];

    @ApiProperty({
        description: 'Si todas las notificaciones están habilitadas',
        example: false
    })
    allEnabled: boolean;

    @ApiProperty({
        description: 'Número de tipos de notificación habilitados',
        example: 3
    })
    enabledCount: number;

    @ApiProperty({
        description: 'Número total de tipos de notificación',
        example: 4
    })
    totalCount: number;
}
