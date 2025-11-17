import { PartialType } from '@nestjs/swagger';
import { CreatePriceAlertDto } from './create-price-alert.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePriceAlertDto extends PartialType(CreatePriceAlertDto) {
    @ApiPropertyOptional({
        description: 'Activar o desactivar la alerta',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
