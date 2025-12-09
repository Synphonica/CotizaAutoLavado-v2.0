import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface SearchQuery {
    location?: string;
    serviceType?: string;
    date?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    additionalPreferences?: string[];
}

@Injectable()
export class SearchAiService {
    private readonly logger = new Logger(SearchAiService.name);

    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService,
    ) { }

    /**
     * RF-071: Búsqueda Semántica en Lenguaje Natural
     * Convierte consulta en lenguaje natural a búsqueda estructurada
     */
    async parseNaturalLanguageQuery(query: string): Promise<{
        structuredQuery: SearchQuery;
        explanation: string;
        confidence: number;
    }> {
        try {
            this.logger.log(`Procesando búsqueda: "${query}"`);

            const systemInstruction = `Eres un asistente especializado en interpretar búsquedas de servicios de autolavado en Chile.
Debes extraer información estructurada de consultas en lenguaje natural en español chileno.

Contexto geográfico: Chile, especialmente Región Metropolitana
Tipos de servicio: lavado básico, lavado completo, lavado express, encerado, pulido, lavado de motor, lavado interior, detailing

Extrae y normaliza:
- Ubicación (comunas, barrios, calles de Santiago)
- Tipo de servicio
- Fecha/día (convierte a formato ISO)
- Rango de precios (en pesos chilenos CLP)
- Calificación mínima
- Preferencias adicionales

Responde SOLO con JSON sin texto adicional.`;

            const prompt = `Analiza esta consulta de búsqueda: "${query}"

Retorna JSON con esta estructura:
{
  "structuredQuery": {
    "location": "ubicación extraída o null",
    "serviceType": "tipo de servicio o null",
    "date": "fecha ISO o null",
    "priceRange": {"min": número, "max": número} o null,
    "rating": número 1-5 o null,
    "additionalPreferences": ["lista de preferencias"]
  },
  "explanation": "explicación breve de qué entendiste de la consulta",
  "confidence": número entre 0 y 1 indicando confianza en la interpretación
}`;

            const result = await this.geminiService.extractStructuredData<{
                structuredQuery: SearchQuery;
                explanation: string;
                confidence: number;
            }>(query, JSON.stringify({
                structuredQuery: {},
                explanation: '',
                confidence: 0,
            }), systemInstruction + '\n' + prompt);

            this.logger.log(`Búsqueda estructurada: ${JSON.stringify(result.structuredQuery)}`);

            return result;
        } catch (error) {
            this.logger.error('Error al parsear búsqueda:', error);

            // Fallback: retornar búsqueda básica
            return {
                structuredQuery: {},
                explanation: 'No se pudo interpretar la consulta, mostrando todos los resultados',
                confidence: 0,
            };
        }
    }

    /**
     * RF-083: Autocompletado Inteligente con Comprensión Semántica
     */
    async getSuggestions(partial: string, userLocation?: string): Promise<string[]> {
        try {
            if (partial.length < 2) return [];

            const systemInstruction = `Eres un asistente que sugiere autocompletados inteligentes para búsquedas de servicios de autolavado en Chile.
Debes entender sinónimos, corregir errores ortográficos y sugerir completaciones contextuales.

Contexto: Servicios de autolavado en ${userLocation || 'Santiago, Chile'}

Genera 5 sugerencias relevantes y naturales.`;

            const prompt = `Usuario escribió: "${partial}"

Genera 5 sugerencias de autocompletado contextualmente relevantes.

Responde con JSON:
{
  "suggestions": ["sugerencia 1", "sugerencia 2", ...]
}`;

            const result = await this.geminiService.extractStructuredData<{
                suggestions: string[];
            }>(partial, JSON.stringify({ suggestions: [] }), systemInstruction + '\n' + prompt);

            return result.suggestions || [];
        } catch (error) {
            this.logger.error('Error al generar sugerencias:', error);
            return [];
        }
    }

    /**
     * Explica por qué un resultado coincide con la búsqueda
     */
    async explainMatch(
        query: string,
        providerName: string,
        providerData: any
    ): Promise<string> {
        try {
            const prompt = `El usuario buscó: "${query}"

Se encontró este proveedor:
Nombre: ${providerName}
Ubicación: ${providerData.city}, ${providerData.region}
Servicios: ${providerData.services?.map((s: any) => s.name).join(', ')}
Calificación: ${providerData.rating}/5
Precio desde: $${providerData.minPrice}

Explica en 1-2 líneas por qué este resultado es relevante para la búsqueda del usuario.
Responde en español chileno, de forma natural y conversacional.`;

            const explanation = await this.geminiService.generateText(prompt);
            return explanation.trim();
        } catch (error) {
            this.logger.error('Error al explicar coincidencia:', error);
            return 'Este resultado coincide con tu búsqueda.';
        }
    }

    /**
     * Obtener recomendaciones personalizadas basadas en historial
     */
    async getPersonalizedRecommendations(clerkId: string, location?: string) {
        try {
            this.logger.log(`Generando recomendaciones para usuario: ${clerkId}`);

            // Buscar usuario y su historial
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
                include: {
                    bookings: {
                        include: {
                            provider: {
                                include: {
                                    services: true,
                                    reviews: true,
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                    favorites: {
                        include: {
                            provider: {
                                include: {
                                    services: true,
                                    reviews: true,
                                }
                            }
                        }
                    },
                    reviews: {
                        include: {
                            provider: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    }
                }
            });

            const hasHistory = user && (
                user.bookings.length > 0 ||
                user.favorites.length > 0 ||
                user.reviews.length > 0
            );

            if (hasHistory) {
                // Generar recomendaciones basadas en historial
                const historyData = {
                    bookings: user.bookings.map(b => ({
                        provider: b.provider.businessName,
                        services: b.provider.services.map(s => s.name),
                        date: b.createdAt,
                    })),
                    favorites: user.favorites.map(f => ({
                        provider: f.provider.businessName,
                        services: f.provider.services.map(s => s.name),
                    })),
                    reviews: user.reviews.map(r => ({
                        provider: r.provider.businessName,
                        rating: r.rating,
                        comment: r.comment?.substring(0, 100),
                    }))
                };

                const prompt = `Analiza el historial de este usuario y genera recomendaciones personalizadas:

Historial:
${JSON.stringify(historyData, null, 2)}

Ubicación actual: ${location || 'No especificada'}

Genera 3 recomendaciones explicando por qué cada una es relevante según su historial.
Responde con JSON:
{
  "recommendations": [
    {
      "title": "título corto",
      "description": "por qué se recomienda según historial",
      "searchQuery": "consulta de búsqueda sugerida",
      "reason": "razón personalizada"
    }
  ],
  "hasHistory": true
}`;

                const result = await this.geminiService.extractStructuredData<{
                    recommendations: Array<{
                        title: string;
                        description: string;
                        searchQuery: string;
                        reason: string;
                    }>;
                    hasHistory: boolean;
                }>(JSON.stringify(historyData), JSON.stringify({ recommendations: [], hasHistory: true }), prompt);

                return result;
            } else {
                // Sin historial: recomendar mejores o más cercanos
                const topProviders = await this.prisma.provider.findMany({
                    where: {
                        status: 'ACTIVE',
                        ...(location && {
                            OR: [
                                { city: { contains: location, mode: 'insensitive' } },
                                { region: { contains: location, mode: 'insensitive' } },
                            ]
                        })
                    },
                    include: {
                        services: true,
                        _count: {
                            select: { reviews: true }
                        }
                    },
                    orderBy: {
                        reviews: {
                            _count: 'desc'
                        }
                    },
                    take: 10,
                });

                const providersData = topProviders.map(p => ({
                    name: p.businessName,
                    city: p.city,
                    rating: 0, // Sin acceso directo a reviews, usar 0 por defecto
                    reviewCount: p._count.reviews,
                    services: p.services.map(s => s.name),
                }));

                return {
                    recommendations: [
                        {
                            title: "🌟 Mejores Calificados",
                            description: "Autolavados con las mejores reseñas de clientes",
                            searchQuery: "mejores autolavados cerca de mí",
                            reason: "Usuarios nuevos prefieren servicios con excelente reputación"
                        },
                        {
                            title: "📍 Más Cercanos",
                            description: `Autolavados ${location ? `en ${location}` : 'cerca de tu ubicación'}`,
                            searchQuery: location ? `autolavados en ${location}` : "autolavados cerca de mí",
                            reason: "Encuentra servicios convenientes cerca de ti"
                        },
                        {
                            title: "💰 Mejor Relación Calidad-Precio",
                            description: "Servicios económicos con buenas calificaciones",
                            searchQuery: "lavado económico con buenas reseñas",
                            reason: "Ahorra sin sacrificar calidad"
                        }
                    ],
                    hasHistory: false,
                    topProviders: providersData.slice(0, 5),
                };
            }
        } catch (error) {
            this.logger.error('Error al generar recomendaciones:', error);
            throw error;
        }
    }

    /**
     * Búsqueda avanzada con prompt libre
     */
    async advancedSearch(prompt: string, clerkId: string, location?: string) {
        try {
            this.logger.log(`Búsqueda avanzada: "${prompt}"`);

            // Obtener contexto del usuario
            const user = await this.prisma.user.findUnique({
                where: { clerkId },
                select: {
                    bookings: {
                        include: { provider: true },
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    },
                    favorites: {
                        include: { provider: true },
                        take: 3,
                    }
                }
            });

            // Obtener todos los proveedores activos (limitado para no sobrecargar Gemini)
            const providers = await this.prisma.provider.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    services: true,
                    _count: {
                        select: { reviews: true }
                    }
                },
                take: 50, // Limitar a los primeros 50 proveedores
            });

            // Simplificar datos para Gemini
            const providersData = providers.map(p => ({
                id: p.id,
                name: p.businessName,
                city: p.city,
                services: p.services.slice(0, 5).map(s => s.name).join(', '), // Solo nombres
                priceRange: p.services.length > 0
                    ? `${Math.min(...p.services.map(s => Number(s.price)))}-${Math.max(...p.services.map(s => Number(s.price)))}`
                    : 'N/A',
                reviewCount: p._count.reviews,
            }));

            const systemInstruction = `Eres un asistente experto en encontrar autolavados en Chile.
Analiza el prompt del usuario y selecciona los autolavados más relevantes de la base de datos.

Usuario ubicado en: ${location || 'ubicación no especificada'}
Historial del usuario: ${user?.bookings.length || 0} reservas previas

Debes entender:
- Preferencias de servicios (lavado básico, completo, detailing, etc.)
- Restricciones de precio
- Ubicación y distancia
- Calidad vs precio
- Urgencia temporal

Retorna los IDs de los proveedores más relevantes y explica por qué.`;

            const searchPrompt = `Prompt del usuario: "${prompt}"

Proveedores disponibles (${providersData.length} total):
${JSON.stringify(providersData, null, 1)}

Selecciona los 5-10 proveedores MÁS relevantes basándote en el prompt.

RETORNA SOLO JSON válido (sin markdown):
{
  "providerIds": ["id1", "id2"],
  "explanation": "breve explicación",
  "criteria": ["criterio1", "criterio2"],
  "confidence": 0.8
}`;

            const result = await this.geminiService.extractStructuredData<{
                providerIds: string[];
                explanation: string;
                criteria: string[];
                confidence: number;
            }>(prompt, JSON.stringify({ providerIds: [], explanation: '', criteria: [], confidence: 0 }), systemInstruction + '\n' + searchPrompt);

            // Obtener detalles completos de los proveedores seleccionados
            const selectedProviders = await this.prisma.provider.findMany({
                where: {
                    id: { in: result.providerIds }
                },
                include: {
                    services: true,
                    reviews: {
                        take: 3,
                        orderBy: { createdAt: 'desc' }
                    },
                }
            });

            return {
                providers: selectedProviders,
                explanation: result.explanation,
                criteria: result.criteria,
                confidence: result.confidence,
                totalResults: selectedProviders.length,
            };
        } catch (error) {
            this.logger.error('Error en búsqueda avanzada:', error);

            // Si hay error con Gemini, retornar resultados básicos
            const fallbackProviders = await this.prisma.provider.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    services: true,
                    reviews: { take: 3, orderBy: { createdAt: 'desc' } },
                },
                take: 10,
                orderBy: { createdAt: 'desc' }
            });

            return {
                providers: fallbackProviders,
                explanation: 'Se encontraron resultados basados en criterios generales debido a un problema temporal.',
                criteria: ['Resultados recientes', 'Todos los servicios'],
                confidence: 0.5,
                totalResults: fallbackProviders.length,
            };
        }
    }
}
