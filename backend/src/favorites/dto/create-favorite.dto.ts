import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFavoriteDto {
    @ApiProperty({
        description: 'ID del usuario que marca como favorito',
        example: 'user_123456789'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'ID del proveedor (autolavado) que se marca como favorito',
        example: 'provider_123456789'
    })
    @IsString()
    @IsNotEmpty()
    providerId: string;
}