import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GeocodeQueryDto {
    @ApiProperty({ description: 'Dirección a geocodificar', example: 'Av. Libertador Bernardo O Higgins 1111, Santiago' })
    @IsString()
    address!: string;
}

export class ReverseGeocodeQueryDto {
    @ApiProperty({ description: 'Latitud', example: -33.4489 })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    lat!: number;

    @ApiProperty({ description: 'Longitud', example: -70.6693 })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    lng!: number;
}

export class AutocompleteQueryDto {
    @ApiProperty({ description: 'Texto de búsqueda', example: 'autolavado' })
    @IsString()
    input!: string;

    @ApiPropertyOptional({ description: 'Latitud de ubicación sesgada', example: -33.4489 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lat?: number;

    @ApiPropertyOptional({ description: 'Longitud de ubicación sesgada', example: -70.6693 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    lng?: number;

    @ApiPropertyOptional({ description: 'Radio en metros para sesgo', example: 10000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    radius?: number;
}

export class DistanceQueryDto {
    @ApiProperty({ description: 'Latitud origen', example: -33.45 })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    originLat!: number;

    @ApiProperty({ description: 'Longitud origen', example: -70.66 })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    originLng!: number;

    @ApiProperty({ description: 'Latitud destino', example: -33.42 })
    @Type(() => Number)
    @IsNumber()
    @Min(-90)
    @Max(90)
    destLat!: number;

    @ApiProperty({ description: 'Longitud destino', example: -70.61 })
    @Type(() => Number)
    @IsNumber()
    @Min(-180)
    @Max(180)
    destLng!: number;
}


