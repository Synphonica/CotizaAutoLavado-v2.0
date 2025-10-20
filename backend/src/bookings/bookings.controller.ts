import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingDto } from './dto/filter-booking.dto';
import { CheckAvailabilityDto, RescheduleBookingDto } from './dto/booking-actions.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva reserva' })
    @ApiResponse({ status: 201, description: 'Reserva creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 404, description: 'Proveedor o servicio no encontrado' })
    @ApiResponse({ status: 409, description: 'Horario no disponible' })
    create(@Body() createBookingDto: CreateBookingDto) {
        return this.bookingsService.create(createBookingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las reservas con filtros' })
    @ApiResponse({ status: 200, description: 'Lista de reservas' })
    findAll(@Query() filters: FilterBookingDto) {
        return this.bookingsService.findAll(filters);
    }

    @Get('stats/:providerId')
    @ApiOperation({ summary: 'Obtener estadísticas de reservas de un proveedor' })
    @ApiResponse({ status: 200, description: 'Estadísticas de reservas' })
    getStats(
        @Param('providerId') providerId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.bookingsService.getBookingStats(providerId, startDate, endDate);
    }

    @Get('availability/:providerId')
    @ApiOperation({ summary: 'Verificar disponibilidad de horarios para una fecha (GET)' })
    @ApiResponse({ status: 200, description: 'Horarios disponibles' })
    getAvailability(
        @Param('providerId') providerId: string,
        @Query('date') date: string,
        @Query('serviceId') serviceId?: string,
    ) {
        const checkDto: CheckAvailabilityDto = {
            providerId,
            date,
            serviceId,
        };
        return this.bookingsService.checkAvailability(checkDto);
    }

    @Post('check-availability')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verificar disponibilidad de horarios para una fecha (POST)' })
    @ApiResponse({ status: 200, description: 'Horarios disponibles' })
    checkAvailability(@Body() checkDto: CheckAvailabilityDto) {
        return this.bookingsService.checkAvailability(checkDto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una reserva por ID' })
    @ApiResponse({ status: 200, description: 'Detalles de la reserva' })
    @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una reserva' })
    @ApiResponse({ status: 200, description: 'Reserva actualizada' })
    @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
    update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
        return this.bookingsService.update(id, updateBookingDto);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancelar una reserva' })
    @ApiResponse({ status: 200, description: 'Reserva cancelada' })
    @ApiResponse({ status: 400, description: 'No se puede cancelar la reserva' })
    @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
    cancel(@Param('id') id: string, @Body('reason') reason?: string) {
        return this.bookingsService.cancel(id, reason);
    }

    @Post(':id/reschedule')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reagendar una reserva' })
    @ApiResponse({ status: 200, description: 'Reserva reagendada' })
    @ApiResponse({ status: 400, description: 'No se puede reagendar la reserva' })
    @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
    @ApiResponse({ status: 409, description: 'Nuevo horario no disponible' })
    reschedule(@Param('id') id: string, @Body() rescheduleDto: RescheduleBookingDto) {
        return this.bookingsService.reschedule(id, rescheduleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar/Cancelar una reserva' })
    @ApiResponse({ status: 200, description: 'Reserva eliminada' })
    @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
    remove(@Param('id') id: string) {
        return this.bookingsService.remove(id);
    }
}
