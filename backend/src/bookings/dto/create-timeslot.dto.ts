import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateTimeSlotDto {
    @ApiProperty({ description: 'ID del proveedor' })
    @IsString()
    @IsNotEmpty()
    providerId: string;

    @ApiProperty({ description: 'Día de la semana (0=Domingo, 6=Sábado)', example: 1 })
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @ApiProperty({ description: 'Hora de inicio', example: '09:00' })
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @ApiProperty({ description: 'Hora de fin', example: '18:00' })
    @IsString()
    @IsNotEmpty()
    endTime: string;

    @ApiProperty({ description: 'Está disponible', default: true })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiProperty({ description: 'Capacidad máxima de reservas simultáneas', default: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    maxCapacity?: number;
}
