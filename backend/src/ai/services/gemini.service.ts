import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    GoogleGenerativeAI,
    GenerativeModel,
    HarmCategory,
    HarmBlockThreshold
} from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private readonly logger = new Logger(GeminiService.name);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GOOGLE_GEMINI_API_KEY');

        if (!apiKey) {
            this.logger.error('GOOGLE_GEMINI_API_KEY no configurada');
            throw new Error('Gemini API key no configurada');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });

        this.logger.log('Gemini AI Service inicializado con modelo gemini-1.5-pro');
    }

    /**
     * Genera texto con Gemini
     */
    async generateText(prompt: string, systemInstruction?: string): Promise<string> {
        try {
            const fullPrompt = systemInstruction
                ? `${systemInstruction}\n\n${prompt}`
                : prompt;

            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();

            this.logger.log(`Respuesta generada: ${text.substring(0, 100)}...`);
            return text;
        } catch (error) {
            this.logger.error('Error al generar texto con Gemini:', error);
            this.logger.error('Error details:', error.message || error);

            // Si el error es por API key inválida, dar mensaje más claro
            if (error.message?.includes('API key') || error.message?.includes('403') || error.message?.includes('401')) {
                throw new Error('API key de Gemini inválida. Verifica GOOGLE_GEMINI_API_KEY en .env');
            }

            throw new Error(`Error al comunicarse con Gemini API: ${error.message || 'Error desconocido'}`);
        }
    }

    /**
     * Genera texto con streaming (para chatbot)
     */
    async generateTextStream(prompt: string, systemInstruction?: string) {
        try {
            const fullPrompt = systemInstruction
                ? `${systemInstruction}\n\n${prompt}`
                : prompt;

            const result = await this.model.generateContentStream(fullPrompt);
            return result.stream;
        } catch (error) {
            this.logger.error('Error al generar stream con Gemini:', error);
            throw new Error('Error al comunicarse con Gemini API');
        }
    }

    /**
     * Inicia una conversación (chat) con historial
     */
    async startChat(history: Array<{ role: string; parts: string }> = []) {
        try {
            const chat = this.model.startChat({
                history: history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.parts }],
                })),
            });

            return chat;
        } catch (error) {
            this.logger.error('Error al iniciar chat con Gemini:', error);
            throw new Error('Error al iniciar conversación con Gemini API');
        }
    }

    /**
     * Analiza sentimiento de texto
     */
    async analyzeSentiment(text: string): Promise<{
        sentiment: 'positive' | 'negative' | 'neutral';
        score: number;
        confidence: number;
        reasoning: string;
    }> {
        try {
            const prompt = `Analiza el sentimiento del siguiente texto en español de Chile y retorna un JSON con la estructura exacta:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": número entre -1 (muy negativo) y 1 (muy positivo),
  "confidence": número entre 0 y 1 indicando confianza del análisis,
  "reasoning": "breve explicación del análisis"
}

Texto a analizar:
"${text}"

Responde SOLO con el JSON, sin texto adicional.`;

            const result = await this.generateText(prompt);

            // Extraer JSON de la respuesta
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo parsear respuesta de Gemini');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            this.logger.error('Error al analizar sentimiento:', error);
            throw new Error('Error al analizar sentimiento con Gemini API');
        }
    }

    /**
     * Extrae información estructurada de texto
     */
    async extractStructuredData<T>(
        text: string,
        schema: string,
        instructions?: string
    ): Promise<T> {
        try {
            const prompt = `Extrae información del siguiente texto según el esquema JSON proporcionado.
${instructions ? `\nInstrucciones adicionales: ${instructions}` : ''}

Esquema esperado:
${schema}

Texto:
"${text}"

IMPORTANTE: Responde SOLO con JSON válido, sin texto adicional, sin markdown, sin código.`;

            this.logger.log('Enviando prompt a Gemini...');
            const result = await this.generateText(prompt);
            this.logger.log(`Respuesta de Gemini (${result.length} caracteres)`);

            // Limpiar la respuesta de posibles markdown blocks
            let cleanResult = result.trim();

            // Remover bloques de código markdown si existen
            if (cleanResult.includes('```')) {
                cleanResult = cleanResult.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();
            }

            // Extraer JSON de la respuesta (buscar el primer { hasta el último })
            const firstBrace = cleanResult.indexOf('{');
            const lastBrace = cleanResult.lastIndexOf('}');

            if (firstBrace === -1 || lastBrace === -1) {
                this.logger.error('No se encontró JSON válido en la respuesta');
                this.logger.error('Respuesta completa:', cleanResult.substring(0, 500));
                throw new Error('No se pudo parsear respuesta de Gemini');
            }

            const jsonStr = cleanResult.substring(firstBrace, lastBrace + 1);
            this.logger.log('JSON extraído, intentando parsear...');

            const parsed = JSON.parse(jsonStr);
            this.logger.log('JSON parseado exitosamente');

            return parsed as T;
        } catch (error) {
            this.logger.error('Error al extraer datos estructurados:', error);
            this.logger.error('Error message:', error?.message);

            if (error instanceof SyntaxError) {
                this.logger.error('Error de sintaxis JSON:', error.message);
                throw new Error('Error al procesar respuesta de Gemini: formato JSON inválido');
            }

            // Si es un error de API key, dar mensaje más claro
            if (error?.message?.includes('API key') || error?.message?.includes('invalid')) {
                throw new Error('API key de Gemini inválida o no configurada. Ver CONFIGURAR_GEMINI.md');
            }

            throw error;
        }
    }

    /**
     * Modera contenido (detecta spam, ofensivo, etc)
     */
    async moderateContent(text: string): Promise<{
        isAppropriate: boolean;
        confidence: number;
        categories: string[];
        reasoning: string;
    }> {
        try {
            const prompt = `Analiza el siguiente texto y determina si es apropiado para publicación en una plataforma de reseñas de servicios de autolavado en Chile.

Detecta:
- Contenido ofensivo (groserías, insultos)
- Spam o publicidad
- Contenido inapropiado
- Reseñas falsas o sospechosas

Texto a moderar:
"${text}"

Responde con un JSON con esta estructura exacta:
{
  "isAppropriate": true/false,
  "confidence": número entre 0 y 1,
  "categories": ["lista de categorías detectadas si no es apropiado"],
  "reasoning": "breve explicación"
}

Responde SOLO con el JSON, sin texto adicional.`;

            const result = await this.generateText(prompt);

            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo parsear respuesta de Gemini');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            this.logger.error('Error al moderar contenido:', error);
            throw new Error('Error al moderar contenido con Gemini API');
        }
    }
}
