import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FavoritesByUserDto {
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
        description: 'Fecha de inicio para filtrar favoritos (ISO 8601)',
        example: '2025-01-01T00:00:00Z'
    })
    @IsDateString()
    @IsOptional()
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin para filtrar favoritos (ISO 8601)',
        example: '2025-12-31T23:59:59Z'
    })
    @IsDateString()
    @IsOptional()
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Campo para ordenar los resultados',
        example: 'addedAt',
        enum: ['addedAt', 'businessName', 'rating']
    })
    @IsString()
    @IsOptional()
    sortBy?: 'addedAt' | 'businessName' | 'rating' = 'addedAt';

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
}
