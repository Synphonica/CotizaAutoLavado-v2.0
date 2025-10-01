import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
import { SearchResultDto } from '../dto/search-result.dto';
import { SearchSuggestionsDto, SearchSuggestionDto } from '../dto/search-suggestions.dto';
import { NearbySearchDto } from '../dto/nearby-search.dto';
import { ServiceType, ServiceStatus, ProviderStatus } from '@prisma/client';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    /**
     * Búsqueda principal de servicios
     */
    async search(searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
        const startTime = Date.now();

        const {
            query,
            latitude,
            longitude,
            radius = 10,
            city,
            region,
            serviceType,
            serviceTypes,
            minPrice,
            maxPrice,
            minRating,
            availableOnly = true,
            verifiedOnly = false,
            hasDiscounts = false,
            page = 1,
            limit = 20,
            sortBy = 'relevance',
            sortOrder = 'asc',
            includeProvider = true,
            includeImages = true,
            includeReviews = false
        } = searchQuery;

        const skip = (page - 1) * limit;

        // Construir filtros de búsqueda
        const where: any = {
            status: ServiceStatus.ACTIVE,
            isAvailable: availableOnly ? true : undefined,
            deletedAt: null
        };

        // Filtro por texto de búsqueda
        if (query) {
            where.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { contains: query, mode: 'insensitive' } },
                { provider: { businessName: { contains: query, mode: 'insensitive' } } }
            ];
        }

        // Filtros por tipo de servicio
        if (serviceType) {
            where.type = serviceType;
        } else if (serviceTypes && serviceTypes.length > 0) {
            where.type = { in: serviceTypes };
        }

        // Filtros de precio
        if (minPrice !== undefined) {
            where.price = { gte: minPrice };
        }
        if (maxPrice !== undefined) {
            where.price = { ...where.price, lte: maxPrice };
        }

        // Filtro por calificación
        if (minRating !== undefined) {
            where.rating = { gte: minRating };
        }

        // Filtro por descuentos
        if (hasDiscounts) {
            where.discountedPrice = { not: null };
        }

        // Filtros de ubicación
        if (city) {
            where.provider = { ...where.provider, city: { contains: city, mode: 'insensitive' } };
        }
        if (region) {
            where.provider = { ...where.provider, region: { contains: region, mode: 'insensitive' } };
        }

        // Filtro por proveedores verificados
        if (verifiedOnly) {
            where.provider = { ...where.provider, status: ProviderStatus.VERIFIED };
        }

        // Construir include
        const include: any = {
            provider: includeProvider ? {
                select: {
                    id: true,
                    businessName: true,
                    businessType: true,
                    address: true,
                    city: true,
                    region: true,
                    phone: true,
                    email: true,
                    rating: true,
                    reviewCount: true,
                    status: true,
                    latitude: true,
                    longitude: true
                }
            } : false,
            serviceImages: includeImages ? {
                select: {
                    id: true,
                    url: true,
                    alt: true
                }
            } : false,
            reviews: includeReviews ? {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                },
                take: 3,
                orderBy: { createdAt: 'desc' }
            } : false
        };

        // Construir orderBy
        let orderBy: any = {};
        switch (sortBy) {
            case 'price':
                orderBy = { price: sortOrder };
                break;
            case 'name':
                orderBy = { name: sortOrder };
                break;
            case 'createdAt':
                orderBy = { createdAt: sortOrder };
                break;
            case 'relevance':
            default:
                // Para relevancia, ordenamos por precio ascendente
                orderBy = { price: 'asc' };
                break;
        }

        // Ejecutar búsqueda
        const [services, total] = await Promise.all([
            this.prisma.service.findMany({
                where,
                include,
                orderBy,
                skip,
                take: limit
            }),
            this.prisma.service.count({ where })
        ]);

        // Calcular distancias si se proporcionaron coordenadas
        let resultsWithDistance: any[] = services;
        if (latitude && longitude) {
            resultsWithDistance = services.map(service => {
                const serviceWithProvider = service as any;
                if (serviceWithProvider.provider && serviceWithProvider.provider.latitude && serviceWithProvider.provider.longitude) {
                    const distance = this.calculateDistance(
                        latitude,
                        longitude,
                        serviceWithProvider.provider.latitude,
                        serviceWithProvider.provider.longitude
                    );
                    return { ...service, distance };
                }
                return service;
            });

            // Filtrar por radio si se especificó
            if (radius) {
                resultsWithDistance = resultsWithDistance.filter(service =>
                    service.distance === undefined || service.distance <= radius
                ); ``
            }

            // Reordenar por distancia si es el criterio de ordenamiento
            if (sortBy === 'distance') {
                resultsWithDistance.sort((a, b) => {
                    const distanceA = a.distance || Infinity;
                    const distanceB = b.distance || Infinity;
                    return sortOrder === 'asc' ? distanceA - distanceB : distanceB - distanceA;
                });
            }
        }

        // Mapear resultados
        const results = resultsWithDistance.map(service => this.mapToSearchResult(service));

        // Calcular estadísticas
        const statistics = await this.calculateSearchStatistics(where);

        // Generar sugerencias
        const suggestions = await this.generateSuggestions(query);

        const executionTime = Date.now() - startTime;

        return {
            results,
            total: resultsWithDistance.length,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            query,
            filters: {
                serviceType: serviceType || (serviceTypes ? serviceTypes.join(',') : undefined),
                minPrice,
                maxPrice,
                minRating,
                city,
                radius
            },
            executionTime,
            suggestions,
            statistics
        };
    }

    /**
     * Búsqueda por proximidad
     */
    async searchNearby(nearbySearch: NearbySearchDto): Promise<SearchResponseDto> {
        const searchQuery: SearchQueryDto = {
            query: '',
            latitude: nearbySearch.latitude,
            longitude: nearbySearch.longitude,
            radius: nearbySearch.radius,
            serviceType: nearbySearch.serviceType,
            maxPrice: nearbySearch.maxPrice,
            minRating: nearbySearch.minRating,
            availableOnly: nearbySearch.availableOnly,
            verifiedOnly: nearbySearch.verifiedOnly,
            page: nearbySearch.page,
            limit: nearbySearch.limit,
            sortBy: nearbySearch.sortBy as any,
            sortOrder: nearbySearch.sortOrder
        };

        return this.search(searchQuery);
    }

    /**
     * Obtener sugerencias de búsqueda
     */
    async getSuggestions(suggestionsDto: SearchSuggestionsDto): Promise<SearchSuggestionDto[]> {
        const { query, limit = 10, type = 'all' } = suggestionsDto;

        if (!query || query.length < 2) {
            return [];
        }

        const suggestions: SearchSuggestionDto[] = [];

        // Sugerencias de servicios
        if (type === 'all' || type === 'services') {
            const serviceSuggestions = await this.prisma.service.findMany({
                where: {
                    status: ServiceStatus.ACTIVE,
                    isAvailable: true,
                    deletedAt: null,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    category: true,
                    price: true,
                    provider: {
                        select: {
                            businessName: true,
                            city: true
                        }
                    }
                },
                take: Math.ceil(limit / 2)
            });

            serviceSuggestions.forEach(service => {
                suggestions.push({
                    text: service.name,
                    type: 'service',
                    id: service.id,
                    metadata: {
                        businessName: service.provider.businessName,
                        city: service.provider.city,
                        price: Number(service.price)
                    }
                });
            });
        }

        // Sugerencias de proveedores
        if (type === 'all' || type === 'providers') {
            const providerSuggestions = await this.prisma.provider.findMany({
                where: {
                    status: ProviderStatus.ACTIVE,
                    businessName: { contains: query, mode: 'insensitive' }
                },
                select: {
                    id: true,
                    businessName: true,
                    city: true
                },
                take: Math.ceil(limit / 2)
            });

            providerSuggestions.forEach(provider => {
                suggestions.push({
                    text: provider.businessName,
                    type: 'provider',
                    id: provider.id,
                    metadata: {
                        city: provider.city
                    }
                });
            });
        }

        return suggestions.slice(0, limit);
    }

    /**
     * Búsqueda de servicios populares
     */
    async getPopularServices(limit: number = 10): Promise<SearchResultDto[]> {
        const services = await this.prisma.service.findMany({
            where: {
                status: ServiceStatus.ACTIVE,
                isAvailable: true,
                deletedAt: null
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        businessType: true,
                        address: true,
                        city: true,
                        region: true,
                        phone: true,
                        email: true,
                        rating: true,
                        reviewCount: true,
                        status: true,
                        latitude: true,
                        longitude: true
                    }
                },
                serviceImages: {
                    select: {
                        id: true,
                        url: true,
                        alt: true
                    }
                }
            },
            orderBy: { price: 'asc' },
            take: limit
        });

        return services.map(service => this.mapToSearchResult(service));
    }

    /**
     * Búsqueda de servicios en oferta
     */
    async getDiscountedServices(limit: number = 10): Promise<SearchResultDto[]> {
        const services = await this.prisma.service.findMany({
            where: {
                status: ServiceStatus.ACTIVE,
                isAvailable: true,
                deletedAt: null,
                discountedPrice: { not: null }
            },
            include: {
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        businessType: true,
                        address: true,
                        city: true,
                        region: true,
                        phone: true,
                        email: true,
                        rating: true,
                        reviewCount: true,
                        status: true,
                        latitude: true,
                        longitude: true
                    }
                },
                serviceImages: {
                    select: {
                        id: true,
                        url: true,
                        alt: true
                    }
                }
            },
            orderBy: { price: 'asc' },
            take: limit
        });

        return services.map(service => this.mapToSearchResult(service));
    }

    /**
     * Calcular estadísticas de búsqueda
     */
    private async calculateSearchStatistics(where: any): Promise<any> {
        const [priceStats, typeStats] = await Promise.all([
            this.prisma.service.aggregate({
                where,
                _avg: { price: true },
                _min: { price: true },
                _max: { price: true }
            }),
            this.prisma.service.groupBy({
                by: ['type'],
                where,
                _count: { type: true },
                orderBy: { _count: { type: 'desc' } }
            })
        ]);

        return {
            averagePrice: Number(priceStats._avg.price) || 0,
            averageRating: 0, // Campo no disponible en el schema actual
            priceRange: {
                min: Number(priceStats._min.price) || 0,
                max: Number(priceStats._max.price) || 0
            },
            serviceTypes: typeStats.map(item => ({
                type: item.type,
                count: item._count.type
            }))
        };
    }

    /**
     * Generar sugerencias de búsqueda
     */
    private async generateSuggestions(query: string): Promise<string[]> {
        if (!query || query.length < 3) {
            return [];
        }

        // Obtener categorías populares que coincidan con la búsqueda
        const categories = await this.prisma.service.findMany({
            where: {
                status: ServiceStatus.ACTIVE,
                isAvailable: true,
                deletedAt: null,
                category: { contains: query, mode: 'insensitive' }
            },
            select: { category: true },
            distinct: ['category'],
            take: 5
        });

        return categories
            .map(cat => cat.category)
            .filter(cat => cat !== null) as string[];
    }

    /**
     * Calcular distancia entre dos puntos geográficos (fórmula de Haversine)
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radio de la Tierra en kilómetros
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 100) / 100; // Redondear a 2 decimales
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Mapear entidad de Prisma a DTO de resultado de búsqueda
     */
    private mapToSearchResult(service: any): SearchResultDto {
        const result: SearchResultDto = {
            id: service.id,
            name: service.name,
            description: service.description || '',
            type: service.type,
            category: service.category || '',
            price: Number(service.price),
            discountedPrice: service.discountedPrice ? Number(service.discountedPrice) : undefined,
            duration: service.duration || 0,
            status: service.status,
            isAvailable: service.isAvailable,
            rating: 0, // Campo no disponible en el schema actual
            reviewCount: 0, // Campo no disponible en el schema actual
            createdAt: service.createdAt,
            updatedAt: service.updatedAt
        };

        // Agregar distancia si está disponible
        if (service.distance !== undefined) {
            result.distance = service.distance;
        }

        // Agregar información del proveedor
        if (service.provider) {
            result.provider = {
                id: service.provider.id,
                businessName: service.provider.businessName,
                businessType: service.provider.businessType,
                address: service.provider.address,
                city: service.provider.city,
                region: service.provider.region,
                phone: service.provider.phone,
                email: service.provider.email,
                rating: Number(service.provider.rating) || 0,
                reviewCount: service.provider.reviewCount || 0,
                isVerified: service.provider.status === ProviderStatus.VERIFIED,
                latitude: service.provider.latitude,
                longitude: service.provider.longitude
            };
        }

        // Agregar imágenes
        if (service.serviceImages && service.serviceImages.length > 0) {
            result.images = service.serviceImages.map((img: any) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
                isMain: false // Campo no disponible en el schema actual
            }));
        }

        // Agregar reseñas
        if (service.reviews && service.reviews.length > 0) {
            result.reviews = service.reviews.map((review: any) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
                user: {
                    firstName: review.user.firstName,
                    lastName: review.user.lastName
                }
            }));
        }

        // Agregar información de descuentos
        if (service.discountedPrice && service.discountedPrice < service.price) {
            const discountPercentage = Math.round(((Number(service.price) - Number(service.discountedPrice)) / Number(service.price)) * 100);
            result.discountInfo = {
                hasDiscount: true,
                discountPercentage,
                originalPrice: Number(service.price)
            };
        }

        return result;
    }
}
