import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, NotificationStatus } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID único de la notificación',
    example: 'notification_123456789'
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que recibió la notificación',
    example: 'user_123456789'
  })
  userId: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.PRICE_DROP
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Título de la notificación',
    example: '¡Precio bajó! AutoLavado Premium'
  })
  title: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'El servicio de lavado premium bajó de $15,000 a $12,000'
  })
  message: string;

  @ApiPropertyOptional({
    description: 'ID del proveedor relacionado',
    example: 'provider_123456789'
  })
  providerId?: string;

  @ApiPropertyOptional({
    description: 'ID del servicio relacionado',
    example: 'service_123456789'
  })
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Datos adicionales de la notificación',
    example: { oldPrice: 15000, newPrice: 12000, discount: 20 }
  })
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL de acción de la notificación',
    example: 'https://app.alto-carwash.com/providers/provider_123456789'
  })
  actionUrl?: string;

  @ApiProperty({
    description: 'Estado de la notificación',
    enum: NotificationStatus,
    example: NotificationStatus.UNREAD
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'Fecha de creación de la notificación',
    example: '2025-01-15T10:30:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-01-15T10:30:00Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de lectura de la notificación',
    example: '2025-01-15T10:35:00Z'
  })
  readAt?: Date;

  // Información del usuario (opcional, para respuestas detalladas)
  @ApiPropertyOptional({
    description: 'Información del usuario que recibió la notificación',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'user_123456789' },
      firstName: { type: 'string', example: 'Juan' },
      lastName: { type: 'string', example: 'Pérez' },
      email: { type: 'string', example: 'juan@example.com' }
    }
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  // Información del proveedor (opcional, para respuestas detalladas)
  @ApiPropertyOptional({
    description: 'Información del proveedor relacionado',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'provider_123456789' },
      businessName: { type: 'string', example: 'AutoLavado Premium' },
      businessType: { type: 'string', example: 'Autolavado' }
    }
  })
  provider?: {
    id: string;
    businessName: string;
    businessType: string;
  };

  // Información del servicio (opcional, para respuestas detalladas)
  @ApiPropertyOptional({
    description: 'Información del servicio relacionado',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'service_123456789' },
      name: { type: 'string', example: 'Lavado Premium' },
      type: { type: 'string', example: 'PREMIUM_WASH' }
    }
  })
  service?: {
    id: string;
    name: string;
    type: string;
  };
}
