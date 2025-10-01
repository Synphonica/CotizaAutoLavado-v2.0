import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IaService } from '../services/ia.service';
import {
  RecommendationQueryDto,
  RecommendationResponseDto,
  AnalysisQueryDto,
  AnalysisResponseDto,
  SmartSearchQueryDto,
  SmartSearchResponseDto
} from '../dto/recommendation.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class IaController {
  constructor(private readonly iaService: IaService) { }

  @Get('recommendations')
  @ApiOperation({ summary: 'Obtener recomendaciones personalizadas de servicios' })
  @ApiOkResponse({ description: 'Recomendaciones generadas por IA', type: RecommendationResponseDto as any })
  @ApiQuery({ name: 'userId', required: true, description: 'ID del usuario' })
  @ApiQuery({ name: 'latitude', required: false, description: 'Latitud del usuario' })
  @ApiQuery({ name: 'longitude', required: false, description: 'Longitud del usuario' })
  @ApiQuery({ name: 'preferredServiceType', required: false, description: 'Tipo de servicio preferido' })
  @ApiQuery({ name: 'maxBudget', required: false, description: 'Presupuesto máximo' })
  @ApiQuery({ name: 'radiusKm', required: false, description: 'Radio de búsqueda en km' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de recomendaciones' })
  async getRecommendations(@Query() query: RecommendationQueryDto): Promise<RecommendationResponseDto> {
    return this.iaService.getRecommendations(query);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analizar texto con IA (sentimiento, intención, extracción)' })
  @ApiOkResponse({ description: 'Resultado del análisis', type: AnalysisResponseDto as any })
  async analyzeText(@Body() query: AnalysisQueryDto): Promise<AnalysisResponseDto> {
    return this.iaService.analyzeText(query);
  }

  @Post('smart-search')
  @ApiOperation({ summary: 'Búsqueda inteligente interpretando consultas naturales' })
  @ApiOkResponse({ description: 'Resultados de búsqueda inteligente', type: SmartSearchResponseDto as any })
  async smartSearch(@Body() query: SmartSearchQueryDto): Promise<SmartSearchResponseDto> {
    return this.iaService.smartSearch(query);
  }
}
