import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateAuthDto {
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

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}