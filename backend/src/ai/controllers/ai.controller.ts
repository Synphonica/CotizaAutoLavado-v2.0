import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { SearchAiService } from '../services/search-ai.service';
import { ChatbotService } from '../services/chatbot.service';
import { ReviewAnalysisService } from '../services/review-analysis.service';
import { ContentGenerationService } from '../services/content-generation.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
    constructor(
        private searchAiService: SearchAiService,
        private chatbotService: ChatbotService,
        private reviewAnalysisService: ReviewAnalysisService,
        private contentGenerationService: ContentGenerationService,
    ) { }

    /**
     * RF-071: Búsqueda Semántica en Lenguaje Natural
     */
    @Post('search/semantic')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Búsqueda semántica en lenguaje natural',
        description: 'Convierte una consulta en lenguaje natural a búsqueda estructurada',
    })
    @ApiResponse({ status: 200, description: 'Búsqueda parseada exitosamente' })
    async semanticSearch(@Body('query') query: string) {
        return this.searchAiService.parseNaturalLanguageQuery(query);
    }

    /**
     * Recomendaciones personalizadas con IA
     */
    @Get('recommendations')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener recomendaciones personalizadas',
        description: 'Genera recomendaciones basadas en historial del usuario o ubicación',
    })
    @ApiResponse({ status: 200, description: 'Recomendaciones generadas' })
    async getRecommendations(
        @CurrentUser() user: any,
        @Query('location') location?: string,
    ) {
        return this.searchAiService.getPersonalizedRecommendations(user.clerkId, location);
    }

    /**
     * Búsqueda avanzada con prompt libre
     */
    @Post('search/advanced')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Búsqueda avanzada con prompt libre',
        description: 'Busca autolavados según un prompt detallado del usuario',
    })
    @ApiResponse({ status: 200, description: 'Resultados encontrados' })
    async advancedSearch(
        @CurrentUser() user: any,
        @Body('prompt') prompt: string,
        @Body('location') location?: string,
    ) {
        return this.searchAiService.advancedSearch(prompt, user.clerkId, location);
    }

    /**
     * RF-083: Autocompletado Inteligente
     */
    @Get('search/suggestions')
    @ApiOperation({
        summary: 'Obtener sugerencias de búsqueda inteligente',
        description: 'Genera autocompletado con comprensión semántica',
    })
    @ApiResponse({ status: 200, description: 'Sugerencias generadas' })
    async getSearchSuggestions(
        @Query('q') query: string,
        @Query('location') location?: string,
    ) {
        const suggestions = await this.searchAiService.getSuggestions(query, location);
        return { suggestions };
    }

    /**
     * RF-072: Chatbot Conversacional
     */
    @Post('chat')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Enviar mensaje al chatbot',
        description: 'Interactuar con el asistente virtual conversacional',
    })
    @ApiResponse({ status: 200, description: 'Respuesta del chatbot' })
    async chat(
        @Body('sessionId') sessionId: string,
        @Body('message') message: string,
        @Body('userId') userId?: string,
    ) {
        return this.chatbotService.chat(sessionId, message, userId);
    }

    /**
     * Obtener historial de chat
     */
    @Get('chat/:sessionId/history')
    @ApiOperation({ summary: 'Obtener historial de chat' })
    async getChatHistory(@Param('sessionId') sessionId: string) {
        const messages = this.chatbotService.getChatHistory(sessionId);
        return { messages };
    }

    /**
     * Limpiar sesión de chat
     */
    @Post('chat/:sessionId/clear')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Limpiar sesión de chat' })
    async clearChatSession(@Param('sessionId') sessionId: string) {
        this.chatbotService.clearSession(sessionId);
    }

    /**
     * RF-076: Moderación de Reseñas
     */
    @Post('reviews/moderate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Moderar contenido de reseña',
        description: 'Detecta contenido inapropiado, spam o fraude',
    })
    @ApiResponse({ status: 200, description: 'Reseña moderada' })
    async moderateReview(@Body('text') text: string) {
        return this.reviewAnalysisService.moderateReview(text);
    }

    /**
     * RF-075: Análisis de Sentimiento
     */
    @Post('reviews/sentiment')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Analizar sentimiento de reseña',
        description: 'Extrae sentimiento y palabras clave',
    })
    @ApiResponse({ status: 200, description: 'Sentimiento analizado' })
    async analyzeSentiment(@Body('text') text: string) {
        return this.reviewAnalysisService.analyzeSentiment(text);
    }

    /**
     * RF-077: Resumen de Reseñas
     */
    @Get('reviews/summary/:providerId')
    @ApiOperation({
        summary: 'Generar resumen de reseñas de proveedor',
        description: 'Resumen ejecutivo con fortalezas y debilidades',
    })
    @ApiResponse({ status: 200, description: 'Resumen generado' })
    async getReviewsSummary(@Param('providerId') providerId: string) {
        return this.reviewAnalysisService.generateReviewsSummary(providerId);
    }

    /**
     * RF-074: Sugerencias de Respuestas para Reseñas
     */
    @Post('reviews/response-suggestions')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generar respuestas sugeridas para reseña',
        description: 'Genera 3 opciones de respuesta profesional',
    })
    @ApiResponse({ status: 200, description: 'Respuestas generadas' })
    async generateResponseSuggestions(
        @Body('reviewText') reviewText: string,
        @Body('rating') rating: number,
        @Body('providerName') providerName: string,
    ) {
        const suggestions = await this.reviewAnalysisService.generateResponseSuggestions(
            reviewText,
            rating,
            providerName,
        );
        return { suggestions };
    }

    /**
     * RF-073: Generación de Descripciones de Servicios
     */
    @Post('content/service-description')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generar descripción de servicio',
        description: 'Genera descripción profesional y atractiva',
    })
    @ApiResponse({ status: 200, description: 'Descripción generada' })
    async generateServiceDescription(
        @Body('serviceName') serviceName: string,
        @Body('keywords') keywords: string[],
        @Body('style') style?: 'technical' | 'promotional' | 'educational',
    ) {
        const description = await this.contentGenerationService.generateServiceDescription(
            serviceName,
            keywords,
            style,
        );
        return { description };
    }

    /**
     * RF-079: Generación de Metadata SEO
     */
    @Post('content/seo-metadata')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generar metadata SEO optimizada',
        description: 'Genera meta tags y structured data',
    })
    @ApiResponse({ status: 200, description: 'Metadata generada' })
    async generateSEOMetadata(
        @Body('providerName') providerName: string,
        @Body('location') location: string,
        @Body('services') services: string[],
    ) {
        return this.contentGenerationService.generateSEOMetadata(
            providerName,
            location,
            services,
        );
    }

    /**
     * RF-085: Generación de FAQ
     */
    @Post('content/faq')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generar FAQ dinámicas',
        description: 'Genera preguntas frecuentes basadas en consultas comunes',
    })
    @ApiResponse({ status: 200, description: 'FAQ generadas' })
    async generateFAQ(
        @Body('commonQueries') commonQueries: string[],
        @Body('providerContext') providerContext?: any,
    ) {
        const faqs = await this.contentGenerationService.generateFAQ(
            commonQueries,
            providerContext,
        );
        return { faqs };
    }

    /**
     * RF-080: Traducción Contextual
     */
    @Post('content/translate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Traducir contenido',
        description: 'Traduce manteniendo contexto cultural chileno',
    })
    @ApiResponse({ status: 200, description: 'Contenido traducido' })
    async translateContent(
        @Body('text') text: string,
        @Body('targetLanguage') targetLanguage: 'en' | 'es',
    ) {
        const translated = await this.contentGenerationService.translateContent(
            text,
            targetLanguage,
        );
        return { translated };
    }

    /**
     * Explicar coincidencia de búsqueda
     */
    @Post('search/explain-match')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Explicar por qué un resultado coincide con búsqueda',
    })
    async explainMatch(
        @Body('query') query: string,
        @Body('providerName') providerName: string,
        @Body('providerData') providerData: any,
    ) {
        const explanation = await this.searchAiService.explainMatch(
            query,
            providerName,
            providerData,
        );
        return { explanation };
    }
}
