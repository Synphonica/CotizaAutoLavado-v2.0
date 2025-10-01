import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ServiceType, UserRole, ProviderStatus } from '@prisma/client';

export class AnalyticsQueryDto {
    @ApiPropertyOptional({ description: 'Fecha de inicio', example: '2024-01-01' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin', example: '2024-12-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Tipo de métrica', enum: ['overview', 'users', 'providers', 'services', 'reviews', 'revenue'] })
    @IsOptional()
    @IsEnum(['overview', 'users', 'providers', 'services', 'reviews', 'revenue'])
    metricType?: 'overview' | 'users' | 'providers' | 'services' | 'reviews' | 'revenue' = 'overview';

    @ApiPropertyOptional({ description: 'ID del proveedor específico' })
    @IsOptional()
    @IsUUID()
    providerId?: string;

    @ApiPropertyOptional({ description: 'ID del usuario específico' })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({ description: 'Agrupación temporal', enum: ['day', 'week', 'month', 'year'] })
    @IsOptional()
    @IsEnum(['day', 'week', 'month', 'year'])
    groupBy?: 'day' | 'week' | 'month' | 'year' = 'month';

    @ApiPropertyOptional({ description: 'Límite de resultados', example: 50, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(1000)
    limit?: number = 50;
}

export class OverviewMetricsDto {
    @ApiProperty({ description: 'Total de usuarios registrados' })
    totalUsers!: number;

    @ApiProperty({ description: 'Total de proveedores activos' })
    totalProviders!: number;

    @ApiProperty({ description: 'Total de servicios disponibles' })
    totalServices!: number;

    @ApiProperty({ description: 'Total de reseñas' })
    totalReviews!: number;

    @ApiProperty({ description: 'Promedio de calificación general' })
    averageRating!: number;

    @ApiProperty({ description: 'Crecimiento de usuarios este mes (%)' })
    userGrowthThisMonth!: number;

    @ApiProperty({ description: 'Crecimiento de proveedores este mes (%)' })
    providerGrowthThisMonth!: number;

    @ApiProperty({ description: 'Servicios más populares' })
    topServices!: Array<{
        serviceType: ServiceType;
        count: number;
        averagePrice: number;
    }>;

    @ApiProperty({ description: 'Ciudades con más proveedores' })
    topCities!: Array<{
        city: string;
        providerCount: number;
        averageRating: number;
    }>;
}

export class UserMetricsDto {
    @ApiProperty({ description: 'Métricas de usuarios' })
    users!: {
        total: number;
        active: number;
        newThisMonth: number;
        byRole: Array<{
            role: UserRole;
            count: number;
        }>;
    };

    @ApiProperty({ description: 'Registros por período' })
    registrations!: Array<{
        period: string;
        count: number;
    }>;

    @ApiProperty({ description: 'Actividad de usuarios' })
    activity!: {
        totalSearches: number;
        totalFavorites: number;
        totalReviews: number;
        averageSearchesPerUser: number;
    };

    @ApiProperty({ description: 'Usuarios más activos' })
    topUsers!: Array<{
        userId: string;
        firstName: string;
        lastName: string;
        searchesCount: number;
        reviewsCount: number;
        favoritesCount: number;
    }>;
}

export class ProviderMetricsDto {
    @ApiProperty({ description: 'Métricas de proveedores' })
    providers!: {
        total: number;
        active: number;
        pending: number;
        verified: number;
        byStatus: Array<{
            status: ProviderStatus;
            count: number;
        }>;
    };

    @ApiProperty({ description: 'Registros de proveedores por período' })
    registrations!: Array<{
        period: string;
        count: number;
    }>;

    @ApiProperty({ description: 'Calificaciones de proveedores' })
    ratings!: {
        average: number;
        distribution: Array<{
            range: string;
            count: number;
        }>;
    };

    @ApiProperty({ description: 'Proveedores mejor calificados' })
    topProviders!: Array<{
        providerId: string;
        businessName: string;
        rating: number;
        reviewCount: number;
        city: string;
    }>;

    @ApiProperty({ description: 'Servicios por proveedor' })
    servicesPerProvider!: {
        average: number;
        distribution: Array<{
            range: string;
            count: number;
        }>;
    };
}

export class ServiceMetricsDto {
    @ApiProperty({ description: 'Métricas de servicios' })
    services!: {
        total: number;
        active: number;
        byType: Array<{
            type: ServiceType;
            count: number;
            averagePrice: number;
        }>;
    };

    @ApiProperty({ description: 'Precios de servicios' })
    pricing!: {
        averagePrice: number;
        priceRange: {
            min: number;
            max: number;
        };
        byType: Array<{
            type: ServiceType;
            averagePrice: number;
            minPrice: number;
            maxPrice: number;
        }>;
    };

    @ApiProperty({ description: 'Servicios más populares' })
    popularServices!: Array<{
        serviceId: string;
        name: string;
        type: ServiceType;
        providerName: string;
        viewCount: number;
        favoriteCount: number;
        averageRating: number;
    }>;

    @ApiProperty({ description: 'Servicios con descuentos' })
    discountedServices!: {
        count: number;
        averageDiscount: number;
        topDiscounts: Array<{
            serviceId: string;
            name: string;
            originalPrice: number;
            discountedPrice: number;
            discountPercent: number;
        }>;
    };
}

export class ReviewMetricsDto {
    @ApiProperty({ description: 'Métricas de reseñas' })
    reviews!: {
        total: number;
        average: number;
        distribution: Array<{
            rating: number;
            count: number;
            percentage: number;
        }>;
    };

    @ApiProperty({ description: 'Reseñas por período' })
    reviewsOverTime!: Array<{
        period: string;
        count: number;
        averageRating: number;
    }>;

    @ApiProperty({ description: 'Reseñas por proveedor' })
    reviewsByProvider!: Array<{
        providerId: string;
        businessName: string;
        reviewCount: number;
        averageRating: number;
        city: string;
    }>;

    @ApiProperty({ description: 'Palabras más usadas en reseñas' })
    topKeywords!: Array<{
        keyword: string;
        count: number;
        sentiment: 'positive' | 'negative' | 'neutral';
    }>;
}

export class RevenueMetricsDto {
    @ApiProperty({ description: 'Métricas de ingresos (simuladas)' })
    revenue!: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        growth: number;
    };

    @ApiProperty({ description: 'Ingresos por período' })
    revenueOverTime!: Array<{
        period: string;
        amount: number;
    }>;

    @ApiProperty({ description: 'Ingresos por proveedor' })
    revenueByProvider!: Array<{
        providerId: string;
        businessName: string;
        amount: number;
        serviceCount: number;
    }>;

    @ApiProperty({ description: 'Ingresos por tipo de servicio' })
    revenueByServiceType!: Array<{
        type: ServiceType;
        amount: number;
        serviceCount: number;
    }>;
}

export class AnalyticsResponseDto {
    @ApiProperty({ description: 'Tipo de métrica' })
    metricType!: string;

    @ApiProperty({ description: 'Período de consulta' })
    period!: {
        startDate: string;
        endDate: string;
    };

    @ApiProperty({ description: 'Datos de la métrica' })
    data!: OverviewMetricsDto | UserMetricsDto | ProviderMetricsDto | ServiceMetricsDto | ReviewMetricsDto | RevenueMetricsDto;

    @ApiProperty({ description: 'Timestamp de generación' })
    generatedAt!: string;
}

export class DashboardDataDto {
    @ApiProperty({ description: 'Resumen general' })
    overview!: OverviewMetricsDto;

    @ApiProperty({ description: 'Métricas de usuarios' })
    users!: UserMetricsDto;

    @ApiProperty({ description: 'Métricas de proveedores' })
    providers!: ProviderMetricsDto;

    @ApiProperty({ description: 'Métricas de servicios' })
    services!: ServiceMetricsDto;

    @ApiProperty({ description: 'Métricas de reseñas' })
    reviews!: ReviewMetricsDto;

    @ApiProperty({ description: 'Timestamp de generación' })
    generatedAt!: string;
}
