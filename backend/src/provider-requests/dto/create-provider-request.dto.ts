import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderRequestDto {
    @ApiProperty({ description: 'Nombre del negocio' })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty({ description: 'Tipo de negocio (ej: Autolavado, Detailing)' })
    @IsString()
    @IsNotEmpty()
    businessType: string;

    @ApiProperty({ description: 'Email del negocio' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'Teléfono del negocio' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ description: 'Dirección del negocio' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ description: 'Ciudad' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ description: 'Región' })
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiPropertyOptional({ description: 'Descripción del negocio' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Razón para convertirse en proveedor' })
    @IsString()
    @IsOptional()
    reason?: string;
}
