import {
    IsOptional,
    IsString,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsUUID,
    Min,
    Max,
    IsInt,
    Length
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class QueryServicesDto {
    @ApiPropertyOptional({
        description: 'Búsqueda por nombre, descripción o categoría',
        example: 'lavado premium'
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    search?: string;

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
        description: 'Filtrar por categoría',
        example: 'Lavado Exterior'
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    category?: string;

    @ApiPropertyOptional({
        description: 'Precio mínimo',
        example: 5000,
        minimum: 0
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({
        description: 'Precio máximo',
        example: 50000,
        minimum: 0
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por proveedor específico',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID()
    providerId?: string;

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
        description: 'Filtrar por duración mínima (en minutos)',
        example: 30,
        minimum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(5)
    minDuration?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por duración máxima (en minutos)',
        example: 120,
        minimum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(5)
    maxDuration?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por etiqueta',
        example: 'premium'
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    tag?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por ciudad del proveedor',
        example: 'Santiago'
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    city?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por región del proveedor',
        example: 'Metropolitana'
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    region?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por rating mínimo del proveedor',
        example: 4.0,
        minimum: 0,
        maximum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    minProviderRating?: number;

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
        maximum: 100
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Campo para ordenar',
        example: 'price',
        enum: ['name', 'price', 'duration', 'createdAt', 'updatedAt', 'displayOrder']
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
