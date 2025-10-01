import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { NotificationType, NotificationStatus } from '@prisma/client';

export class CreateNotificationDto {
    @ApiProperty({
        description: 'ID del usuario que recibirá la notificación',
        example: 'user_123456789'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Tipo de notificación',
        enum: NotificationType,
        example: NotificationType.PRICE_DROP
    })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Título de la notificación',
        example: '¡Precio bajó! AutoLavado Premium'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Mensaje de la notificación',
        example: 'El servicio de lavado premium bajó de $15,000 a $12,000'
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiPropertyOptional({
        description: 'ID del proveedor relacionado (opcional)',
        example: 'provider_123456789'
    })
    @IsString()
    @IsOptional()
    providerId?: string;

    @ApiPropertyOptional({
        description: 'ID del servicio relacionado (opcional)',
        example: 'service_123456789'
    })
    @IsString()
    @IsOptional()
    serviceId?: string;

    @ApiPropertyOptional({
        description: 'Datos adicionales de la notificación (opcional)',
        example: { oldPrice: 15000, newPrice: 12000, discount: 20 }
    })
    @IsObject()
    @IsOptional()
    data?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'URL de acción de la notificación (opcional)',
        example: 'https://app.alto-carwash.com/providers/provider_123456789'
    })
    @IsString()
    @IsOptional()
    actionUrl?: string;

    @ApiPropertyOptional({
        description: 'Estado de la notificación',
        enum: NotificationStatus,
        example: NotificationStatus.UNREAD
    })
    @IsEnum(NotificationStatus)
    @IsOptional()
    status?: NotificationStatus;
}