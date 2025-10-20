import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CheckAvailabilityDto {
    @ApiProperty({ description: 'ID del proveedor' })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({ description: 'Fecha para verificar disponibilidad', example: '2025-10-15' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiPropertyOptional({ description: 'ID del servicio (para calcular duración)' })
    @IsOptional()
    @IsString()
    serviceId?: string;
}

export class RescheduleBookingDto {
    @ApiProperty({ description: 'Nueva fecha de la reserva', example: '2025-10-20' })
    @IsDateString()
    @IsNotEmpty()
    newBookingDate: string;

    @ApiProperty({ description: 'Nueva hora de inicio', example: '2025-10-20T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    newStartTime: string;

    @ApiProperty({ description: 'Nueva hora de fin', example: '2025-10-20T11:30:00Z' })
    @IsDateString()
    @IsNotEmpty()
    newEndTime: string;

    @ApiPropertyOptional({ description: 'Razón del reagendamiento' })
    @IsOptional()
    @IsString()
    reason?: string;
}
