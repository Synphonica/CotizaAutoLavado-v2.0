import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ReviewResponseDto {
    @ApiProperty({
        description: 'ID único de la reseña',
        example: 'review_123456789'
    })
    id: string;

    @ApiProperty({
        description: 'ID del usuario que dejó la reseña',
        example: 'user_123456789'
    })
    userId: string;

    @ApiProperty({
        description: 'ID del proveedor (autolavado)',
        example: 'provider_123456789'
    })
    providerId: string;

    @ApiPropertyOptional({
        description: 'ID del servicio específico',
        example: 'service_123456789'
    })
    serviceId?: string;

    @ApiProperty({
        description: 'Estado de la reseña',
        enum: ReviewStatus,
        example: ReviewStatus.APPROVED
    })
    status: ReviewStatus;

    @ApiProperty({
        description: 'Calificación general (1-5 estrellas)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    rating: number;

    @ApiPropertyOptional({
        description: 'Título de la reseña',
        example: 'Excelente servicio de lavado'
    })
    title?: string;

    @ApiPropertyOptional({
        description: 'Comentario detallado de la reseña',
        example: 'El servicio fue muy bueno, el personal muy amable y el auto quedó impecable.'
    })
    comment?: string;

    @ApiPropertyOptional({
        description: 'Calificación de calidad del servicio (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    serviceQuality?: number;

    @ApiPropertyOptional({
        description: 'Calificación de limpieza (1-5)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    cleanliness?: number;

    @ApiPropertyOptional({
        description: 'Calificación de relación precio-calidad (1-5)',
        example: 4,
        minimum: 1,
        maximum: 5
    })
    valueForMoney?: number;

    @ApiPropertyOptional({
        description: 'Calificación de amabilidad del personal (1-5)',
        example: 5,
        minimum: 1,
        maximum: 5
    })
    staffFriendliness?: number;

    @ApiProperty({
        description: 'Fecha de creación de la reseña',
        example: '2025-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2025-01-15T10:30:00Z'
    })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'Fecha de publicación de la reseña',
        example: '2025-01-15T10:30:00Z'
    })
    publishedAt?: Date;

    // Información del usuario (opcional, para respuestas detalladas)
    @ApiPropertyOptional({
        description: 'Información del usuario que dejó la reseña',
        type: 'object',
        properties: {
            id: { type: 'string', example: 'user_123456789' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' }
        }
    })
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };

    // Información del proveedor (opcional, para respuestas detalladas)
    @ApiPropertyOptional({
        description: 'Información del proveedor reseñado',
        type: 'object',
        properties: {
            id: { type: 'string', example: 'provider_123456789' },
            businessName: { type: 'string', example: 'AutoLavado Premium' }
        }
    })
    provider?: {
        id: string;
        businessName: string;
    };

    // Información del servicio (opcional, para respuestas detalladas)
    @ApiPropertyOptional({
        description: 'Información del servicio reseñado',
        type: 'object',
        properties: {
            id: { type: 'string', example: 'service_123456789' },
            name: { type: 'string', example: 'Lavado Premium' },
            type: { type: 'string', example: 'PREMIUM_WASH' }
        }
    })
    service?: {
        id: string;
        name: string;
        type: string;
    };
}
