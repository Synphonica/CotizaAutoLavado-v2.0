import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProviderStatus } from '@prisma/client';

export class UpdateProviderStatusDto {
    @ApiProperty({ enum: ProviderStatus, example: ProviderStatus.ACTIVE })
    @IsEnum(ProviderStatus)
    status: ProviderStatus;
}
