import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TimeSlotsService } from './timeslots.service';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { UpdateTimeSlotDto } from './dto/update-timeslot.dto';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@ApiTags('TimeSlots')
@Controller('timeslots')
export class TimeSlotsController {
    constructor(private readonly timeSlotsService: TimeSlotsService) { }

    // ===== TIME SLOTS =====

    @Post()
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear un time slot para un proveedor' })
    @ApiResponse({ status: 201, description: 'Time slot creado' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    createTimeSlot(@Body() dto: CreateTimeSlotDto) {
        return this.timeSlotsService.createTimeSlot(dto);
    }

    @Get('provider/:providerId')
    @ApiOperation({ summary: 'Obtener todos los time slots de un proveedor' })
    @ApiResponse({ status: 200, description: 'Lista de time slots' })
    getProviderTimeSlots(@Param('providerId') providerId: string) {
        return this.timeSlotsService.getProviderTimeSlots(providerId);
    }

    @Get('provider/:providerId/day/:dayOfWeek')
    @ApiOperation({ summary: 'Obtener time slots por día de la semana' })
    @ApiResponse({ status: 200, description: 'Time slots del día' })
    getTimeSlotsByDay(
        @Param('providerId') providerId: string,
        @Param('dayOfWeek') dayOfWeek: string,
    ) {
        return this.timeSlotsService.getTimeSlotsByDay(providerId, parseInt(dayOfWeek));
    }

    @Patch(':id')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar un time slot' })
    @ApiResponse({ status: 200, description: 'Time slot actualizado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Time slot no encontrado' })
    updateTimeSlot(@Param('id') id: string, @Body() updateData: Partial<CreateTimeSlotDto>) {
        return this.timeSlotsService.updateTimeSlot(id, updateData);
    }

    @Delete(':id')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un time slot' })
    @ApiResponse({ status: 204, description: 'Time slot eliminado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Time slot no encontrado' })
    deleteTimeSlot(@Param('id') id: string) {
        return this.timeSlotsService.deleteTimeSlot(id);
    }

    @Post('provider/:providerId/defaults')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear time slots por defecto para un proveedor' })
    @ApiResponse({ status: 201, description: 'Time slots creados' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    createDefaultTimeSlots(@Param('providerId') providerId: string) {
        return this.timeSlotsService.createDefaultTimeSlots(providerId);
    }

    // ===== BLOCKED DATES =====

    @Post('blocked')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una fecha bloqueada' })
    @ApiResponse({ status: 201, description: 'Fecha bloqueada creada' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 409, description: 'Ya existe bloqueo para esa fecha' })
    createBlockedDate(@Body() dto: CreateBlockedDateDto) {
        return this.timeSlotsService.createBlockedDate(dto);
    }

    @Get('blocked/provider/:providerId')
    @ApiOperation({ summary: 'Obtener fechas bloqueadas de un proveedor' })
    @ApiResponse({ status: 200, description: 'Lista de fechas bloqueadas' })
    getProviderBlockedDates(
        @Param('providerId') providerId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.timeSlotsService.getProviderBlockedDates(providerId, startDate, endDate);
    }

    @Delete('blocked/:id')
    @UseGuards(ClerkAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar una fecha bloqueada' })
    @ApiResponse({ status: 204, description: 'Fecha bloqueada eliminada' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Fecha bloqueada no encontrada' })
    deleteBlockedDate(@Param('id') id: string) {
        return this.timeSlotsService.deleteBlockedDate(id);
    }
}
