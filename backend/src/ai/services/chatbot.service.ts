import { Injectable, Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    messages: ChatMessage[];
    userId?: string;
    context?: any;
}

@Injectable()
export class ChatbotService {
    private readonly logger = new Logger(ChatbotService.name);
    private sessions = new Map<string, ChatSession>();

    constructor(
        private geminiService: GeminiService,
        private prisma: PrismaService,
    ) { }

    /**
     * RF-072: Asistente Virtual Conversacional (Chatbot)
     * Maneja conversaciones con contexto y datos reales del sistema
     */
    async chat(
        sessionId: string,
        userMessage: string,
        userId?: string,
    ): Promise<{
        response: string;
        suggestions?: string[];
        actions?: any[];
    }> {
        try {
            this.logger.log(`Chat [${sessionId}]: ${userMessage}`);

            // Obtener o crear sesión
            let session = this.sessions.get(sessionId);
            if (!session) {
                session = {
                    id: sessionId,
                    messages: [],
                    userId,
                    context: await this.buildUserContext(userId),
                };
                this.sessions.set(sessionId, session);
            }

            // Agregar mensaje del usuario
            session.messages.push({
                role: 'user',
                content: userMessage,
                timestamp: new Date(),
            });

            // Construir prompt con contexto
            const systemInstruction = this.buildSystemInstruction(session);
            const conversationHistory = this.formatConversationHistory(session.messages);

            // Generar respuesta
            const prompt = `${conversationHistory}

Usuario: ${userMessage}

Asistente:`;

            const response = await this.geminiService.generateText(
                prompt,
                systemInstruction,
            );

            // Agregar respuesta del asistente
            session.messages.push({
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            });

            // Detectar intenciones y generar acciones sugeridas
            const actions = await this.detectIntentions(userMessage, response);

            return {
                response: response.trim(),
                suggestions: this.generateSuggestions(session),
                actions,
            };
        } catch (error) {
            this.logger.error('Error en chat:', error);
            return {
                response: 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías reformularlo?',
            };
        }
    }

    /**
     * Construye el system instruction con información del sistema
     */
    private buildSystemInstruction(session: ChatSession): string {
        return `Eres un asistente virtual amigable y profesional para "CotizaAutoLavado", una plataforma chilena que conecta usuarios con servicios de autolavado.

Tu misión es:
- Ayudar a usuarios a encontrar el mejor servicio de autolavado según sus necesidades
- Responder preguntas sobre servicios, precios, ubicaciones y disponibilidad
- Guiar en el proceso de agendamiento
- Ser conversacional y usar lenguaje natural chileno (pero profesional)

Información del sistema:
- Tenemos ${session.context?.totalProviders || 'varios'} proveedores registrados en la Región Metropolitana
- Servicios disponibles: Lavado básico, completo, express, encerado, pulido, lavado de motor, interior, detailing
- Precios promedio: $5.000 - $30.000 dependiendo del servicio
- Los usuarios pueden agendar directamente desde la plataforma

${session.context?.userInfo ? `Información del usuario:
- Nombre: ${session.context.userInfo.firstName}
- Ubicación preferida: ${session.context.userInfo.preferredLocation || 'No definida'}
- Búsquedas recientes: ${session.context.recentSearches?.join(', ') || 'Ninguna'}
` : ''}

Reglas:
- Responde en español chileno coloquial pero profesional
- Sé breve y directo (máximo 3-4 líneas)
- Si no sabes algo, sé honesto
- Ofrece ayuda proactivamente
- Si el usuario quiere agendar, pide los datos necesarios paso a paso
- Usa emojis ocasionalmente para ser más amigable 🚗✨`;
    }

    /**
     * Construye contexto del usuario
     */
    private async buildUserContext(userId?: string): Promise<any> {
        if (!userId) return {};

        try {
            // Obtener info del usuario
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            });

            // Obtener búsquedas recientes
            // TODO: Implementar cuando exista tabla de búsquedas

