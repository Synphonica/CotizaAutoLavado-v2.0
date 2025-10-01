import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ComparisonService } from '../services/comparison.service';
import { CompareQueryDto, ComparisonResponseDto } from '../dto/compare-query.dto';

@ApiTags('comparison')
@ApiBearerAuth()
@Controller('comparison')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) { }

  @Get()
  @ApiOperation({ summary: 'Comparar servicios por precio, distancia y rating' })
  @ApiOkResponse({ description: 'Resultados de comparación', type: ComparisonResponseDto as any })
  @ApiQuery({ name: 'search', required: false, description: 'Texto de búsqueda' })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo de servicio' })
  @ApiQuery({ name: 'category', required: false, description: 'Categoría' })
  @ApiQuery({ name: 'status', required: false, description: 'Estado del servicio' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo' })
  @ApiQuery({ name: 'latitude', required: false, description: 'Latitud del usuario' })
  @ApiQuery({ name: 'longitude', required: false, description: 'Longitud del usuario' })
  @ApiQuery({ name: 'maxDistanceKm', required: false, description: 'Radio máximo en km' })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Solo disponibles' })
  @ApiQuery({ name: 'city', required: false, description: 'Ciudad del proveedor' })
  @ApiQuery({ name: 'region', required: false, description: 'Región del proveedor' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Criterio de orden', enum: ['effectivePrice', 'distance', 'rating', 'discount', 'duration'] })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Criterio de orden', enum: ['effectivePrice', 'distance', 'rating', 'discount', 'duration', 'score'] })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Orden', enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite' })
  async compare(@Query() query: CompareQueryDto): Promise<ComparisonResponseDto> {
    return this.comparisonService.compare(query);
  }
}
