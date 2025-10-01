import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  RecommendationQueryDto,
  RecommendationResponseDto,
  AnalysisQueryDto,
  AnalysisResponseDto,
  SmartSearchQueryDto,
  SmartSearchResponseDto
} from '../dto/recommendation.dto';
import { ServiceType } from '@prisma/client';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly openaiApiKey = process.env.OPENAI_API_KEY;
  private readonly openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  private readonly openaiMaxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '500');
  private readonly openaiTemperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');

  constructor(private readonly prisma: PrismaService) { }

  async getRecommendations(query: RecommendationQueryDto): Promise<RecommendationResponseDto> {
    try {
      // Obtener historial del usuario
      const userHistory = await this.getUserHistory(query.userId);

      // Generar prompt para OpenAI
      const prompt = this.buildRecommendationPrompt(query, userHistory);

      // Llamar a OpenAI
      const aiResponse = await this.callOpenAI(prompt);

      // Procesar respuesta y obtener servicios
      const recommendations = await this.processRecommendations(aiResponse, query);

      return {
        recommendations,
        context: {
          userPreferences: this.extractUserPreferences(userHistory),
          locationBased: !!(query.latitude && query.longitude),
          budgetConsidered: !!query.maxBudget,
          personalizedFor: `Usuario ${query.userId}`
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error generating recommendations:', error);
      throw new Error('Error generando recomendaciones');
    }
  }

  async analyzeText(query: AnalysisQueryDto): Promise<AnalysisResponseDto> {
    try {
      const prompt = this.buildAnalysisPrompt(query);
      const aiResponse = await this.callOpenAI(prompt);

      return this.parseAnalysisResponse(aiResponse, query.analysisType || 'intent');
    } catch (error) {
      this.logger.error('Error analyzing text:', error);
      throw new Error('Error analizando texto');
    }
  }

  async smartSearch(query: SmartSearchQueryDto): Promise<SmartSearchResponseDto> {
    try {
      const prompt = this.buildSmartSearchPrompt(query);
      const aiResponse = await this.callOpenAI(prompt);

      const interpretedQuery = this.extractInterpretedQuery(aiResponse);
      const appliedFilters = this.extractAppliedFilters(aiResponse);

      // Buscar servicios con los filtros interpretados
      const results = await this.searchServicesWithFilters(appliedFilters, query);

      return {
        interpretedQuery,
        appliedFilters,
        results,
        searchSuggestions: this.generateSearchSuggestions(interpretedQuery)
      };
    } catch (error) {
      this.logger.error('Error in smart search:', error);
      throw new Error('Error en búsqueda inteligente');
    }
  }

  private async getUserHistory(userId: string) {
    // Obtener historial de búsquedas, favoritos y reviews del usuario
    const [searchHistory, favorites, reviews] = await Promise.all([
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      this.prisma.favorite.findMany({
        where: { userId },
        include: { provider: true }
      }),
      this.prisma.review.findMany({
        where: { userId },
        include: { service: true, provider: true }
      })
    ]);

    return { searchHistory, favorites, reviews };
  }

  private buildRecommendationPrompt(query: RecommendationQueryDto, userHistory: any): string {
    const location = query.latitude && query.longitude
      ? `Ubicación: ${query.latitude}, ${query.longitude}`
      : 'Sin ubicación específica';

    const budget = query.maxBudget ? `Presupuesto máximo: $${query.maxBudget}` : 'Sin límite de presupuesto';

    return `
Eres un asistente de IA especializado en recomendaciones de servicios de lavado automotriz.

Usuario: ${query.userId}
${location}
${budget}
Tipo de servicio preferido: ${query.preferredServiceType || 'Cualquiera'}
Radio de búsqueda: ${query.radiusKm || 10} km

Historial del usuario:
- Búsquedas recientes: ${userHistory.searchHistory.map(s => s.query).join(', ')}
- Proveedores favoritos: ${userHistory.favorites.map(f => f.provider.businessName).join(', ')}
- Reseñas: ${userHistory.reviews.map(r => `${r.service.name}: ${r.rating} estrellas`).join(', ')}

Genera ${query.limit || 5} recomendaciones personalizadas de servicios de lavado automotriz.
Responde en formato JSON con:
{
  "recommendations": [
    {
      "serviceName": "nombre del servicio",
      "serviceType": "tipo de servicio",
      "price": precio,
      "discountedPrice": precio_descuento_si_aplica,
      "providerName": "nombre del proveedor",
      "rating": calificación_1_5,
      "distanceKm": distancia_en_km,
      "recommendationScore": puntaje_0_1,
      "reasons": ["razón1", "razón2"],
      "discountPercent": porcentaje_descuento_si_aplica
    }
  ]
}
`;
  }

  private buildAnalysisPrompt(query: AnalysisQueryDto): string {
    const analysisInstructions = {
      sentiment: 'Analiza el sentimiento del texto (positive, negative, neutral)',
      intent: 'Identifica la intención del usuario (buscar, comparar, reservar, etc.)',
      extract_services: 'Extrae tipos de servicios mencionados (lavado, detailing, encerado, etc.)',
      extract_preferences: 'Extrae preferencias del usuario (precio, ubicación, calidad, etc.)'
    };

    return `
Analiza el siguiente texto: "${query.text}"

${analysisInstructions[query.analysisType || 'intent']}

Responde en formato JSON:
{
  "result": {
    "${query.analysisType || 'intent'}": "resultado_del_análisis",
    "confidence": 0.85
  },
  "suggestions": ["sugerencia1", "sugerencia2"]
}
`;
  }

  private buildSmartSearchPrompt(query: SmartSearchQueryDto): string {
    return `
Interpreta esta consulta de búsqueda: "${query.query}"

${query.latitude && query.longitude ? `Ubicación del usuario: ${query.latitude}, ${query.longitude}` : ''}

Extrae:
1. Consulta interpretada clara
2. Tipos de servicios mencionados
3. Rango de precios implícito
4. Palabras clave importantes
5. Preferencias de ubicación

Responde en formato JSON:
{
  "interpretedQuery": "consulta_interpretada",
  "serviceTypes": ["tipo1", "tipo2"],
  "priceRange": {"min": 5000, "max": 30000},
  "keywords": ["palabra1", "palabra2"],
  "location": {"lat": ${query.latitude || 'null'}, "lng": ${query.longitude || 'null'}, "radius": 10}
}
`;
  }

  private async callOpenAI(prompt: string): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.openaiMaxTokens,
        temperature: this.openaiTemperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  private async processRecommendations(aiResponse: any, query: RecommendationQueryDto) {
    // Aquí implementarías la lógica para buscar servicios reales en la BD
    // basándose en las recomendaciones de IA
    return aiResponse.recommendations || [];
  }

  private parseAnalysisResponse(aiResponse: any, analysisType: string): AnalysisResponseDto {
    return {
      result: {
        [analysisType as keyof any]: aiResponse.result?.[analysisType],
        confidence: aiResponse.result?.confidence || 0.5
      },
      suggestions: aiResponse.suggestions || []
    };
  }

  private extractInterpretedQuery(aiResponse: any): string {
    return aiResponse.interpretedQuery || '';
  }

  private extractAppliedFilters(aiResponse: any): any {
    return {
      serviceTypes: aiResponse.serviceTypes || [],
      priceRange: aiResponse.priceRange || null,
      location: aiResponse.location || null,
      keywords: aiResponse.keywords || []
    };
  }

  private async searchServicesWithFilters(filters: any, query: SmartSearchQueryDto) {
    // Implementar búsqueda real en la BD con los filtros
    return [];
  }

  private generateSearchSuggestions(interpretedQuery: string): string[] {
    return [
      `${interpretedQuery} premium`,
      `${interpretedQuery} económico`,
      `${interpretedQuery} cerca de mi ubicación`
    ];
  }

  private extractUserPreferences(userHistory: any): string[] {
    const preferences: string[] = [];

    if (userHistory.favorites.length > 0) {
      preferences.push('Prefiere proveedores específicos');
    }

    if (userHistory.reviews.some((r: any) => r.rating >= 4)) {
      preferences.push('Valora alta calidad');
    }

    return preferences;
  }
}
