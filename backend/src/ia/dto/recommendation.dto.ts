import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ServiceType } from '@prisma/client';

export class RecommendationQueryDto {
    @ApiProperty({ description: 'ID del usuario', example: 'user123' })
    @IsUUID()
    userId!: string;

    @ApiPropertyOptional({ description: 'Latitud del usuario', example: -33.4489 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitud del usuario', example: -70.6693 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @ApiPropertyOptional({ description: 'Tipo de servicio preferido', enum: ServiceType })
    @IsOptional()
    @IsEnum(ServiceType)
    preferredServiceType?: ServiceType;

    @ApiPropertyOptional({ description: 'Presupuesto máximo', example: 50000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxBudget?: number;

    @ApiPropertyOptional({ description: 'Radio de búsqueda en km', example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    radiusKm?: number;

    @ApiPropertyOptional({ description: 'Número de recomendaciones', example: 5, minimum: 1, maximum: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(20)
    limit?: number = 5;
}

export class RecommendationItemDto {
    @ApiProperty({ description: 'ID del servicio recomendado' })
    serviceId!: string;

    @ApiProperty({ description: 'Nombre del servicio' })
    serviceName!: string;

    @ApiProperty({ description: 'Tipo de servicio', enum: ServiceType })
    serviceType!: ServiceType;

    @ApiProperty({ description: 'Precio del servicio' })
    price!: number;

    @ApiProperty({ description: 'Precio con descuento (si aplica)' })
    discountedPrice?: number | null;

    @ApiProperty({ description: 'Proveedor' })
    provider!: {
        id: string;
        businessName: string;
        rating: number;
        distanceKm?: number;
    };

    @ApiProperty({ description: 'Puntaje de recomendación (0-1)', example: 0.85 })
    recommendationScore!: number;

    @ApiProperty({ description: 'Razones de la recomendación' })
    reasons!: string[];

    @ApiProperty({ description: 'Descuento disponible', example: 15 })
    discountPercent?: number | null;
}

export class RecommendationResponseDto {
    @ApiProperty({ description: 'Recomendaciones generadas' })
    recommendations!: RecommendationItemDto[];

    @ApiProperty({ description: 'Contexto de la recomendación' })
    context!: {
        userPreferences: string[];
        locationBased: boolean;
        budgetConsidered: boolean;
        personalizedFor: string;
    };

    @ApiProperty({ description: 'Timestamp de generación' })
    generatedAt!: string;
}

export class AnalysisQueryDto {
    @ApiProperty({ description: 'Texto a analizar', example: 'Necesito un lavado completo para mi auto' })
    @IsString()
    text!: string;

    @ApiPropertyOptional({ description: 'Tipo de análisis', enum: ['sentiment', 'intent', 'extract_services', 'extract_preferences'] })
    @IsOptional()
    @IsEnum(['sentiment', 'intent', 'extract_services', 'extract_preferences'])
    analysisType?: 'sentiment' | 'intent' | 'extract_services' | 'extract_preferences' = 'intent';
}

export class AnalysisResponseDto {
    @ApiProperty({ description: 'Resultado del análisis' })
    result!: {
        sentiment?: 'positive' | 'negative' | 'neutral';
        intent?: string;
        extractedServices?: string[];
        extractedPreferences?: string[];
        confidence: number;
    };

    @ApiProperty({ description: 'Sugerencias basadas en el análisis' })
    suggestions?: string[];
}

export class SmartSearchQueryDto {
    @ApiProperty({ description: 'Consulta de búsqueda natural', example: 'Lavado barato cerca de mi casa' })
    @IsString()
    query!: string;

    @ApiPropertyOptional({ description: 'Latitud del usuario', example: -33.4489 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @ApiPropertyOptional({ description: 'Longitud del usuario', example: -70.6693 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @ApiPropertyOptional({ description: 'Número de resultados', example: 10, minimum: 1, maximum: 50 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}

export class SmartSearchResponseDto {
    @ApiProperty({ description: 'Consulta interpretada por IA' })
    interpretedQuery!: string;

    @ApiProperty({ description: 'Filtros aplicados automáticamente' })
    appliedFilters!: {
        serviceTypes?: ServiceType[];
        priceRange?: { min: number; max: number };
        location?: { lat: number; lng: number; radius: number };
        keywords?: string[];
    };

    @ApiProperty({ description: 'Resultados de búsqueda' })
    results!: Array<{
        serviceId: string;
        serviceName: string;
        provider: {
            id: string;
            businessName: string;
            rating: number;
        };
        relevanceScore: number;
        matchReasons: string[];
    }>;

    @ApiProperty({ description: 'Sugerencias de búsqueda' })
    searchSuggestions?: string[];
}
