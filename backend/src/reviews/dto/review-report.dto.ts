import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum ReviewReportReason {
    SPAM = 'SPAM',
    OFFENSIVE = 'OFFENSIVE',
    FAKE = 'FAKE',
    IRRELEVANT = 'IRRELEVANT',
    HARASSMENT = 'HARASSMENT',
    PERSONAL_INFO = 'PERSONAL_INFO',
    OTHER = 'OTHER'
}

export enum ReportStatus {
    PENDING = 'PENDING',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
    ACTION_TAKEN = 'ACTION_TAKEN',
    DISMISSED = 'DISMISSED'
}

export class CreateReviewReportDto {
    @ApiProperty({
        description: 'Razón del reporte',
        enum: ReviewReportReason,
        example: ReviewReportReason.SPAM
    })
    @IsEnum(ReviewReportReason)
    @IsNotEmpty()
    reason: ReviewReportReason;

    @ApiPropertyOptional({
        description: 'Detalles adicionales del reporte',
        example: 'Esta reseña parece ser publicidad encubierta de otro negocio.',
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    details?: string;
}

export class UpdateReportStatusDto {
    @ApiProperty({
        description: 'Nuevo estado del reporte',
        enum: ReportStatus,
        example: ReportStatus.RESOLVED
    })
    @IsEnum(ReportStatus)
    @IsNotEmpty()
    status: ReportStatus;

    @ApiPropertyOptional({
        description: 'Resolución o nota del administrador',
        example: 'Se verificó que la reseña es legítima.',
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    resolution?: string;
}

export class ReviewReportResponseDto {
    @ApiProperty({ description: 'ID del reporte', example: 'report_123456789' })
    id: string;

    @ApiProperty({ description: 'ID de la reseña reportada', example: 'review_123456789' })
    reviewId: string;

    @ApiProperty({ description: 'ID del usuario que reportó', example: 'user_123456789' })
    userId: string;

    @ApiProperty({ description: 'Razón del reporte', enum: ReviewReportReason })
    reason: ReviewReportReason;

    @ApiPropertyOptional({ description: 'Detalles del reporte' })
    details?: string;

    @ApiProperty({ description: 'Estado del reporte', enum: ReportStatus })
    status: ReportStatus;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt: Date;

    @ApiPropertyOptional({ description: 'Fecha de resolución' })
    resolvedAt?: Date;

    @ApiPropertyOptional({ description: 'ID del admin que resolvió' })
    resolvedBy?: string;

    @ApiPropertyOptional({ description: 'Resolución' })
    resolution?: string;
}

export class QueryReportsDto {
    @ApiPropertyOptional({ description: 'Página', example: 1 })
    page?: number;

    @ApiPropertyOptional({ description: 'Límite por página', example: 10 })
    limit?: number;

    @ApiPropertyOptional({ description: 'Estado del reporte', enum: ReportStatus })
    status?: ReportStatus;

    @ApiPropertyOptional({ description: 'Razón del reporte', enum: ReviewReportReason })
    reason?: ReviewReportReason;
}
