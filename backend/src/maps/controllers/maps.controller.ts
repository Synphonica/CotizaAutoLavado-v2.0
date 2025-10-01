import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MapsService } from '../services/maps.service';
import { AutocompleteQueryDto, DistanceQueryDto, GeocodeQueryDto, ReverseGeocodeQueryDto } from '../dto/geocode.dto';

@ApiTags('maps')
@ApiBearerAuth()
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) { }

  @Get('geocode')
  @ApiOperation({ summary: 'Geocodificar dirección' })
  @ApiOkResponse({ description: 'Resultado de geocodificación' })
  @ApiQuery({ name: 'address', required: true })
  async geocode(@Query() query: GeocodeQueryDto) {
    return this.mapsService.geocode(query);
  }

  @Get('reverse')
  @ApiOperation({ summary: 'Reverse geocoding por coordenadas' })
  @ApiOkResponse({ description: 'Resultado de reverse geocoding' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  async reverse(@Query() query: ReverseGeocodeQueryDto) {
    return this.mapsService.reverseGeocode(query);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Sugerencias de lugares (autocomplete)' })
  @ApiOkResponse({ description: 'Sugerencias' })
  @ApiQuery({ name: 'input', required: true })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lng', required: false })
  @ApiQuery({ name: 'radius', required: false })
  async autocomplete(@Query() query: AutocompleteQueryDto) {
    return this.mapsService.autocomplete(query);
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calcular distancia entre dos puntos' })
  @ApiOkResponse({ description: 'Distancia y tiempo' })
  @ApiQuery({ name: 'originLat', required: true })
  @ApiQuery({ name: 'originLng', required: true })
  @ApiQuery({ name: 'destLat', required: true })
  @ApiQuery({ name: 'destLng', required: true })
  async distance(@Query() query: DistanceQueryDto) {
    return this.mapsService.distance(query);
  }
}
