import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ProviderResponseDto {
    @ApiProperty({
        description: 'Respuesta del proveedor a la reseña',
        example: 'Gracias por tu comentario. Nos alegra que hayas quedado satisfecho con nuestro servicio.',
        minLength: 10,
        maxLength: 500
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'La respuesta debe tener al menos 10 caracteres' })
    @MaxLength(500, { message: 'La respuesta no puede exceder 500 caracteres' })
    response: string;
}
