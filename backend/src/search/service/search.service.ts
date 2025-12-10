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
                    website: true,
                    instagram: true,
                    facebook: true,
                    twitter: true,
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
            case 'rating':
                orderBy = { rating: sortOrder };
                break;
            case 'relevance':
            default:
                // Para relevancia, usar un ordenamiento semi-aleatorio para diversidad
                orderBy = { id: sortOrder };
                break;
        }

        // Ejecutar búsqueda con diversidad geográfica
        let services: any[];
        let total: number;

        if (sortBy === 'relevance' && !city && !region) {
            // Si es búsqueda por relevancia sin filtro de ubicación, diversificar resultados
            // Obtener TODOS los servicios para poder diversificar correctamente
            const [allServices, totalCount] = await Promise.all([
                this.prisma.service.findMany({
                    where,
                    include,
                    orderBy: { createdAt: 'desc' }
                    // NO limitar aquí - queremos todos los servicios para diversificar
                }),
                this.prisma.service.count({ where })
            ]);

            console.log(`📊 Total services found: ${allServices.length}, diversifying for page ${page}...`);

            // Diversificar servicios por ubicación
            services = this.diversifyByLocation(allServices, limit, skip);
            total = totalCount;

            console.log(`✅ Diversified services: ${services.length} for page ${page}`);
        } else {
            // Búsqueda normal
            [services, total] = await Promise.all([
                this.prisma.service.findMany({
                    where,
                    include,
                    orderBy,
                    skip,
                    take: limit
                }),
                this.prisma.service.count({ where })
            ]);
        }

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

    /**
     * Obtener servicios similares para comparación
     */
    async getSimilarServices(serviceId: string, limit: number = 6): Promise<SearchResultDto[]> {
        // Obtener el servicio original
        const originalService = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                provider: true
            }
        });

        if (!originalService) {
            return [];
        }

        // Buscar servicios similares basados en:
        // 1. Mismo tipo de servicio
        // 2. Rango de precio más amplio para mayor variedad (±50%)
        // 3. Diferente proveedor (para comparar)
        const minPrice = Number(originalService.price) * 0.5;
        const maxPrice = Number(originalService.price) * 1.5;

        // Obtener más servicios de los necesarios para poder randomizar
        const fetchLimit = Math.min(limit * 3, 50);

        const similarServices = await this.prisma.service.findMany({
            where: {
                id: { not: serviceId }, // Excluir el servicio actual
                type: originalService.type, // Mismo tipo
                status: ServiceStatus.ACTIVE,
                isAvailable: true,
                price: {
                    gte: minPrice,
                    lte: maxPrice
                },
                providerId: { not: originalService.providerId }, // Diferente proveedor
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
            take: fetchLimit
        });

        // Randomizar los servicios para mayor variedad
        const shuffled = similarServices.sort(() => Math.random() - 0.5);

        // Si hay coordenadas del proveedor original, calcular distancias
        let servicesWithDistance = shuffled;
        if (originalService.provider.latitude && originalService.provider.longitude) {
            servicesWithDistance = shuffled.map(service => {
                const serviceWithProvider = service as any;
                if (serviceWithProvider.provider?.latitude && serviceWithProvider.provider?.longitude) {
                    const distance = this.calculateDistance(
                        originalService.provider.latitude!,
                        originalService.provider.longitude!,
                        serviceWithProvider.provider.latitude,
                        serviceWithProvider.provider.longitude
                    );
                    return { ...service, distance };
                }
                return service;
            });

            // Mezcla de criterios: algunos por precio, otros por distancia, algunos random
            servicesWithDistance = servicesWithDistance.sort((a: any, b: any) => {
                const rand = Math.random();
                if (rand < 0.33) {
                    // 33% ordenar por precio
                    return Number(a.price) - Number(b.price);
                } else if (rand < 0.66 && a.distance && b.distance) {
                    // 33% ordenar por distancia
                    return a.distance - b.distance;
                }
                // 33% mantener aleatorio
                return 0;
            });
        }

        // Tomar solo el límite solicitado
        return servicesWithDistance.slice(0, limit).map(service => this.mapToSearchResult(service));
    }

    /**
     * Diversificar resultados por ubicación para evitar agrupar servicios de la misma comuna
     * Primero diversifica por región, luego por ciudad dentro de cada región
     */
    private diversifyByLocation(services: any[], limit: number, skip: number): any[] {
        if (services.length === 0) {
            console.log('⚠️ No services to diversify');
            return [];
        }

        console.log(`🔄 Diversifying ${services.length} services...`);

        // Agrupar por región y ciudad
        const byRegionCity = new Map<string, Map<string, any[]>>();
        const regionStats: Record<string, number> = {};

        services.forEach(service => {
            const region = service.provider?.region || 'Sin región';
            const city = service.provider?.city || 'Sin ciudad';

            // Estadísticas
            regionStats[region] = (regionStats[region] || 0) + 1;

            if (!byRegionCity.has(region)) {
                byRegionCity.set(region, new Map());
            }

            const regionMap = byRegionCity.get(region)!;
            if (!regionMap.has(city)) {
                regionMap.set(city, []);
            }

            regionMap.get(city)!.push(service);
        });

        console.log('📍 Services by region:', regionStats);
        console.log(`🗺️ Total regions: ${byRegionCity.size}, Total cities: ${Array.from(byRegionCity.values()).reduce((sum, cities) => sum + cities.size, 0)}`);

        // Distribuir servicios alternando entre regiones y ciudades
        const diversified: any[] = [];
        const regions = Array.from(byRegionCity.keys());

        // Shuffle regions para no favorecer siempre las mismas
        for (let i = regions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [regions[i], regions[j]] = [regions[j], regions[i]];
        }

        let regionIndex = 0;
        const cityIndexByRegion = new Map<string, number>();

        // Inicializar índices de ciudades
        regions.forEach(region => {
            cityIndexByRegion.set(region, 0);
        });

        // Distribuir servicios - Round Robin entre regiones
        let iterations = 0;
        const maxIterations = services.length * 2; // Prevenir loops infinitos

        while (diversified.length < services.length && regions.length > 0 && iterations < maxIterations) {
            iterations++;
            const region = regions[regionIndex % regions.length];
            const citiesInRegion = byRegionCity.get(region)!;
            const cityKeys = Array.from(citiesInRegion.keys());

            if (cityKeys.length === 0) {
                // Eliminar región si no tiene más ciudades
                regions.splice(regionIndex % regions.length, 1);
                if (regions.length === 0) break;
                continue;
            }

            // Obtener ciudad de forma rotativa
            const cityIdx = cityIndexByRegion.get(region)! % cityKeys.length;
            const city = cityKeys[cityIdx];
            const cityServices = citiesInRegion.get(city)!;

            if (cityServices.length > 0) {
                diversified.push(cityServices.shift()!);
            }

            // Actualizar o eliminar ciudad si está vacía
            if (cityServices.length === 0) {
                citiesInRegion.delete(city);
            }

            // Actualizar índice de ciudad para la región
            cityIndexByRegion.set(region, cityIdx + 1);

            regionIndex++;
        }

        console.log(`✅ Diversified ${diversified.length} services. Applying pagination: skip=${skip}, limit=${limit}`);

        // Aplicar paginación
        const paginatedResults = diversified.slice(skip, skip + limit);

        console.log(`📄 Returning ${paginatedResults.length} services for current page`);

        return paginatedResults;
    }

    /**
     * Obtener todas las ubicaciones disponibles (regiones y ciudades)
     */
    async getAvailableLocations(): Promise<{
        regions: string[];
        cities: string[];
        regionCityMap: Record<string, string[]>;
    }> {
        console.log('🔍 Loading all available locations...');

        // Obtener proveedores que tienen servicios activos (sin filtrar por status VERIFIED)
        const providers = await this.prisma.provider.findMany({
            where: {
                services: {
                    some: {
                        status: 'ACTIVE',
                        isAvailable: true,
                        deletedAt: null
                    }
                }
            },
            select: {
                region: true,
                city: true,
                status: true
            }
        });

        console.log(`📍 Found ${providers.length} providers with active services`);

        const regionsSet = new Set<string>();
        const citiesSet = new Set<string>();
        const regionCityMap: Record<string, Set<string>> = {};

        providers.forEach(provider => {
            if (provider.region) {
                regionsSet.add(provider.region);

                if (!regionCityMap[provider.region]) {
                    regionCityMap[provider.region] = new Set();
                }

                if (provider.city) {
                    citiesSet.add(provider.city);
                    regionCityMap[provider.region].add(provider.city);
                }
            }
        });

        // Convertir Sets a arrays y ordenar
        const regions = Array.from(regionsSet).sort();
        const cities = Array.from(citiesSet).sort();

        // Convertir Sets en el mapa a arrays
        const regionCityMapArray: Record<string, string[]> = {};
        Object.keys(regionCityMap).forEach(region => {
            regionCityMapArray[region] = Array.from(regionCityMap[region]).sort();
        });

        console.log(`✅ Loaded ${regions.length} regions and ${cities.length} cities`);
        console.log('📊 Regions:', regions);

        return {
            regions,
            cities,
            regionCityMap: regionCityMapArray
        };
    }
}
