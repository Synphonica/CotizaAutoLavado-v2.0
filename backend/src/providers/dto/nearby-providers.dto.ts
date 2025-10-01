import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class NearbyProvidersDto {
    @ApiProperty({ example: -33.4489, description: 'Latitud del punto de referencia' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ example: -70.6693, description: 'Longitud del punto de referencia' })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiProperty({ example: 5000, description: 'Radio en metros', required: false })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(100)
    @Max(50000)
    radius?: number = 5000;

    @ApiProperty({ example: 10, description: 'Límite de resultados', required: false })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}
