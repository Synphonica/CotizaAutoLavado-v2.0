import { IsOptional, IsString, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ProviderStatus } from '@prisma/client';

export class QueryProvidersDto {
    @ApiProperty({ required: false, example: 'Autolavado' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({ enum: ProviderStatus, required: false })
    @IsOptional()
    @IsEnum(ProviderStatus)
    status?: ProviderStatus;

    @ApiProperty({ required: false, example: 'Santiago' })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiProperty({ required: false, example: 'Metropolitana' })
    @IsOptional()
    @IsString()
    region?: string;

    @ApiProperty({ required: false, example: -33.4489 })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    latitude?: number;

    @ApiProperty({ required: false, example: -70.6693 })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    longitude?: number;

    @ApiProperty({ required: false, example: 5000, description: 'Radio en metros' })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(100)
    @Max(50000)
    radius?: number;

    @ApiProperty({ required: false, example: 4.0, description: 'Rating mínimo' })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(5)
    minRating?: number;

    @ApiProperty({ required: false, example: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    acceptsBookings?: boolean;

    @ApiProperty({ required: false, example: 1, minimum: 1 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, example: 10, minimum: 1, maximum: 100 })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({ required: false, example: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiProperty({ required: false, example: 'desc', enum: ['asc', 'desc'] })
    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc' = 'desc';
}
