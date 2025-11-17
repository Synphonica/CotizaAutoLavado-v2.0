import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, IsBoolean, Min, Max, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class SearchQueryDto {
    @ApiProperty({
        description: 'Término de búsqueda (nombre del servicio, proveedor, etc.)',
        example: 'lavado premium',
        maxLength: 200
    })
    @IsString()
    @MaxLength(200, { message: 'El término de búsqueda no puede exceder 200 caracteres' })
    @Transform(({ value }) => value?.trim())
    query: string;

    @ApiPropertyOptional({
        description: 'Latitud para búsqueda por proximidad',
        example: -33.4489
    })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    latitude?: number;

    @ApiPropertyOptional({
        description: 'Longitud para búsqueda por proximidad',
        example: -70.6693
    })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    longitude?: number;

    @ApiPropertyOptional({
        description: 'Radio de búsqueda en kilómetros',
        example: 10,
        minimum: 1,
        maximum: 100
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    @IsOptional()
    radius?: number = 10;

    @ApiPropertyOptional({
        description: 'Ciudad para filtrar resultados',
        example: 'Santiago',
        maxLength: 100
    })
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({
        description: 'Región para filtrar resultados',
        example: 'Metropolitana',
        maxLength: 100
    })
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    @IsOptional()
    region?: string;

    @ApiPropertyOptional({
        description: 'Tipo de servicio',
        enum: ServiceType,
        example: ServiceType.PREMIUM_WASH
    })
    @IsEnum(ServiceType)
    @IsOptional()
    serviceType?: ServiceType;

    @ApiPropertyOptional({
        description: 'Tipos de servicio (múltiples)',
        enum: ServiceType,
        isArray: true,
        example: [ServiceType.PREMIUM_WASH, ServiceType.DETAILING]
    })
    @IsArray()
    @IsEnum(ServiceType, { each: true })
    @IsOptional()
    serviceTypes?: ServiceType[];

    @ApiPropertyOptional({
        description: 'Precio mínimo',
        example: 5000,
        minimum: 0
    })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    minPrice?: number;

    @ApiPropertyOptional({
        description: 'Precio máximo',
        example: 50000,
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
        example: true
    })
    @IsBoolean()
    @IsOptional()
    verifiedOnly?: boolean = false;

    @ApiPropertyOptional({
        description: 'Solo servicios con descuentos',
        example: false
    })
    @IsBoolean()
    @IsOptional()
    hasDiscounts?: boolean = false;

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
        example: 'relevance',
        enum: ['relevance', 'price', 'rating', 'distance', 'name', 'createdAt']
    })
    @IsString()
    @IsOptional()
    sortBy?: 'relevance' | 'price' | 'rating' | 'distance' | 'name' | 'createdAt' = 'relevance';

    @ApiPropertyOptional({
        description: 'Dirección del ordenamiento',
        example: 'asc',
        enum: ['asc', 'desc']
    })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'asc';

    @ApiPropertyOptional({
        description: 'Incluir información del proveedor en la respuesta',
        example: true
    })
    @IsBoolean()
    @IsOptional()
    includeProvider?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir imágenes en la respuesta',
        example: true
    })
    @IsBoolean()
    @IsOptional()
    includeImages?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir reseñas en la respuesta',
        example: false
    })
    @IsBoolean()
    @IsOptional()
    includeReviews?: boolean = false;
}
