import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsEnum, IsBoolean, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '@prisma/client';

export class NearbySearchDto {
    @ApiProperty({
        description: 'Latitud de la ubicación de búsqueda',
        example: -33.4489
    })
    @IsNumber()
    @Type(() => Number)
    latitude: number;

    @ApiProperty({
        description: 'Longitud de la ubicación de búsqueda',
        example: -70.6693
    })
    @IsNumber()
    @Type(() => Number)
    longitude: number;

    @ApiPropertyOptional({
        description: 'Radio de búsqueda en kilómetros',
        example: 5,
        minimum: 1,
        maximum: 50
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    @IsOptional()
    radius?: number = 5;

    @ApiPropertyOptional({
        description: 'Tipo de servicio',
        enum: ServiceType,
        example: ServiceType.PREMIUM_WASH
    })
    @IsEnum(ServiceType)
    @IsOptional()
    serviceType?: ServiceType;

    @ApiPropertyOptional({
        description: 'Precio máximo',
        example: 20000,
        minimum: 0
    })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    maxPrice?: number;

    @ApiPropertyOptional({
        description: 'Calificación mínima',
        example: 4.0,
        minimum: 1,
        maximum: 5
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(5)
    @IsOptional()
    minRating?: number;

    @ApiPropertyOptional({
        description: 'Solo servicios disponibles',
        example: true
    })
    @IsBoolean()
    @IsOptional()
    availableOnly?: boolean = true;

    @ApiPropertyOptional({
        description: 'Solo proveedores verificados',
        example: false
    })
    @IsBoolean()
    @IsOptional()
    verifiedOnly?: boolean = false;

    @ApiPropertyOptional({
        description: 'Página actual para paginación',
        example: 1,
        minimum: 1
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Número de elementos por página',
        example: 20,
        minimum: 1,
        maximum: 100
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Campo para ordenar los resultados',
        example: 'distance',
        enum: ['distance', 'price', 'rating', 'name']
    })
    @IsString()
    @IsOptional()
    sortBy?: 'distance' | 'price' | 'rating' | 'name' = 'distance';

    @ApiPropertyOptional({
        description: 'Dirección del ordenamiento',
        example: 'asc',
        enum: ['asc', 'desc']
    })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'asc';
}
