import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export class FilterBookingDto {
    @ApiPropertyOptional({ description: 'ID del usuario' })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ description: 'ID del proveedor' })
    @IsOptional()
    @IsString()
    providerId?: string;

    @ApiPropertyOptional({ description: 'ID del servicio' })
    @IsOptional()
    @IsString()
    serviceId?: string;

    @ApiPropertyOptional({ description: 'Estado de la reserva', enum: BookingStatus })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ description: 'Estado del pago', enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Fecha de inicio (desde)', example: '2025-10-01' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin (hasta)', example: '2025-10-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}
