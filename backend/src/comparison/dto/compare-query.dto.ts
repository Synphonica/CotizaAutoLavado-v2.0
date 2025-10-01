import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ServiceStatus, ServiceType } from '@prisma/client';

export class CompareQueryDto {
    @ApiPropertyOptional({ description: 'Texto de búsqueda (nombre, descripción, categoría)', example: 'premium' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Tipo de servicio', enum: ServiceType })
    @IsOptional()
    @IsEnum(ServiceType)
    type?: ServiceType;

    @ApiPropertyOptional({ description: 'Categoría', example: 'Lavado Exterior' })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({ description: 'Estado del servicio', enum: ServiceStatus, default: 'ACTIVE' })
    @IsOptional()
    @IsEnum(ServiceStatus)
    status?: ServiceStatus = ServiceStatus.ACTIVE;

    @ApiPropertyOptional({ description: 'Precio mínimo', example: 5000, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({ description: 'Precio máximo', example: 30000, minimum: 0 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Latitud del usuario', example: -33.4489 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitud del usuario', example: -70.6693 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @ApiPropertyOptional({ description: 'Radio máximo en km', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    maxDistanceKm?: number;

    @ApiPropertyOptional({ description: 'Filtrar solo disponibles', example: true })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Ciudad del proveedor', example: 'Santiago' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({ description: 'Región del proveedor', example: 'Metropolitana' })
    @IsOptional()
    @IsString()
    region?: string;

    @ApiPropertyOptional({ description: 'Ordenar por', enum: ['effectivePrice', 'distance', 'rating', 'discount', 'duration', 'score'] })
    @IsOptional()
    @IsString()
    sortBy?: 'effectivePrice' | 'distance' | 'rating' | 'discount' | 'duration' | 'score' = 'effectivePrice';

    @ApiPropertyOptional({ description: 'Orden', enum: ['asc', 'desc'], default: 'asc' })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'asc';

    @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Límite por página', example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}

export class ComparisonItemDto {
    @ApiPropertyOptional({ description: 'ID del servicio' })
    id!: string;

    @ApiPropertyOptional({ description: 'Nombre del servicio' })
    name!: string;

    @ApiPropertyOptional({ description: 'Tipo de servicio', enum: ServiceType })
    type!: ServiceType;

    @ApiPropertyOptional({ description: 'Precio base' })
    price!: number;

    @ApiPropertyOptional({ description: 'Precio con descuento (si aplica)' })
    discountedPrice?: number | null;

    @ApiPropertyOptional({ description: 'Precio efectivo usado para comparar' })
    effectivePrice!: number;

    @ApiPropertyOptional({ description: 'Moneda', example: 'CLP' })
    currency!: string;

    @ApiPropertyOptional({ description: 'Duración en minutos' })
    duration!: number;

    @ApiPropertyOptional({ description: 'Categoría', nullable: true })
    category?: string | null;

    @ApiPropertyOptional({ description: 'Proveedor' })
    provider!: {
        id: string;
        businessName: string;
        rating: number;
        latitude: number;
        longitude: number;
        city: string;
        region: string;
    };

    @ApiPropertyOptional({ description: 'Distancia en km desde el usuario (si se entregó ubicación)' })
    distanceKm?: number;

    @ApiPropertyOptional({ description: 'Porcentaje de descuento aproximado', nullable: true })
    discountPercent?: number | null;

    @ApiPropertyOptional({ description: 'Puntaje combinado (mayor es mejor)', example: 0.82 })
    score?: number;
}

export class ComparisonResponseDto {
    @ApiPropertyOptional({ description: 'Página actual' })
    page!: number;

    @ApiPropertyOptional({ description: 'Límite por página' })
    limit!: number;

    @ApiPropertyOptional({ description: 'Total de resultados' })
    total!: number;

    @ApiPropertyOptional({ description: 'Resultados' })
    results!: ComparisonItemDto[];
}


