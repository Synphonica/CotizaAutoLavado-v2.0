import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Injectable()
export class ContentGenerationService {
    private readonly logger = new Logger(ContentGenerationService.name);

    constructor(private geminiService: GeminiService) { }

    /**
     * RF-073: Generación Automática de Descripciones de Servicios
     * Genera descripción profesional para un servicio
     */
    async generateServiceDescription(
        serviceName: string,
        keywords: string[],
        style: 'technical' | 'promotional' | 'educational' = 'promotional',
    ): Promise<string> {
        try {
            this.logger.log(`Generando descripción para: ${serviceName}`);

            const styleInstructions = {
                technical: 'Usa lenguaje técnico y detallado, enfócate en el proceso y productos utilizados.',
                promotional: 'Usa lenguaje atractivo y persuasivo, destaca beneficios y resultados.',
                educational: 'Usa lenguaje informativo y educativo, explica qué incluye y por qué es importante.',
            };

            const prompt = `Genera una descripción profesional y atractiva para este servicio de autolavado:

Nombre del servicio: ${serviceName}
Palabras clave: ${keywords.join(', ')}
Estilo: ${styleInstructions[style]}

La descripción debe:
- Tener 100-200 palabras
- Estar en español chileno profesional
- Incluir beneficios del servicio
- Mencionar proceso general
- Indicar tiempo estimado si es relevante
- Ser convincente pero honesta
- Usar emojis ocasionalmente (máximo 2)

NO incluyas precio ni promociones específicas.

Responde solo con la descripción, sin títulos ni formato adicional.`;

            const description = await this.geminiService.generateText(prompt);

            return description.trim();
        } catch (error) {
            this.logger.error('Error al generar descripción:', error);
            return `${serviceName}: Servicio profesional de autolavado. Contáctanos para más información.`;
        }
    }

    /**
     * RF-079: Generación de Contenido SEO-Optimizado
     * Genera meta tags optimizados para SEO
     */
    async generateSEOMetadata(
        providerName: string,
        location: string,
        services: string[],
    ): Promise<{
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        structuredData: any;
    }> {
        try {
            const prompt = `Genera metadata SEO optimizada para un servicio de autolavado en Chile:

Nombre: ${providerName}
Ubicación: ${location}
Servicios principales: ${services.join(', ')}

Genera JSON con:
{
  "metaTitle": "título SEO de 50-60 caracteres con palabras clave locales",
  "metaDescription": "descripción de 150-160 caracteres atractiva",
  "keywords": ["lista de 8-10 keywords relevantes incluyendo variaciones locales"],
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "${providerName}",
    "description": "descripción breve",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${location}",
      "addressCountry": "CL"
    },
    "priceRange": "$$"
  }
}

Optimiza para búsquedas locales chilenas como "lavado de autos en [comuna]", "autolavado [barrio]", etc.

Responde SOLO con el JSON.`;

            const result = await this.geminiService.extractStructuredData<{
                metaTitle: string;
                metaDescription: string;
                keywords: string[];
                structuredData: any;
            }>('', '', prompt);

            return result;
        } catch (error) {
            this.logger.error('Error al generar SEO metadata:', error);
            return {
                metaTitle: `${providerName} - Autolavado en ${location}`,
                metaDescription: `Servicio de autolavado ${providerName} en ${location}. ${services.slice(0, 3).join(', ')} y más.`,
                keywords: [providerName, location, 'autolavado', 'lavado de autos', ...services],
                structuredData: {},
            };
        }
    }

    /**
     * RF-085: Generación Automática de FAQ Dinámicas
     * Genera preguntas frecuentes basadas en consultas comunes
     */
    async generateFAQ(
        commonQueries: string[],
        providerContext?: any,
    ): Promise<Array<{ question: string; answer: string; category: string }>> {
        try {
            const prompt = `Basándote en estas consultas frecuentes de usuarios sobre servicios de autolavado, genera las 8-10 preguntas más importantes con sus respuestas:

Consultas comunes:
${commonQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

${providerContext ? `Contexto del proveedor:
Servicios: ${providerContext.services?.join(', ')}
Ubicación: ${providerContext.location}
Precio promedio: ${providerContext.avgPrice}
` : ''}

Categorías posibles: Servicios, Precios, Agendamiento, Ubicación, Métodos de Pago, Calidad

Genera JSON:
{
  "faqs": [
    {
      "question": "pregunta clara y concisa",
      "answer": "respuesta de 50-100 palabras",
      "category": "categoría"
    }
  ]
}

Las respuestas deben ser útiles, precisas y en español chileno coloquial pero profesional.

Responde SOLO con el JSON.`;

            const result = await this.geminiService.extractStructuredData<{
                faqs: Array<{ question: string; answer: string; category: string }>;
            }>('', '', prompt);

            return result.faqs || [];
        } catch (error) {
            this.logger.error('Error al generar FAQ:', error);
            return [];
        }
    }

    /**
     * Genera título atractivo para promoción
     */
    async generatePromotionTitle(
        discount: number,
        serviceType: string,
    ): Promise<string> {
        try {
            const prompt = `Genera un título atractivo y breve (máximo 8 palabras) para una promoción de autolavado:

Descuento: ${discount}%
Servicio: ${serviceType}

El título debe:
- Ser llamativo y generar urgencia
- Incluir el descuento
- Ser claro y directo
- Usar lenguaje chileno
- Incluir un emoji relevante

Ejemplos: "¡${discount}% OFF en ${serviceType}! 🚗✨", "${serviceType} con ${discount}% descuento 🎉"

Responde solo con el título, sin explicaciones.`;

            const title = await this.geminiService.generateText(prompt);
            return title.trim();
        } catch (error) {
            return `¡${discount}% OFF en ${serviceType}! 🚗`;
        }
    }

    /**
     * RF-080: Traducción Automática Contextual
     * Traduce contenido manteniendo contexto cultural chileno
     */
    async translateContent(
        text: string,
        targetLanguage: 'en' | 'es',
    ): Promise<string> {
        try {
            if (targetLanguage === 'es') {
                const prompt = `Traduce este texto al español chileno manteniendo el contexto cultural:

"${text}"

Mantén:
- Nombres de comunas y lugares en Chile
- Modismos y expresiones locales cuando sea apropiado
- Tono original (formal/informal)
- Formato de precios en CLP

Responde solo con la traducción.`;

                return await this.geminiService.generateText(prompt);
            } else {
                const prompt = `Translate this Chilean Spanish text to English, preserving cultural context:

"${text}"

Keep:
- Chilean place names (communes, neighborhoods)
- Convert CLP prices to USD approximately
- Maintain original tone

Respond only with the translation.`;

                return await this.geminiService.generateText(prompt);
            }
        } catch (error) {
            this.logger.error('Error al traducir:', error);
            return text; // Fallback: retornar texto original
        }
    }
}
