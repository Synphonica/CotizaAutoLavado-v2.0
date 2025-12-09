import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewAnalysisService {
    private readonly logger = new Logger(ReviewAnalysisService.name);

    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService,
    ) { }

    /**
     * RF-076: Detección de Fraude y Moderación de Contenido
     * Modera reseña antes de publicación
     */
    async moderateReview(reviewText: string): Promise<{
        approved: boolean;
        confidence: number;
        issues: string[];
        reasoning: string;
    }> {
        try {
            this.logger.log(`Moderando reseña: ${reviewText.substring(0, 50)}...`);

            const result = await this.geminiService.moderateContent(reviewText);

            return {
                approved: result.isAppropriate,
                confidence: result.confidence,
                issues: result.categories,
                reasoning: result.reasoning,
            };
        } catch (error) {
            this.logger.error('Error al moderar reseña:', error);
            // En caso de error, aprobar manualmente para no bloquear usuarios
            return {
                approved: true,
                confidence: 0,
                issues: ['error_moderacion'],
                reasoning: 'Error en moderación automática, requiere revisión manual',
            };
        }
    }

    /**
     * RF-075: Análisis de Sentimiento y Extracción de Insights
     * Analiza sentimiento de una reseña
     */
    async analyzeSentiment(reviewText: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        confidence: number;
        keywords: string[];
    }> {
        try {
            const result = await this.geminiService.analyzeSentiment(reviewText);

            // Extraer palabras clave
            const keywords = await this.extractKeywords(reviewText);

            return {
                ...result,
                keywords,
            };
        } catch (error) {
            this.logger.error('Error al analizar sentimiento:', error);
            return {
                sentiment: 'neutral',
                score: 0,
                confidence: 0,
                keywords: [],
            };
        }
    }

    /**
     * RF-077: Resúmenes Inteligentes de Múltiples Reseñas
     * Genera resumen ejecutivo de todas las reseñas de un proveedor
     */
    async generateReviewsSummary(providerId: string): Promise<{
        summary: string;
        strengths: string[];
        weaknesses: string[];
        commonTopics: string[];
        overallSentiment: string;
    }> {
        try {
            this.logger.log(`Generando resumen de reseñas para proveedor ${providerId}`);

            // Obtener todas las reseñas del proveedor
            const reviews = await this.prisma.review.findMany({
                where: {
                    providerId,
                    // Solo reseñas publicadas
                },
                select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 50, // Últimas 50 reseñas
            });

            if (reviews.length === 0) {
                return {
                    summary: 'Este proveedor aún no tiene reseñas.',
                    strengths: [],
                    weaknesses: [],
                    commonTopics: [],
                    overallSentiment: 'neutral',
                };
            }

            // Construir prompt para Gemini
            const reviewsText = reviews
                .map((r, i) => `Reseña ${i + 1} (${r.rating}⭐): ${r.comment || 'Sin comentario'}`)
                .join('\n\n');

            const prompt = `Analiza las siguientes ${reviews.length} reseñas de un servicio de autolavado en Chile y genera un resumen ejecutivo.

${reviewsText}

Genera un JSON con esta estructura:
{
  "summary": "resumen ejecutivo de 150-200 palabras del consenso general",
  "strengths": ["top 3 fortalezas más mencionadas"],
  "weaknesses": ["top 2-3 debilidades más comunes"],
  "commonTopics": ["temas recurrentes en las reseñas"],
  "overallSentiment": "positive/negative/neutral"
}

Responde SOLO con el JSON.`;

            const result = await this.geminiService.extractStructuredData<{
                summary: string;
                strengths: string[];
                weaknesses: string[];
                commonTopics: string[];
                overallSentiment: string;
            }>(reviewsText, '', prompt);

            this.logger.log(`Resumen generado para ${providerId}`);

            return result;
        } catch (error) {
            this.logger.error('Error al generar resumen:', error);
            return {
                summary: 'No se pudo generar resumen en este momento.',
                strengths: [],
                weaknesses: [],
                commonTopics: [],
                overallSentiment: 'neutral',
            };
        }
    }

    /**
     * RF-074: Generación de Respuestas Sugeridas para Reseñas
     * Genera 3 opciones de respuesta profesional para una reseña
     */
    async generateResponseSuggestions(
        reviewText: string,
        rating: number,
        providerName: string,
    ): Promise<string[]> {
        try {
            const sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

            const prompt = `Eres el dueño de "${providerName}", un servicio de autolavado en Chile.

Un cliente dejó esta reseña con ${rating} estrellas:
"${reviewText}"

Genera 3 opciones de respuesta profesional, amigable y apropiada al tono de la reseña:
- Opción 1: Formal y profesional
- Opción 2: Amigable y cercana
- Opción 3: Breve y agradecida

${sentiment === 'negative' ? 'La reseña es negativa, así que incluye disculpa sincera y oferta de solución.' : ''}
${sentiment === 'positive' ? 'La reseña es positiva, así que agradece y motiva a volver.' : ''}

Cada respuesta debe tener 2-3 líneas máximo.

Responde con JSON:
{
  "options": ["opción 1", "opción 2", "opción 3"]
}`;

            const result = await this.geminiService.extractStructuredData<{
                options: string[];
            }>(reviewText, '', prompt);

            return result.options || [];
        } catch (error) {
            this.logger.error('Error al generar respuestas:', error);
            // Respuestas fallback
            if (rating >= 4) {
                return [
                    `¡Muchas gracias por tu comentario! Nos alegra que hayas quedado satisfecho con nuestro servicio. ¡Te esperamos pronto! 🚗✨`,
                    `Apreciamos mucho tu feedback positivo. Es un gusto atenderte y esperamos verte de nuevo.`,
                    `¡Gracias! Tu opinión es muy importante para nosotros. ¡Hasta pronto!`,
                ];
            } else {
                return [
                    `Lamentamos que tu experiencia no haya sido la esperada. Nos gustaría conversar contigo para mejorar. Por favor contáctanos.`,
                    `Gracias por tu feedback. Tomamos muy en serio tu comentario y trabajaremos para mejorar. Nos gustaría ofrecerte un servicio complementario.`,
                    `Disculpa las molestias. Tu satisfacción es importante para nosotros. ¿Podrías contactarnos para resolver esto?`,
                ];
            }
        }
    }

    /**
     * Extrae palabras clave de texto
     */
    private async extractKeywords(text: string): Promise<string[]> {
        try {
            const prompt = `Extrae las 5 palabras clave más importantes de este texto sobre servicios de autolavado:
"${text}"

Responde con JSON:
{
  "keywords": ["palabra1", "palabra2", ...]
}`;

            const result = await this.geminiService.extractStructuredData<{
                keywords: string[];
            }>(text, '', prompt);

            return result.keywords || [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Detecta patrones de reseñas falsas
     */
    async detectFakeReview(
        reviewText: string,
        userId: string,
        providerId: string,
    ): Promise<{
        isSuspicious: boolean;
        confidence: number;
        reasons: string[];
    }> {
        try {
            // Verificar reseñas previas del usuario
            const userReviewsCount = await this.prisma.review.count({
                where: { userId },
            });

            // Si es la primera reseña y es muy genérica, puede ser sospechosa
            if (userReviewsCount === 0 && reviewText.length < 20) {
                return {
                    isSuspicious: true,
                    confidence: 0.7,
                    reasons: ['Primera reseña muy corta', 'Texto genérico'],
                };
            }

            // Usar Gemini para análisis más profundo
            const prompt = `Analiza si esta reseña parece falsa o sospechosa:
"${reviewText}"

Factores a considerar:
- Texto muy genérico sin detalles específicos
- Lenguaje promocional excesivo
- Gramática y ortografía perfectas (bot)
- Menciones de competencia

Responde con JSON:
{
  "isSuspicious": true/false,
  "confidence": 0-1,
  "reasons": ["lista de razones"]
}`;

            const result = await this.geminiService.extractStructuredData<{
                isSuspicious: boolean;
                confidence: number;
                reasons: string[];
            }>(reviewText, '', prompt);

            return result;
        } catch (error) {
            this.logger.error('Error al detectar reseña falsa:', error);
            return {
                isSuspicious: false,
                confidence: 0,
                reasons: [],
            };
        }
    }
}
