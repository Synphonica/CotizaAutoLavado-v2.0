import {
    IsOptional,
    IsString,
    IsEnum,
    IsBoolean,
    Min,
    Max,
    IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class ServicesByProviderDto {
    @ApiPropertyOptional({
        description: 'Filtrar por tipo de servicio',
        enum: ServiceType
    })
    @IsOptional()
    @IsEnum(ServiceType)
    type?: ServiceType;

    @ApiPropertyOptional({
        description: 'Filtrar por estado del servicio',
        enum: ServiceStatus
    })
    @IsOptional()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus;

    @ApiPropertyOptional({
        description: 'Filtrar solo servicios disponibles',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({
        description: 'Filtrar solo servicios destacados',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        description: 'Filtrar por categoría',
        example: 'Lavado Exterior'
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({
        description: 'Número de página',
        example: 1,
        minimum: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Elementos por página',
        example: 10,
        minimum: 1,
        maximum: 50
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Campo para ordenar',
        example: 'displayOrder',
        enum: ['name', 'price', 'duration', 'createdAt', 'displayOrder']
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'displayOrder';

    @ApiPropertyOptional({
        description: 'Orden de clasificación',
        example: 'asc',
        enum: ['asc', 'desc']
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'asc';
}
