import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './services/gemini.service';
import { AiController } from './controllers/ai.controller';
import { SearchAiService } from './services/search-ai.service';
import { ChatbotService } from './services/chatbot.service';
import { ReviewAnalysisService } from './services/review-analysis.service';
import { ContentGenerationService } from './services/content-generation.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiController],
  providers: [
    PrismaService,
    GeminiService,
    SearchAiService,
    ChatbotService,
    ReviewAnalysisService,
    ContentGenerationService,
  ],
  exports: [
    GeminiService,
    SearchAiService,
    ChatbotService,
    ReviewAnalysisService,
    ContentGenerationService,
  ],
})
export class AiModule { }
