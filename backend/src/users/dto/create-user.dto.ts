import { IsEmail, IsString, IsOptional, IsEnum, MinLength, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'usuario@ejemplo.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Juan' })
    @IsString()
    firstName: string;

    @ApiProperty({ example: 'Pérez' })
    @IsString()
    lastName: string;

    @ApiProperty({ example: '+56912345678', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE, required: false })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ example: '1990-01-01', required: false })
    @IsOptional()
    dateOfBirth?: string;

    @ApiProperty({ example: -33.4489, required: false })
    @IsOptional()
    defaultLatitude?: number;

    @ApiProperty({ example: -70.6693, required: false })
    @IsOptional()
    defaultLongitude?: number;

    @ApiProperty({ example: 'Santiago, Chile', required: false })
    @IsOptional()
    @IsString()
    defaultAddress?: string;
}
