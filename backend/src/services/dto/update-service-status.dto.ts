import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

export class UpdateServiceStatusDto {
    @ApiProperty({
        description: 'Nuevo estado del servicio',
        enum: ServiceStatus,
        example: ServiceStatus.ACTIVE
    })
    @IsEnum(ServiceStatus)
    status: ServiceStatus;
}
