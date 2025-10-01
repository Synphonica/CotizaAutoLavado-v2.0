import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationStatus } from '@prisma/client';

export class NotificationsByUserDto {
  @ApiPropertyOptional({
    description: 'Página actual para paginación',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Tipo de notificación',
    enum: NotificationType,
    example: NotificationType.PRICE_DROP
  })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Estado de la notificación',
    enum: NotificationStatus,
    example: NotificationStatus.UNREAD
  })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar notificaciones (ISO 8601)',
    example: '2025-01-01T00:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar notificaciones (ISO 8601)',
    example: '2025-12-31T23:59:59Z'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Solo notificaciones no leídas',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  unreadOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Campo para ordenar los resultados',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'readAt', 'type', 'status']
  })
  @IsString()
  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'readAt' | 'type' | 'status' = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    example: 'desc',
    enum: ['asc', 'desc']
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Incluir información del proveedor en la respuesta',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  includeProvider?: boolean = true;

  @ApiPropertyOptional({
    description: 'Incluir información del servicio en la respuesta',
    example: true
  })
  @IsOptional()
  @Type(() => Boolean)
  includeService?: boolean = true;
}
