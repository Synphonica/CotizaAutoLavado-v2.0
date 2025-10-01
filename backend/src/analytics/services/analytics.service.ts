import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    AnalyticsQueryDto,
    AnalyticsResponseDto,
    DashboardDataDto,
    OverviewMetricsDto,
    UserMetricsDto,
    ProviderMetricsDto,
    ServiceMetricsDto,
    ReviewMetricsDto,
    RevenueMetricsDto
} from '../dto/analytics.dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getMetrics(query: AnalyticsQueryDto): Promise<AnalyticsResponseDto> {
        const { metricType = 'overview', startDate, endDate, groupBy = 'month' } = query;

        const dateFilter = this.buildDateFilter(startDate, endDate);

        let data: any;

        switch (metricType) {
            case 'overview':
                data = await this.getOverviewMetrics(dateFilter);
                break;
            case 'users':
                data = await this.getUserMetrics(dateFilter, groupBy);
                break;
            case 'providers':
                data = await this.getProviderMetrics(dateFilter, groupBy);
                break;
            case 'services':
                data = await this.getServiceMetrics(dateFilter);
                break;
            case 'reviews':
                data = await this.getReviewMetrics(dateFilter, groupBy);
                break;
            case 'revenue':
                data = await this.getRevenueMetrics(dateFilter, groupBy);
                break;
            default:
                data = await this.getOverviewMetrics(dateFilter);
        }

        return {
            metricType,
            period: {
                startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: endDate || new Date().toISOString()
            },
            data,
            generatedAt: new Date().toISOString()
        };
    }

    async getDashboardData(): Promise<DashboardDataDto> {
        const dateFilter = this.buildDateFilter();

        const [overview, users, providers, services, reviews] = await Promise.all([
            this.getOverviewMetrics(dateFilter),
            this.getUserMetrics(dateFilter, 'month'),
            this.getProviderMetrics(dateFilter, 'month'),
            this.getServiceMetrics(dateFilter),
            this.getReviewMetrics(dateFilter, 'month')
        ]);

        return {
            overview,
            users,
            providers,
            services,
            reviews,
            generatedAt: new Date().toISOString()
        };
    }

    private buildDateFilter(startDate?: string, endDate?: string) {
        const filter: any = {};

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.gte = new Date(startDate);
            if (endDate) filter.createdAt.lte = new Date(endDate);
        } else {
            // Últimos 30 días por defecto
            filter.createdAt = {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            };
        }

        return filter;
    }

    private async getOverviewMetrics(dateFilter: any): Promise<OverviewMetricsDto> {
        const [
            totalUsers,
            totalProviders,
            totalServices,
            totalReviews,
            averageRating,
            userGrowthThisMonth,
            providerGrowthThisMonth,
            topServices,
            topCities
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.provider.count({ where: { status: 'ACTIVE' } }),
            this.prisma.service.count({ where: { status: 'ACTIVE' } }),
            this.prisma.review.count(),
            this.prisma.review.aggregate({ _avg: { rating: true } }).then(r => r._avg.rating || 0),
            this.getUserGrowthThisMonth(),
            this.getProviderGrowthThisMonth(),
            this.getTopServices(),
            this.getTopCities()
        ]);

        return {
            totalUsers,
            totalProviders,
            totalServices,
            totalReviews,
            averageRating: Number(averageRating),
            userGrowthThisMonth,
            providerGrowthThisMonth,
            topServices,
            topCities
        };
    }

    private async getUserMetrics(dateFilter: any, groupBy: string): Promise<UserMetricsDto> {
        const [users, registrations, activity, topUsers] = await Promise.all([
            this.getUserStats(),
            this.getUserRegistrations(dateFilter, groupBy),
            this.getUserActivity(),
            this.getTopUsers()
        ]);

        return {
            users,
            registrations,
            activity,
            topUsers
        };
    }

    private async getProviderMetrics(dateFilter: any, groupBy: string): Promise<ProviderMetricsDto> {
        const [providers, registrations, ratings, topProviders, servicesPerProvider] = await Promise.all([
            this.getProviderStats(),
            this.getProviderRegistrations(dateFilter, groupBy),
            this.getProviderRatings(),
            this.getTopProviders(),
            this.getServicesPerProvider()
        ]);

        return {
            providers,
            registrations,
            ratings,
            topProviders,
            servicesPerProvider
        };
    }

    private async getServiceMetrics(dateFilter: any): Promise<ServiceMetricsDto> {
        const [services, pricing, popularServices, discountedServices] = await Promise.all([
            this.getServiceStats(),
            this.getServicePricing(),
            this.getPopularServices(),
            this.getDiscountedServices()
        ]);

        return {
            services,
            pricing,
            popularServices,
            discountedServices
        };
    }

    private async getReviewMetrics(dateFilter: any, groupBy: string): Promise<ReviewMetricsDto> {
        const [reviews, reviewsOverTime, reviewsByProvider, topKeywords] = await Promise.all([
            this.getReviewStats(),
            this.getReviewsOverTime(dateFilter, groupBy),
            this.getReviewsByProvider(),
            this.getTopKeywords()
        ]);

        return {
            reviews,
            reviewsOverTime,
            reviewsByProvider,
            topKeywords
        };
    }

    private async getRevenueMetrics(dateFilter: any, groupBy: string): Promise<RevenueMetricsDto> {
        // Simulación de métricas de ingresos (en un sistema real vendrían de transacciones)
        const revenue = {
            total: 0,
            thisMonth: 0,
            lastMonth: 0,
            growth: 0
        };

        const revenueOverTime = [];
        const revenueByProvider = [];
        const revenueByServiceType = [];

        return {
            revenue,
            revenueOverTime,
            revenueByProvider,
            revenueByServiceType
        };
    }

    // Métodos auxiliares para obtener estadísticas específicas
    private async getUserGrowthThisMonth(): Promise<number> {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [thisMonthCount, lastMonthCount] = await Promise.all([
            this.prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
            this.prisma.user.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } })
        ]);

        return lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;
    }

    private async getProviderGrowthThisMonth(): Promise<number> {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const [thisMonthCount, lastMonthCount] = await Promise.all([
            this.prisma.provider.count({ where: { createdAt: { gte: thisMonth } } }),
            this.prisma.provider.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } })
        ]);

        return lastMonthCount > 0 ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100 : 0;
    }

    private async getTopServices() {
        const services = await this.prisma.service.groupBy({
            by: ['type'],
            _count: { type: true },
            _avg: { price: true },
            where: { status: 'ACTIVE' },
            orderBy: { _count: { type: 'desc' } },
            take: 5
        });

        return services.map(s => ({
            serviceType: s.type,
            count: s._count.type,
            averagePrice: Number(s._avg.price || 0)
        }));
    }

    private async getTopCities() {
        const cities = await this.prisma.provider.groupBy({
            by: ['city'],
            _count: { city: true },
            _avg: { rating: true },
            where: { status: 'ACTIVE' },
            orderBy: { _count: { city: 'desc' } },
            take: 5
        });

        return cities.map(c => ({
            city: c.city,
            providerCount: c._count.city,
            averageRating: Number(c._avg.rating || 0)
        }));
    }

    private async getUserStats() {
        const [total, active, newThisMonth, byRole] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            }),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: { role: true }
            })
        ]);

        return {
            total,
            active,
            newThisMonth,
            byRole: byRole.map(r => ({ role: r.role, count: r._count.role }))
        };
    }

    private async getUserRegistrations(dateFilter: any, groupBy: string) {
        // Implementar agrupación por período
        return [];
    }

    private async getUserActivity() {
        const [totalSearches, totalFavorites, totalReviews] = await Promise.all([
            this.prisma.searchHistory.count(),
            this.prisma.favorite.count(),
            this.prisma.review.count()
        ]);

        const totalUsers = await this.prisma.user.count();

        return {
            totalSearches,
            totalFavorites,
            totalReviews,
            averageSearchesPerUser: totalUsers > 0 ? totalSearches / totalUsers : 0
        };
    }

    private async getTopUsers() {
        // Implementar consulta para usuarios más activos
        return [];
    }

    private async getProviderStats() {
        const [total, active, pending, verified, byStatus] = await Promise.all([
            this.prisma.provider.count(),
            this.prisma.provider.count({ where: { status: 'ACTIVE' } }),
            this.prisma.provider.count({ where: { status: 'PENDING_APPROVAL' } }),
            this.prisma.provider.count({ where: { status: 'VERIFIED' } }),
            this.prisma.provider.groupBy({
                by: ['status'],
                _count: { status: true }
            })
        ]);

        return {
            total,
            active,
            pending,
            verified,
            byStatus: byStatus.map(s => ({ status: s.status, count: s._count.status }))
        };
    }

    private async getProviderRegistrations(dateFilter: any, groupBy: string) {
        // Implementar agrupación por período
        return [];
    }

    private async getProviderRatings() {
        const ratingStats = await this.prisma.review.aggregate({
            _avg: { rating: true },
            _count: { rating: true }
        });

        const distribution = await this.prisma.review.groupBy({
            by: ['rating'],
            _count: { rating: true }
        });

        return {
            average: Number(ratingStats._avg.rating || 0),
            distribution: distribution.map(d => ({
                range: `${d.rating} estrellas`,
                count: d._count.rating,
                percentage: 0 // Calcular porcentaje
            }))
        };
    }

    private async getTopProviders() {
        const providers = await this.prisma.provider.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                businessName: true,
                rating: true,
                reviewCount: true,
                city: true
            },
            orderBy: { rating: 'desc' },
            take: 10
        });

        return providers.map(p => ({
            providerId: p.id,
            businessName: p.businessName,
            rating: p.rating,
            reviewCount: p.reviewCount,
            city: p.city
        }));
    }

    private async getServicesPerProvider() {
        const services = await this.prisma.service.groupBy({
            by: ['providerId'],
            _count: { providerId: true }
        });

        const counts = services.map(s => s._count.providerId);
        const average = counts.length > 0 ? counts.reduce((a, b) => a + b, 0) / counts.length : 0;

        return {
            average,
            distribution: [] // Implementar distribución
        };
    }

    private async getServiceStats() {
        const [total, active, byType] = await Promise.all([
            this.prisma.service.count(),
            this.prisma.service.count({ where: { status: 'ACTIVE' } }),
            this.prisma.service.groupBy({
                by: ['type'],
                _count: { type: true },
                _avg: { price: true }
            })
        ]);

        return {
            total,
            active,
            byType: byType.map(t => ({
                type: t.type,
                count: t._count.type,
                averagePrice: Number(t._avg.price || 0)
            }))
        };
    }

    private async getServicePricing() {
        const pricing = await this.prisma.service.aggregate({
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true }
        });

        const byType = await this.prisma.service.groupBy({
            by: ['type'],
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true }
        });

        return {
            averagePrice: Number(pricing._avg.price || 0),
            priceRange: {
                min: Number(pricing._min.price || 0),
                max: Number(pricing._max.price || 0)
            },
            byType: byType.map(t => ({
                type: t.type,
                averagePrice: Number(t._avg.price || 0),
                minPrice: Number(t._min.price || 0),
                maxPrice: Number(t._max.price || 0)
            }))
        };
    }

    private async getPopularServices() {
        // Implementar lógica para servicios más populares
        return [];
    }

    private async getDiscountedServices() {
        const discounted = await this.prisma.service.findMany({
            where: {
                discountedPrice: { not: null },
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                price: true,
                discountedPrice: true
            }
        });

        const services = discounted.map(s => {
            const discountPercent = s.discountedPrice
                ? Math.round(((Number(s.price) - Number(s.discountedPrice)) / Number(s.price)) * 100)
                : 0;

            return {
                serviceId: s.id,
                name: s.name,
                originalPrice: Number(s.price),
                discountedPrice: Number(s.discountedPrice || 0),
                discountPercent
            };
        });

        const averageDiscount = services.length > 0
            ? services.reduce((sum, s) => sum + s.discountPercent, 0) / services.length
            : 0;

        return {
            count: services.length,
            averageDiscount,
            topDiscounts: services
                .sort((a, b) => b.discountPercent - a.discountPercent)
                .slice(0, 10)
        };
    }

    private async getReviewStats() {
        const [total, average, distribution] = await Promise.all([
            this.prisma.review.count(),
            this.prisma.review.aggregate({ _avg: { rating: true } }),
            this.prisma.review.groupBy({
                by: ['rating'],
                _count: { rating: true }
            })
        ]);

        const totalReviews = distribution.reduce((sum, d) => sum + d._count.rating, 0);

        return {
            total,
            average: Number(average._avg.rating || 0),
            distribution: distribution.map(d => ({
                rating: d.rating,
                count: d._count.rating,
                percentage: totalReviews > 0 ? (d._count.rating / totalReviews) * 100 : 0
            }))
        };
    }

    private async getReviewsOverTime(dateFilter: any, groupBy: string) {
        // Implementar agrupación por período
        return [];
    }

    private async getReviewsByProvider() {
        const reviews = await this.prisma.review.groupBy({
            by: ['providerId'],
            _count: { providerId: true },
            _avg: { rating: true }
        });

        const providers = await this.prisma.provider.findMany({
            where: { id: { in: reviews.map(r => r.providerId) } },
            select: { id: true, businessName: true, city: true }
        });

        return reviews.map(r => {
            const provider = providers.find(p => p.id === r.providerId);
            return {
                providerId: r.providerId,
                businessName: provider?.businessName || 'Unknown',
                reviewCount: r._count.providerId,
                averageRating: Number(r._avg.rating || 0),
                city: provider?.city || 'Unknown'
            };
        }).sort((a, b) => b.reviewCount - a.reviewCount);
    }

    private async getTopKeywords() {
        // Implementar extracción de palabras clave de reseñas
        return [];
    }
}
