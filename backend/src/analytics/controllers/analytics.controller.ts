import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import {
  AnalyticsQueryDto,
  AnalyticsResponseDto,
  DashboardDataDto
} from '../dto/analytics.dto';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener métricas específicas del sistema' })
  @ApiOkResponse({ description: 'Métricas solicitadas', type: AnalyticsResponseDto as any })
  @ApiQuery({ name: 'metricType', required: false, description: 'Tipo de métrica', enum: ['overview', 'users', 'providers', 'services', 'reviews', 'revenue'] })
  @ApiQuery({ name: 'startDate', required: false, description: 'Fecha de inicio' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Fecha de fin' })
  @ApiQuery({ name: 'groupBy', required: false, description: 'Agrupación temporal', enum: ['day', 'week', 'month', 'year'] })
  @ApiQuery({ name: 'providerId', required: false, description: 'ID del proveedor' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados' })
  async getMetrics(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponseDto> {
    return this.analyticsService.getMetrics(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener datos completos del dashboard' })
  @ApiOkResponse({ description: 'Datos del dashboard', type: DashboardDataDto as any })
  async getDashboardData(): Promise<DashboardDataDto> {
    return this.analyticsService.getDashboardData();
  }
}
