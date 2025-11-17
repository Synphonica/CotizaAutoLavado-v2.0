import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreatePriceAlertDto {
    @ApiProperty({
        description: 'ID del servicio a monitorear',
        example: 'cm123abc456def789',
    })
    @IsString()
    @IsNotEmpty()
    serviceId: string;

    @ApiPropertyOptional({
        description: 'Precio objetivo en CLP (si se alcanza o baja, se notifica)',
        example: 8000,
        type: Number,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    targetPrice?: number;

    @ApiPropertyOptional({
        description: 'Porcentaje mínimo de descuento para notificar (ej: 10 = notificar si baja 10% o más)',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    percentageOff?: number;

    @ApiPropertyOptional({
        description: 'Recibir notificaciones por email',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    notifyEmail?: boolean;

    @ApiPropertyOptional({
        description: 'Recibir notificaciones in-app',
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    notifyInApp?: boolean;
}
