import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class ServiceResponseDto {
    @ApiProperty({
        description: 'ID único del servicio',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'ID del proveedor que ofrece el servicio',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    providerId: string;

    @ApiProperty({
        description: 'Nombre del servicio',
        example: 'Lavado Premium'
    })
    name: string;

    @ApiProperty({
        description: 'Descripción detallada del servicio',
        example: 'Lavado completo con cera y aspirado interior'
    })
    description: string;

    @ApiProperty({
        description: 'Tipo de servicio',
        enum: ServiceType,
        example: ServiceType.PREMIUM_WASH
    })
    type: ServiceType;

    @ApiProperty({
        description: 'Precio del servicio en pesos chilenos',
        example: 15000
    })
    price: number;

    @ApiPropertyOptional({
        description: 'Precio con descuento',
        example: 12000
    })
    discountedPrice?: number;

    @ApiProperty({
        description: 'Duración estimada del servicio en minutos',
        example: 45
    })
    duration: number;

    @ApiProperty({
        description: 'Estado del servicio',
        enum: ServiceStatus,
        example: ServiceStatus.ACTIVE
    })
    status: ServiceStatus;

    @ApiProperty({
        description: 'Si el servicio está disponible para reservas',
        example: true
    })
    isAvailable: boolean;

    @ApiPropertyOptional({
        description: 'Categoría del servicio',
        example: 'Lavado Exterior'
    })
    category?: string;

    @ApiPropertyOptional({
        description: 'Etiquetas del servicio',
        example: ['premium', 'express', 'interior'],
        type: [String]
    })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'URL de imagen principal del servicio',
        example: 'https://example.com/service-image.jpg'
    })
    imageUrl?: string;

    @ApiPropertyOptional({
        description: 'URLs de imágenes adicionales del servicio',
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        type: [String]
    })
    additionalImages?: string[];

    @ApiPropertyOptional({
        description: 'Servicios incluidos en este paquete',
        example: ['Lavado exterior', 'Aspirado interior', 'Limpieza de vidrios'],
        type: [String]
    })
    includedServices?: string[];

    @ApiPropertyOptional({
        description: 'Requisitos o restricciones del servicio',
        example: 'Vehículo debe estar en buen estado general'
    })
    requirements?: string;

    @ApiProperty({
        description: 'Si el servicio requiere cita previa',
        example: true
    })
    requiresAppointment: boolean;

    @ApiPropertyOptional({
        description: 'Tiempo mínimo de anticipación para reservar (en horas)',
        example: 2
    })
    minAdvanceBooking?: number;

    @ApiPropertyOptional({
        description: 'Tiempo máximo de anticipación para reservar (en horas)',
        example: 72
    })
    maxAdvanceBooking?: number;

    @ApiPropertyOptional({
        description: 'Capacidad máxima de vehículos por turno',
        example: 1
    })
    maxCapacity?: number;

    @ApiProperty({
        description: 'Si el servicio está destacado',
        example: false
    })
    isFeatured: boolean;

    @ApiPropertyOptional({
        description: 'Orden de visualización del servicio',
        example: 1
    })
    displayOrder?: number;

    @ApiProperty({
        description: 'Fecha de creación del servicio',
        example: '2024-01-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Fecha de última actualización del servicio',
        example: '2024-01-15T10:30:00Z'
    })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'Fecha de eliminación del servicio (soft delete)',
        example: null
    })
    deletedAt?: Date;

    // Información del proveedor
    @ApiPropertyOptional({
        description: 'Información básica del proveedor'
    })
    provider?: {
        id: string;
        businessName: string;
        businessType: string;
        city: string;
        region: string;
        rating: number;
        reviewCount: number;
    };

    // Estadísticas del servicio
    @ApiPropertyOptional({
        description: 'Estadísticas del servicio'
    })
    stats?: {
        totalBookings: number;
        averageRating: number;
        reviewCount: number;
        lastBookingDate?: Date;
    };
}

export class ServiceListResponseDto {
    @ApiProperty({
        description: 'Lista de servicios',
        type: [ServiceResponseDto]
    })
    services: ServiceResponseDto[];

    @ApiProperty({
        description: 'Información de paginación'
    })
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };

    @ApiPropertyOptional({
        description: 'Filtros aplicados'
    })
    filters?: {
        search?: string;
        type?: ServiceType;
        status?: ServiceStatus;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        providerId?: string;
        isAvailable?: boolean;
        isFeatured?: boolean;
    };
}
