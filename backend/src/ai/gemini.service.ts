import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private readonly logger = new Logger(GeminiService.name);

    constructor() {
        this.logger.log('[GeminiService] Inicializando...');
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

        if (!apiKey) {
            this.logger.error('GOOGLE_GEMINI_API_KEY no está configurada');
            throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');
        }

        this.logger.log(`API Key: ${apiKey.substring(0, 15)}...`);
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Usa gemini-2.0-flash - modelo rápido y eficiente disponible en tu API key
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        this.logger.log('Modelo gemini-2.0-flash inicializado correctamente');
    }    /**
     * Genera insights de precios basados en datos de servicios
     */
    async generatePriceInsights(services: any[]): Promise<string> {
        const prompt = `
Analiza los siguientes servicios de lavado de autos y genera insights sobre tendencias de precios:

${services.map(s => `- ${s.name}: $${s.price} (${s.provider?.name || 'N/A'})`).join('\n')}

Proporciona:
1. Precio promedio
2. Tendencia general (si están subiendo o bajando)
3. Mejores ofertas
4. Recomendaciones

Responde en español, formato conciso y profesional.
`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    /**
     * Recomienda proveedores basándose en preferencias del usuario
     */
    async recommendProviders(userPreferences: {
        location?: string;
        budget?: number;
        serviceType?: string;
    }, providers: any[]): Promise<string> {
        const prompt = `
Como experto en lavado de autos, recomienda los mejores proveedores para este usuario:

Preferencias del usuario:
- Ubicación: ${userPreferences.location || 'No especificada'}
- Presupuesto: $${userPreferences.budget || 'Flexible'}
- Tipo de servicio: ${userPreferences.serviceType || 'Cualquiera'}

Proveedores disponibles:
${providers.map(p => `
- ${p.name}
  Rating: ${p.averageRating || 'N/A'} ⭐
  Ubicación: ${p.address || 'N/A'}
  Servicios: ${p.services?.length || 0}
`).join('\n')}

Proporciona:
1. Top 3 proveedores recomendados
2. Razones específicas para cada uno
3. Mejor relación calidad-precio

Responde en español, formato claro y conciso.
`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    /**
     * Analiza el mejor día para reservar basándose en disponibilidad histórica
     */
    async analyzeBestBookingDay(bookingData: any[]): Promise<string> {
        const prompt = `
Analiza los siguientes datos de reservas y determina el mejor día de la semana para reservar:

${bookingData.map(b => `- ${b.dayOfWeek}: ${b.bookingCount} reservas, disponibilidad: ${b.availability}%`).join('\n')}

Proporciona:
1. Mejor día para reservar (menos ocupado)
2. Días con más descuentos típicamente
3. Recomendación personalizada

Responde en español, breve y útil.
`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    /**
     * Genera respuesta a pregunta general del usuario
     */
    async chatAssistant(userMessage: string, context?: string): Promise<string> {
        this.logger.log(`[chatAssistant] Mensaje: "${userMessage}"`);

        const prompt = `
Eres un asistente experto en servicios de lavado de autos en Chile.

${context ? `Contexto: ${context}\n` : ''}

Usuario pregunta: ${userMessage}

Responde de manera útil, profesional y amigable en español.
`;

        try {
            this.logger.log('[chatAssistant] Llamando a Gemini API...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            this.logger.log(`[chatAssistant] Respuesta: ${text.substring(0, 100)}...`);
            return text;
        } catch (error) {
            this.logger.error('[chatAssistant] Error:', error);
            throw error;
        }
    }

    /**
     * Calcula potencial de ahorro basado en comparación de precios
     */
    async calculateSavingsPotential(userCurrentSpending: number, averageMarketPrice: number): Promise<string> {
        const prompt = `
El usuario actualmente gasta $${userCurrentSpending} en lavado de autos.
El precio promedio del mercado es $${averageMarketPrice}.

Calcula:
1. Potencial de ahorro mensual
2. Ahorro anual proyectado
3. Recomendaciones para maximizar ahorro

Responde en español, con números claros.
`;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    /**
     * Genera resultados de búsqueda inteligente basados en el historial del usuario
     */
    async generateSmartSearchResults(
        userQuery: string,
        userContext: {
            bookings: any[];
            favorites: any[];
            hasHistory: boolean;
        },
        availableServices: any[],
    ): Promise<string> {
        const historyContext = userContext.hasHistory
            ? `
Historial del usuario:
- Reservas previas: ${userContext.bookings.length}
${userContext.bookings.slice(0, 5).map(b => `  * ${b.service?.name || 'N/A'} - $${b.service?.price || 0} en ${b.service?.provider?.name || 'N/A'} (${b.service?.provider?.address || 'Sin dirección'})`).join('\n')}

- Favoritos: ${userContext.favorites.length}
${userContext.favorites.slice(0, 5).map(f => `  * ${f.provider?.name || 'N/A'} - ${f.provider?.address || 'Sin dirección'} - ${f.provider?.services?.length || 0} servicios disponibles`).join('\n')}
`
            : '\nEl usuario no tiene historial de reservas ni favoritos. Recomienda los servicios más populares, mejor valorados y que se ajusten a su búsqueda.';

        // Crear un resumen detallado de TODOS los servicios disponibles
        const servicesDetails = availableServices.map(s => {
            const reviews = s.provider?.reviews || [];
            const avgRating = s.provider?.rating || 0;
            const reviewSummary = reviews.length > 0
                ? reviews.slice(0, 2).map(r => `"${r.comment?.substring(0, 100) || 'Sin comentario'}" (${r.rating}⭐)`).join('; ')
                : 'Sin reseñas';

            return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚗 ${s.name}
   💰 Precio: $${s.price?.toLocaleString('es-CL')}
   ⏱️  Duración: ${s.duration} minutos
   ${s.description ? `📝 Descripción: ${s.description}` : ''}
   
   🏢 Proveedor: ${s.provider?.name || 'N/A'}
   ⭐ Rating: ${avgRating.toFixed(1)}/5.0 (${reviews.length} reseñas)
   📍 Ubicación: ${s.provider?.address || 'Sin dirección especificada'}
   ${s.provider?.city ? `🌆 Ciudad: ${s.provider.city}` : ''}
   ${s.provider?.phone ? `📞 Teléfono: ${s.provider.phone}` : ''}
   ${s.provider?.email ? `📧 Email: ${s.provider.email}` : ''}
   
   💬 Reseñas recientes: ${reviewSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        }).join('\n');

        const prompt = `
Eres un asistente experto en servicios de lavado de autos en Chile. Tu trabajo es analizar la consulta del usuario y recomendar los mejores servicios disponibles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONSULTA DEL USUARIO:
"${userQuery}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${historyContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SERVICIOS DISPONIBLES (${availableServices.length} servicios):
${servicesDetails}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCCIONES:
1. Analiza cuidadosamente la consulta del usuario (presupuesto, ubicación, tipo de servicio, preferencias)
2. Revisa TODOS los servicios disponibles y sus ubicaciones exactas
3. ${userContext.hasHistory
                ? 'Considera el historial del usuario para dar recomendaciones personalizadas'
                : 'Como no hay historial, enfócate en los servicios mejor valorados y que coincidan con la búsqueda'}
4. Recomienda los 3-5 MEJORES servicios que coincidan con la consulta
5. Menciona ESPECÍFICAMENTE:
   - Nombre del servicio y proveedor
   - Precio exacto
   - Ubicación exacta (dirección completa)
   - Por qué es una buena opción para esta búsqueda
   - Rating y cantidad de reseñas

FORMATO DE RESPUESTA:
- Escribe en español de forma natural y conversacional
- Sé específico con nombres, precios y ubicaciones
- Explica por qué recomiendas cada servicio
- Si no hay opciones exactas que cumplan todos los criterios, sugiere alternativas cercanas
- Termina con un consejo útil o tip adicional

Responde de manera amigable, clara y profesional.
`;

        try {
            this.logger.log('[generateSmartSearchResults] Generando recomendaciones...');
            this.logger.log(`[generateSmartSearchResults] Servicios analizados: ${availableServices.length}`);

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            this.logger.log(`[generateSmartSearchResults] Recomendaciones generadas: ${text.substring(0, 150)}...`);
            return text;
        } catch (error) {
            this.logger.error('[generateSmartSearchResults] Error:', error);
            throw error;
        }
    }

    /**
     * Genera análisis completo con IA de un proveedor
     */
    async analyzeProvider(
        provider: any,
        stats: any,
        userBookings: any[],
    ): Promise<string> {
        const hasUserHistory = userBookings.length > 0;

        const userContext = hasUserHistory
            ? `\nEste usuario ha utilizado los servicios de ${provider.businessName} antes:\n${userBookings.map(b => `- ${b.service?.name} el ${new Date(b.createdAt).toLocaleDateString('es-CL')} por $${b.service?.price}`).join('\n')}\n`
            : '\nEste usuario no ha utilizado este proveedor antes.';

        const reviewsSummary = provider.reviews.slice(0, 10).map((r: any) => `
- Rating: ${r.rating}/5 ⭐
  Usuario: ${r.user?.firstName || 'Anónimo'}
  Comentario: "${r.comment || 'Sin comentario'}"
  Fecha: ${new Date(r.createdAt).toLocaleDateString('es-CL')}
`).join('\n');

        const prompt = `
Eres un experto analista de servicios de lavado de autos. Genera un análisis completo y profesional de este proveedor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏪 INFORMACIÓN DEL PROVEEDOR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre: ${provider.businessName}
Tipo: ${provider.businessType}
Ubicación: ${provider.address}, ${provider.city}, ${provider.region}
Teléfono: ${provider.phone || 'No especificado'}
Email: ${provider.email || 'No especificado'}
Website: ${provider.website || 'No especificado'}
Descripción: ${provider.description || 'Sin descripción'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ESTADÍSTICAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Servicios ofrecidos: ${stats.totalServices}
Reseñas totales: ${stats.totalReviews}
Calificación promedio: ${stats.averageRating.toFixed(1)}/5.0 ⭐

Rango de precios:
- Mínimo: $${stats.priceRange.min?.toLocaleString('es-CL')}
- Máximo: $${stats.priceRange.max?.toLocaleString('es-CL')}
- Promedio: $${stats.priceRange.average?.toLocaleString('es-CL')}

Distribución de calificaciones:
- 5 estrellas: ${stats.ratingDistribution[5]} reseñas (${((stats.ratingDistribution[5] / stats.totalReviews) * 100).toFixed(0)}%)
- 4 estrellas: ${stats.ratingDistribution[4]} reseñas (${((stats.ratingDistribution[4] / stats.totalReviews) * 100).toFixed(0)}%)
- 3 estrellas: ${stats.ratingDistribution[3]} reseñas (${((stats.ratingDistribution[3] / stats.totalReviews) * 100).toFixed(0)}%)
- 2 estrellas: ${stats.ratingDistribution[2]} reseñas (${((stats.ratingDistribution[2] / stats.totalReviews) * 100).toFixed(0)}%)
- 1 estrella: ${stats.ratingDistribution[1]} reseñas (${((stats.ratingDistribution[1] / stats.totalReviews) * 100).toFixed(0)}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 RESEÑAS RECIENTES (Top 10):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reviewsSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 SERVICIOS OFRECIDOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${provider.services.map((s: any) => `
- ${s.name}
  Precio: $${s.price?.toLocaleString('es-CL')}
  Duración: ${s.duration} min
  Categoría: ${s.category}
  ${s.description ? `Descripción: ${s.description}` : ''}
`).join('\n')}
${userContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERA UN ANÁLISIS COMPLETO QUE INCLUYA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📊 ANÁLISIS GENERAL:
   - Evaluación de la calidad general del proveedor
   - Puntos fuertes destacados
   - Áreas de mejora o preocupaciones

2. 👥 OPINIÓN DE CLIENTES:
   - Síntesis de las reseñas más relevantes
   - Patrones positivos recurrentes
   - Quejas o problemas comunes (si los hay)
   - Tendencia de satisfacción del cliente

3. 💰 RELACIÓN CALIDAD-PRECIO:
   - Evaluación si los precios son justos
   - Comparación con el promedio del mercado
   - Servicios que ofrecen mejor valor

4. 🚗 SERVICIOS RECOMENDADOS:
   - Top 3 servicios más recomendados y por qué
   - Servicios especiales o diferenciadores

5. ✅ RECOMENDACIÓN FINAL:
   - ¿Recomendarías este proveedor? ¿Por qué?
   - Tipo de cliente ideal para este proveedor
   - Consejos para aprovechar mejor sus servicios

${hasUserHistory ? '\n6. 📋 NOTA PERSONALIZADA:\n   - Basado en el historial del usuario, ofrece recomendaciones específicas' : ''}

Responde en español, de manera profesional, clara y objetiva. Usa párrafos naturales y emojis para hacer el texto más atractivo.
`;

        try {
            this.logger.log('[analyzeProvider] Generando análisis...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            this.logger.log(`[analyzeProvider] Análisis generado: ${text.substring(0, 150)}...`);
            return text;
        } catch (error) {
            this.logger.error('[analyzeProvider] Error:', error);
            throw error;
        }
    }
}
