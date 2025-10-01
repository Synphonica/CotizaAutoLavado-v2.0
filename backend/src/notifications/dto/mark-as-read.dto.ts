import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class MarkAsReadDto {
  @ApiProperty({
    description: 'IDs de las notificaciones a marcar como leídas',
    example: ['notification_123', 'notification_456'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  notificationIds: string[];
}

export class MarkAllAsReadDto {
  @ApiPropertyOptional({
    description: 'ID del usuario (opcional, si no se proporciona se usa el usuario autenticado)',
    example: 'user_123456789'
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