            // Obtener proveedores favoritos
            const favorites = await this.prisma.favorite.findMany({
                where: { userId },
                include: {
                    provider: {
                        select: { businessName: true },
                    },
                },
                take: 5,
            });

            // Estadísticas generales
            const totalProviders = await this.prisma.provider.count({
                where: { status: 'ACTIVE' },
            });

            return {
                userInfo: user,
                favorites: favorites.map(f => f.provider.businessName),
                totalProviders,
            };
        } catch (error) {
            this.logger.error('Error al construir contexto:', error);
            return {};
        }
    }

    /**
     * Formatea historial de conversación
     */
    private formatConversationHistory(messages: ChatMessage[]): string {
        // Solo los últimos 6 mensajes para no exceder límites
        const recentMessages = messages.slice(-6);

        return recentMessages
            .map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
            .join('\n\n');
    }

    /**
     * Detecta intenciones del usuario y genera acciones sugeridas
     */
    private async detectIntentions(
        userMessage: string,
        botResponse: string,
    ): Promise<any[]> {
        const actions: any[] = [];
        const lowerMessage = userMessage.toLowerCase();

        // Detección simple de intenciones
        if (
            lowerMessage.includes('buscar') ||
            lowerMessage.includes('encontrar') ||
            lowerMessage.includes('necesito')
        ) {
            actions.push({
                type: 'search',
                label: 'Ver resultados de búsqueda',
                icon: 'search',
            });
        }

        if (
            lowerMessage.includes('agendar') ||
            lowerMessage.includes('reservar') ||
            lowerMessage.includes('hora')
        ) {
            actions.push({
                type: 'booking',
                label: 'Agendar servicio',
                icon: 'calendar',
            });
        }

        if (lowerMessage.includes('precio') || lowerMessage.includes('cuánto')) {
            actions.push({
                type: 'compare',
                label: 'Comparar precios',
                icon: 'compare',
            });
        }

        return actions;
    }

    /**
     * Genera sugerencias de respuestas rápidas
     */
    private generateSuggestions(session: ChatSession): string[] {
        const lastUserMessage = session.messages
            .filter(m => m.role === 'user')
            .slice(-1)[0]?.content.toLowerCase();

        if (!lastUserMessage) {
            return [
                '¿Qué servicios ofrecen?',
                'Buscar cerca de mí',
                'Ver precios',
            ];
        }

        // Sugerencias contextuales básicas
        if (lastUserMessage.includes('servicio')) {
            return [
                '¿Cuánto cuesta?',
                'Ver proveedores',
                '¿Dónde están ubicados?',
            ];
        }

        if (lastUserMessage.includes('precio')) {
            return [
                'Ver mejores ofertas',
                'Comparar precios',
                'Agendar ahora',
            ];
        }

        return [
            'Ver más opciones',
            'Necesito ayuda',
            'Mostrar proveedores cercanos',
        ];
    }

    /**
     * Limpia sesiones antiguas (llamar periódicamente)
     */
    cleanupOldSessions(): void {
        const now = new Date();
        const maxAge = 60 * 60 * 1000; // 1 hora

        this.sessions.forEach((session, sessionId) => {
            const lastMessage = session.messages.slice(-1)[0];
            if (
                lastMessage &&
                now.getTime() - lastMessage.timestamp.getTime() > maxAge
            ) {
                this.sessions.delete(sessionId);
                this.logger.log(`Sesión ${sessionId} eliminada por inactividad`);
            }
        });
    }

    /**
     * Obtiene historial de chat
     */
    getChatHistory(sessionId: string): ChatMessage[] {
        const session = this.sessions.get(sessionId);
        return session?.messages || [];
    }

    /**
     * Limpia sesión de chat
     */
    clearSession(sessionId: string): void {
        this.sessions.delete(sessionId);
        this.logger.log(`Sesión ${sessionId} limpiada`);
    }
}
