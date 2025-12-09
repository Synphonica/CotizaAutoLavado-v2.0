import { Module } from '@nestjs/common';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsightsService } from './ai-insights.service';
import { GeminiService } from './gemini.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [AiInsightsController],
    providers: [AiInsightsService, GeminiService, PrismaService],
    exports: [AiInsightsService],
})
export class AiInsightsModule { }
