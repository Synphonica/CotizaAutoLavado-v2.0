import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class AiInsightsService {
    private readonly logger = new Logger(AiInsightsService.name);

    constructor(
        private prisma: PrismaService,
        private gemini: GeminiService,
    ) {
        this.logger.log('AiInsightsService inicializado con Gemini AI');
    }

    /**
     * Genera insights de tendencia de precios
     */
    async getPriceTrends(userId: string) {
        try {
            // Obtener servicios mejor valorados como muestra
            const services = await this.prisma.service.findMany({
                where: {
                    isAvailable: true,
                    status: 'ACTIVE',
                },
                include: {
                    provider: true,
                },
                orderBy: {
                    price: 'asc',
                },
                take: 10,
            });

            if (services.length === 0) {
                return {
                    available: false,
                    message: 'No hay servicios disponibles para analizar',
                };
            }

            const insights = await this.gemini.generatePriceInsights(services);

            return {
                available: true,
                insights,
                servicesAnalyzed: services.length,
            };
        } catch (error) {
            this.logger.error('Error generando insights de precios:', error);
            throw error;
        }
    }

    /**
     * Recomienda proveedores basados en preferencias
     */
    async getProviderRecommendations(userId: string, preferences?: any) {
        try {
            // Obtener proveedores mejor valorados
            const providers = await this.prisma.provider.findMany({
                where: {
                    verifiedAt: { not: null },
                },
                include: {
                    services: true,
                },
                orderBy: {
                    rating: 'desc',
                },
                take: 10,
            }); const recommendations = await this.gemini.recommendProviders(
                preferences || {},
                providers,
            );

            return {
                available: true,
                recommendations,
                providersAnalyzed: providers.length,
            };
        } catch (error) {
            this.logger.error('Error generando recomendaciones:', error);
            throw error;
        }
    }

    /**
     * Analiza mejor día para reservar
     */
    async getBestBookingDay(userId: string) {
        try {
            // Simular datos de disponibilidad (en producción, consultar base de datos real)
            const bookingData = [
                { dayOfWeek: 'Lunes', bookingCount: 45, availability: 85 },
                { dayOfWeek: 'Martes', bookingCount: 38, availability: 92 },
                { dayOfWeek: 'Miércoles', bookingCount: 52, availability: 78 },
                { dayOfWeek: 'Jueves', bookingCount: 48, availability: 82 },
                { dayOfWeek: 'Viernes', bookingCount: 65, availability: 65 },
                { dayOfWeek: 'Sábado', bookingCount: 95, availability: 35 },
                { dayOfWeek: 'Domingo', bookingCount: 70, availability: 60 },
            ];

            const analysis = await this.gemini.analyzeBestBookingDay(bookingData);

            return {
                available: true,
                analysis,
                bestDay: 'Martes',
                availability: 92,
            };
        } catch (error) {
            this.logger.error('Error analizando mejor día:', error);
            throw error;
        }
    }

    /**
     * Calcula ahorro potencial
     */
    async getSavingsPotential(userId: string) {
        try {
            // Obtener precio promedio del mercado basado en servicios activos
            const avgPrice = await this.prisma.service.aggregate({
                where: {
                    isAvailable: true,
                    status: 'ACTIVE',
                },
                _avg: {
                    price: true,
                },
            });

            const marketAvg = Number(avgPrice._avg.price || 0);
            const estimatedSpending = marketAvg * 4; // Estimado mensual (4 lavados)

            const analysis = await this.gemini.calculateSavingsPotential(
                estimatedSpending,
                marketAvg,
            );

            return {
                available: true,
                analysis,
                estimatedSpending,
                marketAverage: marketAvg,
            };
        } catch (error) {
            this.logger.error('Error calculando ahorro potencial:', error);
            throw error;
        }
    }

    /**
     * Chat assistant para preguntas generales
     */
    async chatWithAssistant(userId: string, message: string) {
        this.logger.log(`[chatWithAssistant] Iniciando chat para usuario ${userId}`);
        this.logger.log(`[chatWithAssistant] Mensaje recibido: ${message}`);

        try {
            this.logger.log('[chatWithAssistant] Llamando a Gemini API...');
            const response = await this.gemini.chatAssistant(message);
            this.logger.log(`[chatWithAssistant] Respuesta de Gemini: ${response.substring(0, 100)}...`);

            return {
                available: true,
                response,
            };
        } catch (error) {
            this.logger.error('[chatWithAssistant] Error en chat assistant:', error);
            this.logger.error('[chatWithAssistant] Stack trace:', error.stack);
            throw error;
        }
    }

    /**
     * Búsqueda inteligente con IA basada en historial del usuario
     */
    async smartSearch(userId: string, query: string) {
        this.logger.log(`[smartSearch] Usuario: ${userId}, Query: ${query}`);

        try {
            // Obtener historial del usuario
            const userBookings = await this.prisma.booking.findMany({
                where: { userId },
                include: {
                    service: {
                        include: {
                            provider: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            const userFavorites = await this.prisma.favorite.findMany({
                where: { userId },
                include: {
                    provider: {
                        include: {
                            services: true,
                        },
                    },
                },
                take: 10,
            });

            // Obtener servicios disponibles con toda la información
            const availableServices = await this.prisma.service.findMany({
                where: {
                    isAvailable: true,
                    status: 'ACTIVE',
                },
                include: {
                    provider: {
                        include: {
                            reviews: {
                                take: 5,
                                orderBy: { createdAt: 'desc' },
                                select: {
                                    rating: true,
                                    comment: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
                orderBy: [
                    { provider: { rating: 'desc' } },
                    { price: 'asc' },
                ],
                take: 50, // Aumentar a 50 servicios para más opciones
            });

            // Si no hay historial, mostrar los más populares
            const hasHistory = userBookings.length > 0 || userFavorites.length > 0;

            // Generar recomendaciones con IA
            const recommendations = await this.gemini.generateSmartSearchResults(
                query,
                {
                    bookings: userBookings,
                    favorites: userFavorites,
                    hasHistory,
                },
                availableServices,
            );

            return {
                available: true,
                query,
                hasHistory,
                recommendations,
                services: availableServices.slice(0, 10),
                totalServices: availableServices.length,
            };
        } catch (error) {
            this.logger.error('[smartSearch] Error:', error);
            throw error;
        }
    }

    /**
     * Análisis completo con IA de un proveedor específico
     */
    async analyzeProvider(providerId: string, userId?: string) {
        this.logger.log(`[analyzeProvider] Proveedor: ${providerId}, Usuario: ${userId}`);

        try {
            // Obtener información completa del proveedor
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                include: {
                    services: {
                        where: {
                            isAvailable: true,
                            status: 'ACTIVE',
                        },
                        orderBy: { price: 'asc' },
                    },
                    reviews: {
                        where: { status: 'APPROVED' },
                        orderBy: { createdAt: 'desc' },
                        take: 20,
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!provider) {
                return {
                    available: false,
                    message: 'Proveedor no encontrado',
                };
            }

            // Obtener bookings del usuario con este proveedor (si hay usuario)
            let userBookings: any[] = [];
            if (userId) {
                userBookings = await this.prisma.booking.findMany({
                    where: {
                        userId,
                        providerId,
                    },
                    include: {
                        service: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                });
            }

            // Calcular estadísticas
            const services = provider.services || [];
            const reviews = provider.reviews || [];

            const stats = {
                totalServices: services.length,
                totalReviews: reviews.length,
                averageRating: provider.rating,
                priceRange: services.length > 0 ? {
                    min: Math.min(...services.map(s => Number(s.price))),
                    max: Math.max(...services.map(s => Number(s.price))),
                    average: services.reduce((acc, s) => acc + Number(s.price), 0) / services.length,
                } : {
                    min: 0,
                    max: 0,
                    average: 0,
                },
                ratingDistribution: [
                    { rating: 5, count: reviews.filter(r => r.rating === 5).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === 5).length / reviews.length) * 100 : 0 },
                    { rating: 4, count: reviews.filter(r => r.rating === 4).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === 4).length / reviews.length) * 100 : 0 },
                    { rating: 3, count: reviews.filter(r => r.rating === 3).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === 3).length / reviews.length) * 100 : 0 },
                    { rating: 2, count: reviews.filter(r => r.rating === 2).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === 2).length / reviews.length) * 100 : 0 },
                    { rating: 1, count: reviews.filter(r => r.rating === 1).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === 1).length / reviews.length) * 100 : 0 },
                ],
            };

            // Generar análisis con IA
            const analysis = await this.gemini.analyzeProvider(
                provider,
                stats,
                userBookings,
            );

            return {
                available: true,
                provider: {
                    id: provider.id,
                    businessName: provider.businessName,
                    businessType: provider.businessType,
                    address: provider.address,
                    city: provider.city,
                    region: provider.region,
                    rating: provider.rating,
                },
                stats,
                analysis,
                hasUserHistory: userBookings.length > 0,
            };
        } catch (error) {
            this.logger.error('[analyzeProvider] Error:', error);
            throw error;
        }
    }
}
