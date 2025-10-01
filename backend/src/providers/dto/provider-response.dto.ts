import { ApiProperty } from '@nestjs/swagger';
import { ProviderStatus } from '@prisma/client';

export class ProviderResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    businessName: string;

    @ApiProperty()
    businessType: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false })
    website?: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty()
    city: string;

    @ApiProperty()
    region: string;

    @ApiProperty({ required: false })
    postalCode?: string;

    @ApiProperty()
    operatingHours: Record<string, any>;

    @ApiProperty({ required: false })
    businessLicense?: string;

    @ApiProperty({ required: false })
    taxId?: string;

    @ApiProperty()
    acceptsBookings: boolean;

    @ApiProperty()
    minAdvanceBooking: number;

    @ApiProperty()
    maxAdvanceBooking: number;

    @ApiProperty()
    rating: number;

    @ApiProperty()
    totalReviews: number;

    @ApiProperty()
    totalBookings: number;

    @ApiProperty({ enum: ProviderStatus })
    status: ProviderStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: false })
    verifiedAt?: Date;
}

export class ProviderListResponseDto {
    @ApiProperty({ type: [ProviderResponseDto] })
    providers: ProviderResponseDto[];

    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;
}
