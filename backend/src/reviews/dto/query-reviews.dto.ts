import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewStatus } from '@prisma/client';

export class QueryReviewsDto {
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
        description: 'ID del usuario para filtrar reseñas',
        example: 'user_123456789'
    })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({
        description: 'ID del proveedor para filtrar reseñas',
        example: 'provider_123456789'
    })
    @IsString()
    @IsOptional()
    providerId?: string;

    @ApiPropertyOptional({
        description: 'ID del servicio para filtrar reseñas',
        example: 'service_123456789'
    })
    @IsString()
    @IsOptional()
    serviceId?: string;

    @ApiPropertyOptional({
        description: 'Estado de la reseña',
        enum: ReviewStatus,
        example: ReviewStatus.APPROVED
    })
    @IsEnum(ReviewStatus)
    @IsOptional()
    status?: ReviewStatus;

    @ApiPropertyOptional({
        description: 'Calificación mínima (1-5)',
        example: 3,
        minimum: 1,
        maximum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional({
        description: 'Calificación máxima (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    maxRating?: number;

    @ApiPropertyOptional({
        description: 'Fecha de inicio para filtrar reseñas (ISO 8601)',
        example: '2025-01-01T00:00:00Z'
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin para filtrar reseñas (ISO 8601)',
        example: '2025-12-31T23:59:59Z'
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Campo para ordenar los resultados',
        example: 'createdAt',
        enum: ['createdAt', 'updatedAt', 'rating', 'publishedAt']
    })
    @IsString()
    @IsOptional()
    sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'publishedAt' = 'createdAt';

    @ApiPropertyOptional({
        description: 'Dirección del ordenamiento',
        example: 'desc',
        enum: ['asc', 'desc']
    })
    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';

    @ApiPropertyOptional({
        description: 'Incluir información del usuario en la respuesta',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    includeUser?: boolean = false;

    @ApiPropertyOptional({
        description: 'Incluir información del proveedor en la respuesta',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    includeProvider?: boolean = false;

    @ApiPropertyOptional({
        description: 'Incluir información del servicio en la respuesta',
        example: true
    })
    @IsOptional()
    @Type(() => Boolean)
    includeService?: boolean = false;
}
