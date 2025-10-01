import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsEnum, Min, Max, IsNotEmpty } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class CreateReviewDto {
    @ApiProperty({
        description: 'ID del usuario que deja la reseña',
        example: 'user_123456789'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'ID del proveedor (autolavado) que se está reseñando',
        example: 'provider_123456789'
    })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiPropertyOptional({
        description: 'ID del servicio específico (opcional)',
        example: 'service_123456789'
    })
    @IsString()
    @IsOptional()
    serviceId?: string;

    @ApiProperty({
        description: 'Calificación general (1-5 estrellas)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiPropertyOptional({
        description: 'Título de la reseña',
        example: 'Excelente servicio de lavado'
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Comentario detallado de la reseña',
        example: 'El servicio fue muy bueno, el personal muy amable y el auto quedó impecable. Recomiendo totalmente este lugar.'
    })
    @IsString()
    @IsOptional()
    comment?: string;

    @ApiPropertyOptional({
        description: 'Calificación de calidad del servicio (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    serviceQuality?: number;

    @ApiPropertyOptional({
        description: 'Calificación de limpieza (1-5)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    cleanliness?: number;

    @ApiPropertyOptional({
        description: 'Calificación de relación precio-calidad (1-5)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    valueForMoney?: number;

    @ApiPropertyOptional({
        description: 'Calificación de amabilidad del personal (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    staffFriendliness?: number;

    @ApiPropertyOptional({
        description: 'Estado de la reseña',
        enum: ReviewStatus,
        example: ReviewStatus.PENDING
    })
    @IsEnum(ReviewStatus)
    @IsOptional()
    status?: ReviewStatus;
}