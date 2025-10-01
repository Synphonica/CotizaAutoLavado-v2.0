import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsArray,
    IsUUID,
    Min,
    Max,
    Length,
    IsUrl,
    ValidateNested,
    IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType, ServiceStatus } from '@prisma/client';

export class CreateServiceDto {
    @ApiProperty({
        description: 'ID del proveedor que ofrece el servicio',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    providerId: string;

    @ApiProperty({
        description: 'Nombre del servicio',
        example: 'Lavado Premium',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @Length(2, 100)
    name: string;

    @ApiProperty({
        description: 'Descripción detallada del servicio',
        example: 'Lavado completo con cera y aspirado interior',
        maxLength: 500
    })
    @IsString()
    @Length(1, 500)
    description: string;

    @ApiProperty({
        description: 'Tipo de servicio',
        enum: ServiceType,
        example: ServiceType.PREMIUM_WASH
    })
    @IsEnum(ServiceType)
    type: ServiceType;

    @ApiProperty({
        description: 'Precio del servicio en pesos chilenos',
        example: 15000,
        minimum: 0
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({
        description: 'Precio con descuento (opcional)',
        example: 12000,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discountedPrice?: number;

    @ApiProperty({
        description: 'Duración estimada del servicio en minutos',
        example: 45,
        minimum: 5,
        maximum: 480
    })
    @IsInt()
    @Min(5)
    @Max(480)
    duration: number;

    @ApiProperty({
        description: 'Estado del servicio',
        enum: ServiceStatus,
        example: ServiceStatus.ACTIVE
    })
    @IsEnum(ServiceStatus)
    status: ServiceStatus;

    @ApiPropertyOptional({
        description: 'Si el servicio está disponible para reservas',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({
        description: 'Categoría del servicio',
        example: 'Lavado Exterior',
        maxLength: 50
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    category?: string;

    @ApiPropertyOptional({
        description: 'Etiquetas del servicio',
        example: ['premium', 'express', 'interior'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({
        description: 'URL de imagen principal del servicio',
        example: 'https://example.com/service-image.jpg'
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiPropertyOptional({
        description: 'URLs de imágenes adicionales del servicio',
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsUrl({}, { each: true })
    additionalImages?: string[];

    @ApiPropertyOptional({
        description: 'Servicios incluidos en este paquete',
        example: ['Lavado exterior', 'Aspirado interior', 'Limpieza de vidrios'],
        type: [String]
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    includedServices?: string[];

    @ApiPropertyOptional({
        description: 'Requisitos o restricciones del servicio',
        example: 'Vehículo debe estar en buen estado general',
        maxLength: 200
    })
    @IsOptional()
    @IsString()
    @Length(1, 200)
    requirements?: string;

    @ApiPropertyOptional({
        description: 'Si el servicio requiere cita previa',
        example: true,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    requiresAppointment?: boolean;

    @ApiPropertyOptional({
        description: 'Tiempo mínimo de anticipación para reservar (en horas)',
        example: 2,
        minimum: 0,
        maximum: 168
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(168)
    minAdvanceBooking?: number;

    @ApiPropertyOptional({
        description: 'Tiempo máximo de anticipación para reservar (en horas)',
        example: 72,
        minimum: 0,
        maximum: 720
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(720)
    maxAdvanceBooking?: number;

    @ApiPropertyOptional({
        description: 'Capacidad máxima de vehículos por turno',
        example: 1,
        minimum: 1,
        maximum: 10
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    maxCapacity?: number;

    @ApiPropertyOptional({
        description: 'Si el servicio está destacado',
        example: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @ApiPropertyOptional({
        description: 'Orden de visualización del servicio',
        example: 1,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;
}
