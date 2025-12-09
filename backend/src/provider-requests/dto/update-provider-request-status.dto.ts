import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderRequestStatus } from '@prisma/client';

export class UpdateProviderRequestStatusDto {
    @ApiProperty({
        enum: ProviderRequestStatus,
        description: 'Nuevo estado de la solicitud'
    })
    @IsEnum(ProviderRequestStatus)
    status: ProviderRequestStatus;

    @ApiPropertyOptional({ description: 'Razón de rechazo (solo si status es REJECTED)' })
    @IsString()
    @IsOptional()
    rejectionReason?: string;

    @ApiPropertyOptional({ description: 'Notas del administrador' })
    @IsString()
    @IsOptional()
    adminNotes?: string;
}
