import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PriceAlertsService } from './price-alerts.service';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('Price Alerts')
@Controller('price-alerts')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class PriceAlertsController {
    constructor(private readonly priceAlertsService: PriceAlertsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva alerta de precio' })
    @ApiResponse({
        status: 201,
        description: 'Alerta creada exitosamente',
    })
    @ApiResponse({
        status: 400,
        description: 'Datos inválidos o alerta ya existe',
    })
    @ApiResponse({
        status: 404,
        description: 'Servicio no encontrado',
    })
    create(@Request() req, @Body() createPriceAlertDto: CreatePriceAlertDto) {
        return this.priceAlertsService.create(req.user.userId, createPriceAlertDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las alertas del usuario autenticado' })
    @ApiResponse({
        status: 200,
        description: 'Lista de alertas del usuario',
    })
    findAll(@Request() req) {
        return this.priceAlertsService.findAllByUser(req.user.userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una alerta específica' })
    @ApiResponse({
        status: 200,
        description: 'Detalle de la alerta',
    })
    @ApiResponse({
        status: 404,
        description: 'Alerta no encontrada',
    })
    findOne(@Param('id') id: string, @Request() req) {
        return this.priceAlertsService.findOne(id, req.user.userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una alerta' })
    @ApiResponse({
        status: 200,
        description: 'Alerta actualizada exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Alerta no encontrada',
    })
    update(
        @Param('id') id: string,
        @Request() req,
        @Body() updatePriceAlertDto: UpdatePriceAlertDto,
    ) {
        return this.priceAlertsService.update(id, req.user.userId, updatePriceAlertDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una alerta' })
    @ApiResponse({
        status: 200,
        description: 'Alerta eliminada exitosamente',
    })
    @ApiResponse({
        status: 404,
        description: 'Alerta no encontrada',
    })
    remove(@Param('id') id: string, @Request() req) {
        return this.priceAlertsService.remove(id, req.user.userId);
    }

    @Get('service/:serviceId/history')
    @ApiOperation({ summary: 'Obtener historial de precios de un servicio' })
    @ApiResponse({
        status: 200,
        description: 'Historial de precios del servicio',
    })
    getPriceHistory(@Param('serviceId') serviceId: string) {
        return this.priceAlertsService.getPriceHistory(serviceId);
    }
}
