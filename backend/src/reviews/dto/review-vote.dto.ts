import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ReviewVoteDto {
    @ApiProperty({
        description: 'Indica si la reseña fue útil (true) o no útil (false)',
        example: true
    })
    @IsBoolean()
    @IsNotEmpty()
    isHelpful: boolean;
}

export class ReviewVoteResponseDto {
    @ApiProperty({ description: 'ID del voto', example: 'vote_123456789' })
    id: string;

    @ApiProperty({ description: 'ID de la reseña', example: 'review_123456789' })
    reviewId: string;

    @ApiProperty({ description: 'ID del usuario', example: 'user_123456789' })
    userId: string;

    @ApiProperty({ description: 'Si el voto fue útil', example: true })
    isHelpful: boolean;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt: Date;
}
