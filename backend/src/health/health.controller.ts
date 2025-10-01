import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado del sistema' })
  @ApiResponse({ status: 200, description: 'Sistema funcionando correctamente' })
  @ApiResponse({ status: 503, description: 'Sistema con problemas' })
  async check() {
    return this.healthService.check();
  }

  @Get('database')
  @ApiOperation({ summary: 'Verificar conexión a la base de datos' })
  @ApiResponse({ status: 200, description: 'Base de datos conectada' })
  @ApiResponse({ status: 503, description: 'Error de conexión a la base de datos' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Verificación detallada del sistema' })
  @ApiResponse({ status: 200, description: 'Información detallada del sistema' })
  async checkDetailed() {
    return this.healthService.checkDetailed();
  }
}