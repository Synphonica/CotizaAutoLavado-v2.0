import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class SearchResultDto {
    @ApiProperty({
        description: 'ID del servicio',
        example: 'service_123456789'
    })
    id: string;

    @ApiProperty({
        description: 'Nombre del servicio',
        example: 'Lavado Premium Completo'
    })
    name: string;

    @ApiProperty({
        description: 'Descripción del servicio',
        example: 'Lavado exterior e interior con productos premium'
    })
    description: string;

    @ApiProperty({
        description: 'Tipo de servicio',
        enum: ServiceType,
        example: ServiceType.PREMIUM_WASH
    })
    type: ServiceType;

    @ApiProperty({
        description: 'Categoría del servicio',
        example: 'Lavado Exterior'
    })
    category: string;

    @ApiProperty({
        description: 'Precio del servicio',
        example: 15000
    })
    price: number;

    @ApiPropertyOptional({
        description: 'Precio con descuento',
        example: 12000
    })
    discountedPrice?: number;

    @ApiProperty({
        description: 'Duración estimada en minutos',
        example: 60
    })
    duration: number;

    @ApiProperty({
        description: 'Estado del servicio',
        enum: ServiceStatus,
        example: ServiceStatus.ACTIVE
    })
    status: ServiceStatus;

    @ApiProperty({
        description: 'Si el servicio está disponible',
        example: true
    })
    isAvailable: boolean;

    @ApiProperty({
        description: 'Calificación promedio del servicio',
        example: 4.5
    })
    rating: number;

    @ApiProperty({
        description: 'Número total de reseñas',
        example: 25
    })
    reviewCount: number;

    @ApiPropertyOptional({
        description: 'Distancia desde la ubicación de búsqueda en km',
        example: 2.5
    })
    distance?: number;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2025-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        example: '2025-01-15T10:30:00Z'
    })
    updatedAt: Date;

    // Información del proveedor
    @ApiPropertyOptional({
        description: 'Información del proveedor',
        type: 'object',
        properties: {
            id: { type: 'string', example: 'provider_123456789' },
            businessName: { type: 'string', example: 'AutoLavado Premium' },
            businessType: { type: 'string', example: 'Autolavado' },
            address: { type: 'string', example: 'Av. Providencia 1234' },
            city: { type: 'string', example: 'Santiago' },
            region: { type: 'string', example: 'Metropolitana' },
            phone: { type: 'string', example: '+56912345678' },
            email: { type: 'string', example: 'contacto@autolavado.cl' },
            rating: { type: 'number', example: 4.8 },
            reviewCount: { type: 'number', example: 150 },
            isVerified: { type: 'boolean', example: true },
            latitude: { type: 'number', example: -33.4489 },
            longitude: { type: 'number', example: -70.6693 }
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
        isVerified: boolean;
        latitude: number;
        longitude: number;
    };

    // Imágenes del servicio
    @ApiPropertyOptional({
        description: 'Imágenes del servicio',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'image_123' },
                url: { type: 'string', example: 'https://example.com/image.jpg' },
                alt: { type: 'string', example: 'Lavado premium' },
                isMain: { type: 'boolean', example: true }
            }
        }
    })
    images?: Array<{
        id: string;
        url: string;
        alt?: string;
        isMain: boolean;
    }>;

    // Reseñas recientes (opcional)
    @ApiPropertyOptional({
        description: 'Reseñas recientes del servicio',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'review_123' },
                rating: { type: 'number', example: 5 },
                comment: { type: 'string', example: 'Excelente servicio' },
                createdAt: { type: 'string', example: '2025-01-15T10:30:00Z' },
                user: {
                    type: 'object',
                    properties: {
                        firstName: { type: 'string', example: 'Juan' },
                        lastName: { type: 'string', example: 'Pérez' }
                    }
                }
            }
        }
    })
    reviews?: Array<{
        id: string;
        rating: number;
        comment?: string;
        createdAt: Date;
        user: {
            firstName: string;
            lastName: string;
        };
    }>;

    // Información de descuentos/promociones
    @ApiPropertyOptional({
        description: 'Información de descuentos activos',
        type: 'object',
        properties: {
            hasDiscount: { type: 'boolean', example: true },
            discountPercentage: { type: 'number', example: 20 },
            originalPrice: { type: 'number', example: 15000 },
            validUntil: { type: 'string', example: '2025-02-15T23:59:59Z' }
        }
    })
    discountInfo?: {
        hasDiscount: boolean;
        discountPercentage?: number;
        originalPrice?: number;
        validUntil?: Date;
    };
}
