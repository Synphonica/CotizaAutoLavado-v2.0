import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteResponseDto {
    @ApiProperty({
        description: 'ID único del favorito',
        example: 'favorite_123456789'
    })
    id: string;

    @ApiProperty({
        description: 'ID del usuario que marcó como favorito',
        example: 'user_123456789'
    })
    userId: string;

    @ApiProperty({
        description: 'ID del proveedor marcado como favorito',
        example: 'provider_123456789'
    })
    providerId: string;

    @ApiProperty({
        description: 'Fecha en que se marcó como favorito',
        example: '2025-01-15T10:30:00Z'
    })
    addedAt: Date;

    // Información del usuario (opcional, para respuestas detalladas)
    @ApiPropertyOptional({
        description: 'Información del usuario que marcó como favorito',
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
        description: 'Información del proveedor marcado como favorito',
        type: 'object',
        properties: {
            id: { type: 'string', example: 'provider_123456789' },
            businessName: { type: 'string', example: 'AutoLavado Premium' },
            businessType: { type: 'string', example: 'Autolavado' },
            address: { type: 'string', example: 'Av. Principal 123, Santiago' },
            city: { type: 'string', example: 'Santiago' },
            region: { type: 'string', example: 'Metropolitana' },
            phone: { type: 'string', example: '+56 9 1234 5678' },
            email: { type: 'string', example: 'contacto@autolavado.com' },
            rating: { type: 'number', example: 4.5 },
            reviewCount: { type: 'number', example: 25 },
            status: { type: 'string', example: 'ACTIVE' }
        }
    })
    provider?: {
        id: string;
        businessName: string;
        businessType: string;
        address: string;
        city: string;
        region: string;
        phone: string;
        email: string;
        rating: number;
        reviewCount: number;
        status: string;
    };
}
