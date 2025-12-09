import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, ArrayMaxSize, Min, Max } from 'class-validator';

export class AddReviewImageDto {
    @ApiProperty({
        description: 'URL de la imagen',
        example: 'https://example.com/images/review-photo.jpg'
    })
    @IsString()
    @IsNotEmpty()
    url: string;

    @ApiPropertyOptional({
        description: 'Nombre del archivo',
        example: 'foto-lavado.jpg'
    })
    @IsString()
    @IsOptional()
    filename?: string;

    @ApiPropertyOptional({
        description: 'Tipo MIME del archivo',
        example: 'image/jpeg'
    })
    @IsString()
    @IsOptional()
    mimeType?: string;

    @ApiPropertyOptional({
        description: 'Tamaño del archivo en bytes',
        example: 1024000
    })
    @IsInt()
    @IsOptional()
    size?: number;

    @ApiPropertyOptional({
        description: 'Orden de la imagen (0-4)',
        example: 0,
        minimum: 0,
        maximum: 4
    })
    @IsInt()
    @IsOptional()
    @Min(0)
    @Max(4)
    order?: number;
}

export class AddMultipleImagesDto {
    @ApiProperty({
        description: 'Lista de imágenes (máximo 5)',
        type: [AddReviewImageDto],
        maxItems: 5
    })
    @IsArray()
    @ArrayMaxSize(5, { message: 'Máximo 5 imágenes por reseña' })
    images: AddReviewImageDto[];
}

export class ReviewImageResponseDto {
    @ApiProperty({ description: 'ID de la imagen', example: 'img_123456789' })
    id: string;

    @ApiProperty({ description: 'ID de la reseña', example: 'review_123456789' })
    reviewId: string;

    @ApiProperty({ description: 'URL de la imagen' })
    url: string;

    @ApiPropertyOptional({ description: 'Nombre del archivo' })
    filename?: string;

    @ApiPropertyOptional({ description: 'Tipo MIME' })
    mimeType?: string;

    @ApiPropertyOptional({ description: 'Tamaño en bytes' })
    size?: number;

    @ApiProperty({ description: 'Orden de la imagen' })
    order: number;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt: Date;
}

export class ReorderImagesDto {
    @ApiProperty({
        description: 'IDs de las imágenes en el nuevo orden',
        type: [String],
        example: ['img_1', 'img_2', 'img_3']
    })
    @IsArray()
    @IsString({ each: true })
    imageIds: string[];
}
