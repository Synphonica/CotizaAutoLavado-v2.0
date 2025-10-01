import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ReviewStatus } from '@prisma/client';

export class UpdateReviewStatusDto {
    @ApiProperty({
        description: 'Nuevo estado de la reseña',
        enum: ReviewStatus,
        example: ReviewStatus.APPROVED
    })
    @IsEnum(ReviewStatus)
    status: ReviewStatus;

    @ApiPropertyOptional({
        description: 'Fecha de publicación (si se aprueba)',
        example: '2025-01-15T10:30:00Z'
    })
    @IsDateString()
    @IsOptional()
    publishedAt?: string;
}
