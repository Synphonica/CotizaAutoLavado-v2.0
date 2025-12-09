import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockedDateDto {
    @ApiProperty({
        description: 'ID del proveedor',
        example: 'clx1234567890',
    })
    @IsString()
    providerId: string;

    @ApiProperty({
        description: 'Fecha bloqueada (YYYY-MM-DD)',
        example: '2024-12-25',
    })
    @IsDateString()
    date: string;

    @ApiProperty({
        description: 'Razón del bloqueo',
        example: 'Feriado nacional',
        required: false,
    })
    @IsString()
    @IsOptional()
    reason?: string;
}
