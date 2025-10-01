import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ required: false })
    phone?: string;

    @ApiProperty({ enum: UserRole })
    role: UserRole;

    @ApiProperty({ enum: UserStatus })
    status: UserStatus;

    @ApiProperty({ required: false })
    avatar?: string;

    @ApiProperty({ required: false })
    dateOfBirth?: Date;

    @ApiProperty({ required: false })
    defaultLatitude?: number;

    @ApiProperty({ required: false })
    defaultLongitude?: number;

    @ApiProperty({ required: false })
    defaultAddress?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: false })
    lastLoginAt?: Date;
}

export class UserListResponseDto {
    @ApiProperty({ type: [UserResponseDto] })
    users: UserResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}
