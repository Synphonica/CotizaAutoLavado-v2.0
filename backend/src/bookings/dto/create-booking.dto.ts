import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsDateString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsObject,
    IsEmail,
    Min,
} from 'class-validator';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreateBookingDto {
    @ApiProperty({ description: 'ID del usuario que hace la reserva' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'ID del proveedor' })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({ description: 'ID del servicio' })
    @IsString()
    @IsNotEmpty()
    serviceId: string;

    @ApiProperty({ description: 'Fecha de la reserva', example: '2025-10-15' })
    @IsDateString()
    @IsNotEmpty()
    bookingDate: string;

    @ApiProperty({ description: 'Hora de inicio', example: '2025-10-15T09:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'Hora de fin', example: '2025-10-15T10:30:00Z' })
    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ description: 'Nombre del cliente' })
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @ApiProperty({ description: 'Teléfono del cliente', example: '+56912345678' })
    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @ApiProperty({ description: 'Email del cliente' })
    @IsEmail()
    @IsNotEmpty()
    customerEmail: string;

    @ApiPropertyOptional({
        description: 'Información del vehículo',
        example: { brand: 'Toyota', model: 'Corolla', year: 2020, plate: 'AB1234' },
    })
    @IsOptional()
    @IsObject()
    vehicleInfo?: {
        brand?: string;
        model?: string;
        year?: number;
        plate?: string;
        color?: string;
        type?: string; // sedan, suv, truck, etc.
    };

    @ApiProperty({ description: 'Nombre del servicio' })
    @IsString()
    @IsNotEmpty()
    serviceName: string;

    @ApiProperty({ description: 'Duración del servicio en minutos', example: 90 })
    @IsNumber()
    @Min(1)
    serviceDuration: number;

    @ApiProperty({ description: 'Precio total del servicio' })
    @IsNumber()
    @Min(0)
    totalPrice: number;

    @ApiPropertyOptional({ description: 'Moneda', example: 'CLP', default: 'CLP' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ description: 'Método de pago' })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Notas adicionales del cliente' })
    @IsOptional()
    @IsString()
    customerNotes?: string;
}
