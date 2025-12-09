import { Controller, Get, Post, Body, UseGuards, Req, Logger, Param } from '@nestjs/common';
import { AiInsightsService } from './ai-insights.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('ai-insights')
@UseGuards(ClerkAuthGuard)
export class AiInsightsController {
    private readonly logger = new Logger(AiInsightsController.name);

    constructor(private readonly aiInsightsService: AiInsightsService) {
        this.logger.log('AiInsightsController inicializado');
    }

    @Get('price-trends')
    async getPriceTrends(@Req() req: any) {
        this.logger.log(`GET /price-trends - Usuario: ${req.user?.userId}`);
        const userId = req.user?.userId;
        return this.aiInsightsService.getPriceTrends(userId);
    }

    @Get('provider-recommendations')
    async getProviderRecommendations(@Req() req: any) {
        this.logger.log(`GET /provider-recommendations - Usuario: ${req.user?.userId}`);
        const userId = req.user?.userId;
        return this.aiInsightsService.getProviderRecommendations(userId);
    }

    @Get('best-booking-day')
    async getBestBookingDay(@Req() req: any) {
        this.logger.log(`GET /best-booking-day - Usuario: ${req.user?.userId}`);
        const userId = req.user?.userId;
        return this.aiInsightsService.getBestBookingDay(userId);
    }

    @Get('savings-potential')
    async getSavingsPotential(@Req() req: any) {
        this.logger.log(`GET /savings-potential - Usuario: ${req.user?.userId}`);
        const userId = req.user?.userId;
        return this.aiInsightsService.getSavingsPotential(userId);
    }

    @Post('chat')
    async chatWithAssistant(@Req() req: any, @Body() body: { message: string }) {
        this.logger.log(`POST /chat - Usuario: ${req.user?.userId}, Mensaje: "${body.message}"`);
        const userId = req.user?.userId;
        const result = await this.aiInsightsService.chatWithAssistant(userId, body.message);
        this.logger.log(`POST /chat - Respuesta enviada, disponible: ${result.available}`);
        return result;
    }

    @Post('smart-search')
    async smartSearch(@Req() req: any, @Body() body: { query: string }) {
        this.logger.log(`POST /smart-search - Usuario: ${req.user?.userId}, Query: "${body.query}"`);
        const userId = req.user?.userId;
        return this.aiInsightsService.smartSearch(userId, body.query);
    }

    @Get('provider-analysis/:providerId')
    async getProviderAnalysis(@Req() req: any, @Param('providerId') providerId: string) {
        this.logger.log(`GET /provider-analysis/${providerId} - Usuario: ${req.user?.userId}`);
        const userId = req.user?.userId;
        return this.aiInsightsService.analyzeProvider(providerId, userId);
    }
}
