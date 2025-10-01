import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchSuggestionsDto {
    @ApiProperty({
        description: 'Término de búsqueda para obtener sugerencias',
        example: 'lav'
    })
    @IsString()
    query: string;

    @ApiPropertyOptional({
        description: 'Número máximo de sugerencias a retornar',
        example: 10,
        minimum: 1,
        maximum: 50
    })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Tipo de sugerencias a buscar',
        example: 'services',
        enum: ['services', 'providers', 'all']
    })
    @IsString()
    @IsOptional()
    type?: 'services' | 'providers' | 'all' = 'all';

    @ApiPropertyOptional({
        description: 'Latitud para sugerencias por proximidad',
        example: -33.4489
    })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    latitude?: number;

    @ApiPropertyOptional({
        description: 'Longitud para sugerencias por proximidad',
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
}

export class SearchSuggestionDto {
    @ApiProperty({
        description: 'Texto de la sugerencia',
        example: 'Lavado Premium Completo'
    })
    text: string;

    @ApiProperty({
        description: 'Tipo de sugerencia',
        example: 'service',
        enum: ['service', 'provider', 'category']
    })
    type: 'service' | 'provider' | 'category';

    @ApiProperty({
        description: 'ID del elemento sugerido',
        example: 'service_123456789'
    })
    id: string;

    @ApiPropertyOptional({
        description: 'Información adicional de la sugerencia',
        type: 'object',
        properties: {
            businessName: { type: 'string', example: 'AutoLavado Premium' },
            city: { type: 'string', example: 'Santiago' },
            price: { type: 'number', example: 15000 },
            rating: { type: 'number', example: 4.5 }
        }
    })
    metadata?: {
        businessName?: string;
        city?: string;
        price?: number;
        rating?: number;
    };
}
