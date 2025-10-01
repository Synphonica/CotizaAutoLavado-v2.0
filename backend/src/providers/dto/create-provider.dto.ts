import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, ValidateNested, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProviderStatus } from '@prisma/client';

export class OperatingHoursDto {
    @ApiProperty({ example: '09:00' })
    @IsString()
    open: string;

    @ApiProperty({ example: '18:00' })
    @IsString()
    close: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    isOpen: boolean;
}

export class CreateProviderDto {
    @ApiProperty({ example: 'Autolavado Premium' })
    @IsString()
    businessName: string;

    @ApiProperty({ example: 'Autolavado' })
    @IsString()
    businessType: string;

    @ApiProperty({ example: 'El mejor autolavado de la ciudad', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '+56912345678' })
    @IsString()
    phone: string;

    @ApiProperty({ example: 'contacto@autolavado.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'https://autolavado.com', required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ example: 'Av. Providencia 1234, Santiago' })
    @IsString()
    address: string;

    @ApiProperty({ example: -33.4489 })
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @ApiProperty({ example: -70.6693 })
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @ApiProperty({ example: 'Santiago' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'Metropolitana' })
    @IsString()
    region: string;

    @ApiProperty({ example: '7500000', required: false })
    @IsOptional()
    @IsString()
    postalCode?: string;

    @ApiProperty({
        example: {
            monday: { open: '09:00', close: '18:00', isOpen: true },
            tuesday: { open: '09:00', close: '18:00', isOpen: true },
            wednesday: { open: '09:00', close: '18:00', isOpen: true },
            thursday: { open: '09:00', close: '18:00', isOpen: true },
            friday: { open: '09:00', close: '18:00', isOpen: true },
            saturday: { open: '09:00', close: '16:00', isOpen: true },
            sunday: { open: '10:00', close: '14:00', isOpen: false }
        }
    })
    @IsObject()
    operatingHours: Record<string, OperatingHoursDto>;

    @ApiProperty({ example: '12345678-9', required: false })
    @IsOptional()
    @IsString()
    businessLicense?: string;

    @ApiProperty({ example: '98765432-1', required: false })
    @IsOptional()
    @IsString()
    taxId?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    acceptsBookings: boolean;

    @ApiProperty({ example: 60, description: 'Minutos de anticipación mínima' })
    @IsNumber()
    @Min(0)
    minAdvanceBooking: number;

    @ApiProperty({ example: 10080, description: 'Minutos de anticipación máxima (7 días)' })
    @IsNumber()
    @Min(0)
    maxAdvanceBooking: number;

    @ApiProperty({ enum: ProviderStatus, example: ProviderStatus.PENDING_APPROVAL, required: false })
    @IsOptional()
    @IsEnum(ProviderStatus)
    status?: ProviderStatus;
}
