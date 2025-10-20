import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

export class UpdateBookingDto {
    @ApiPropertyOptional({ description: 'Estado de la reserva', enum: BookingStatus })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional({ description: 'Estado del pago', enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Método de pago', enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @ApiPropertyOptional({ description: 'Notas del proveedor' })
    @IsOptional()
    @IsString()
    providerNotes?: string;

    @ApiPropertyOptional({ description: 'Razón de cancelación' })
    @IsOptional()
    @IsString()
    cancellationReason?: string;

    @ApiPropertyOptional({ description: 'ID de transacción del pago' })
    @IsOptional()
    @IsString()
    transactionId?: string;
}
