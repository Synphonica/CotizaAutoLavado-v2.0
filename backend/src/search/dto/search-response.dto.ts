import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchResultDto } from './search-result.dto';

export class SearchResponseDto {
    @ApiProperty({
        description: 'Resultados de la búsqueda',
        type: [SearchResultDto]
    })
    results: SearchResultDto[];

    @ApiProperty({
        description: 'Número total de resultados encontrados',
        example: 45
    })
    total: number;

    @ApiProperty({
        description: 'Página actual',
        example: 1
    })
    page: number;

    @ApiProperty({
        description: 'Elementos por página',
        example: 20
    })
    limit: number;

    @ApiProperty({
        description: 'Número total de páginas',
        example: 3
    })
    totalPages: number;

    @ApiProperty({
        description: 'Término de búsqueda utilizado',
        example: 'lavado premium'
    })
    query: string;

    @ApiPropertyOptional({
        description: 'Filtros aplicados en la búsqueda',
        type: 'object',
        properties: {
            serviceType: { type: 'string', example: 'PREMIUM_WASH' },
            minPrice: { type: 'number', example: 5000 },
            maxPrice: { type: 'number', example: 50000 },
            minRating: { type: 'number', example: 4.0 },
            city: { type: 'string', example: 'Santiago' },
            radius: { type: 'number', example: 10 }
        }
    })
    filters?: {
        serviceType?: string;
        minPrice?: number;
        maxPrice?: number;
        minRating?: number;
        city?: string;
        radius?: number;
    };

    @ApiProperty({
        description: 'Tiempo de ejecución de la búsqueda en milisegundos',
        example: 150
    })
    executionTime: number;

    @ApiPropertyOptional({
        description: 'Sugerencias de búsqueda relacionadas',
        type: 'array',
        items: { type: 'string' },
        example: ['lavado básico', 'detailing', 'encerado']
    })
    suggestions?: string[];

    @ApiPropertyOptional({
        description: 'Estadísticas de la búsqueda',
        type: 'object',
        properties: {
            averagePrice: { type: 'number', example: 12500 },
            averageRating: { type: 'number', example: 4.2 },
            priceRange: {
                type: 'object',
                properties: {
                    min: { type: 'number', example: 5000 },
                    max: { type: 'number', example: 25000 }
                }
            },
            serviceTypes: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', example: 'PREMIUM_WASH' },
                        count: { type: 'number', example: 15 }
                    }
                }
            }
        }
    })
    statistics?: {
        averagePrice: number;
        averageRating: number;
        priceRange: {
            min: number;
            max: number;
        };
        serviceTypes: Array<{
            type: string;
            count: number;
        }>;
    };
}
