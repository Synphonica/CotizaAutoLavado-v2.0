import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth
} from '@nestjs/swagger';
import { SearchService } from '../service/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResponseDto } from '../dto/search-response.dto';
import { SearchSuggestionsDto, SearchSuggestionDto } from '../dto/search-suggestions.dto';
import { NearbySearchDto } from '../dto/nearby-search.dto';
import { SearchResultDto } from '../dto/search-result.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Post()
  @Public()
  @ApiOperation({
    summary: 'Búsqueda principal de servicios',
    description: 'Realiza una búsqueda avanzada de servicios de autolavado con filtros por ubicación, precio, calificación, etc.'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
    type: SearchResponseDto
  })
  @ApiResponse({ status: 400, description: 'Parámetros de búsqueda inválidos' })
  async search(@Body() searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(searchQuery);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Búsqueda rápida por query string',
    description: 'Realiza una búsqueda rápida usando parámetros de query string'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
    type: SearchResponseDto
  })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda', example: 'lavado premium' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Latitud' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Longitud' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radio en km' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Ciudad' })
  @ApiQuery({ name: 'region', required: false, type: String, description: 'Región' })
  @ApiQuery({ name: 'type', required: false, enum: ['BASIC_WASH', 'PREMIUM_WASH', 'DETAILING', 'WAXING', 'INTERIOR_CLEAN', 'ENGINE_CLEAN', 'TIRE_CLEAN', 'PAINT_PROTECTION', 'CERAMIC_COATING'] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Precio mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Precio máximo' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Calificación mínima' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['relevance', 'price', 'rating', 'distance', 'name', 'createdAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async searchQuick(@Query() query: any): Promise<SearchResponseDto> {
    const searchQuery: SearchQueryDto = {
      query: query.q || '',
      latitude: query.lat ? parseFloat(query.lat) : undefined,
      longitude: query.lng ? parseFloat(query.lng) : undefined,
      radius: query.radius ? parseInt(query.radius) : undefined,
      city: query.city,
      region: query.region,
      serviceType: query.type,
      minPrice: query.minPrice ? parseInt(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? parseInt(query.maxPrice) : undefined,
      minRating: query.minRating ? parseFloat(query.minRating) : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      sortBy: query.sortBy || 'relevance',
      sortOrder: query.sortOrder || 'asc'
    };

    return this.searchService.search(searchQuery);
  }

  @Get('nearby')
  @Public()
  @ApiOperation({
    summary: 'Búsqueda por proximidad',
    description: 'Busca servicios cercanos a una ubicación específica'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios cercanos encontrados exitosamente',
    type: SearchResponseDto
  })
  @ApiQuery({ name: 'lat', description: 'Latitud', example: -33.4489 })
  @ApiQuery({ name: 'lng', description: 'Longitud', example: -70.6693 })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radio en km', example: 5 })
  @ApiQuery({ name: 'type', required: false, enum: ['BASIC_WASH', 'PREMIUM_WASH', 'DETAILING', 'WAXING', 'INTERIOR_CLEAN', 'ENGINE_CLEAN', 'TIRE_CLEAN', 'PAINT_PROTECTION', 'CERAMIC_COATING'] })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Precio máximo' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Calificación mínima' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  async searchNearby(@Query() query: any): Promise<SearchResponseDto> {
    const nearbySearch: NearbySearchDto = {
      latitude: parseFloat(query.lat),
      longitude: parseFloat(query.lng),
      radius: query.radius ? parseInt(query.radius) : 5,
      serviceType: query.type,
      maxPrice: query.maxPrice ? parseInt(query.maxPrice) : undefined,
      minRating: query.minRating ? parseFloat(query.minRating) : undefined,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      sortBy: query.sortBy || 'distance',
      sortOrder: query.sortOrder || 'asc'
    };

    return this.searchService.searchNearby(nearbySearch);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({
    summary: 'Obtener sugerencias de búsqueda',
    description: 'Obtiene sugerencias de autocompletado para términos de búsqueda'
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias obtenidas exitosamente',
    type: [SearchSuggestionDto]
  })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda', example: 'lav' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de sugerencias', example: 10 })
  @ApiQuery({ name: 'type', required: false, enum: ['services', 'providers', 'all'], description: 'Tipo de sugerencias' })
  @ApiQuery({ name: 'lat', required: false, type: Number, description: 'Latitud para sugerencias por proximidad' })
  @ApiQuery({ name: 'lng', required: false, type: Number, description: 'Longitud para sugerencias por proximidad' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Radio en km para sugerencias por proximidad' })
  async getSuggestions(@Query() query: any): Promise<SearchSuggestionDto[]> {
    const suggestionsDto: SearchSuggestionsDto = {
      query: query.q,
      limit: query.limit ? parseInt(query.limit) : 10,
      type: query.type || 'all',
      latitude: query.lat ? parseFloat(query.lat) : undefined,
      longitude: query.lng ? parseFloat(query.lng) : undefined,
      radius: query.radius ? parseInt(query.radius) : 10
    };

    return this.searchService.getSuggestions(suggestionsDto);
  }

  @Get('popular')
  @Public()
  @ApiOperation({
    summary: 'Obtener servicios populares',
    description: 'Obtiene los servicios más populares basados en calificaciones y número de reseñas'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios populares obtenidos exitosamente',
    type: [SearchResultDto]
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de servicios a retornar', example: 10 })
  async getPopularServices(@Query('limit') limit?: number): Promise<SearchResultDto[]> {
    return this.searchService.getPopularServices(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('discounted')
  @Public()
  @ApiOperation({
    summary: 'Obtener servicios en oferta',
    description: 'Obtiene servicios que tienen descuentos activos'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios en oferta obtenidos exitosamente',
    type: [SearchResultDto]
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de servicios a retornar', example: 10 })
  async getDiscountedServices(@Query('limit') limit?: number): Promise<SearchResultDto[]> {
    return this.searchService.getDiscountedServices(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('categories')
  @Public()
  @ApiOperation({
    summary: 'Obtener categorías de servicios',
    description: 'Obtiene todas las categorías de servicios disponibles'
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', example: 'Lavado Exterior' },
          count: { type: 'number', example: 25 }
        }
      }
    }
  })
  async getCategories(): Promise<Array<{ category: string; count: number }>> {
    const categories = await this.searchService['prisma'].service.groupBy({
      by: ['category'],
      where: {
        status: 'ACTIVE',
        isAvailable: true,
        deletedAt: null
      },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } }
    });

    return categories
      .filter(cat => cat.category !== null)
      .map(cat => ({
        category: cat.category!,
        count: cat._count.category
      }));
  }

  @Get('price-range')
  @Public()
  @ApiOperation({
    summary: 'Obtener rango de precios',
    description: 'Obtiene el rango de precios mínimo y máximo de todos los servicios'
  })
  @ApiResponse({
    status: 200,
    description: 'Rango de precios obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        min: { type: 'number', example: 5000 },
        max: { type: 'number', example: 50000 },
        average: { type: 'number', example: 15000 }
      }
    }
  })
  async getPriceRange(): Promise<{ min: number; max: number; average: number }> {
    const stats = await this.searchService['prisma'].service.aggregate({
      where: {
        status: 'ACTIVE',
        isAvailable: true,
        deletedAt: null
      },
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true }
    });

    return {
      min: Number(stats._min.price) || 0,
      max: Number(stats._max.price) || 0,
      average: Math.round(Number(stats._avg.price) || 0)
    };
  }

  @Get('locations')
  @Public()
  @ApiOperation({
    summary: 'Obtener todas las ubicaciones disponibles',
    description: 'Retorna todas las regiones y comunas donde hay servicios disponibles'
  })
  @ApiResponse({
    status: 200,
    description: 'Ubicaciones obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        regions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Región Metropolitana', 'Región de Valparaíso']
        },
        cities: {
          type: 'array',
          items: { type: 'string' },
          example: ['Santiago', 'Providencia', 'Las Condes']
        },
        regionCityMap: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  })
  async getLocations(): Promise<{
    regions: string[];
    cities: string[];
    regionCityMap: Record<string, string[]>;
  }> {
    return this.searchService.getAvailableLocations();
  }

  @Get('similar/:serviceId')
  @Public()
  @ApiOperation({
    summary: 'Obtener servicios similares',
    description: 'Retorna servicios similares del mismo tipo y rango de precio para comparación'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios similares obtenidos exitosamente',
    type: [SearchResultDto]
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número de servicios similares a retornar' })
  async getSimilarServices(
    @Param('serviceId') serviceId: string,
    @Query('limit') limit?: number
  ): Promise<SearchResultDto[]> {
    return this.searchService.getSimilarServices(serviceId, limit ? Number(limit) : 6);
  }
}