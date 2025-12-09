import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProviderRequestsService } from './provider-requests.service';
import { CreateProviderRequestDto } from './dto/create-provider-request.dto';
import { UpdateProviderRequestStatusDto } from './dto/update-provider-request-status.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProviderRequestStatus, UserRole } from '@prisma/client';

@ApiTags('Provider Requests')
@Controller('provider-requests')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ProviderRequestsController {
    constructor(
        private readonly providerRequestsService: ProviderRequestsService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Crear solicitud para convertirse en proveedor' })
    create(@Req() req, @Body() createDto: CreateProviderRequestDto) {
        return this.providerRequestsService.create(req.users.userId, createDto);
    }

    @Get('my-request')
    @ApiOperation({ summary: 'Obtener mi solicitud más reciente' })
    getMyRequest(@Req() req) {
        return this.providerRequestsService.getMyRequest(req.users.userId);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Obtener todas las solicitudes (solo admin)' })
    @ApiQuery({ name: 'status', required: false, enum: ProviderRequestStatus })
    findAll(@Query('status') status?: ProviderRequestStatus) {
        return this.providerRequestsService.findAll(status);
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Obtener una solicitud por ID (solo admin)' })
    findOne(@Param('id') id: string) {
        return this.providerRequestsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Actualizar estado de solicitud (solo admin)' })
    updateStatus(
        @Param('id') id: string,
        @Req() req,
        @Body() updateDto: UpdateProviderRequestStatusDto,
    ) {
        return this.providerRequestsService.updateStatus(
            id,
            req.users.userId,
            updateDto,
        );
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancelar mi solicitud' })
    cancel(@Param('id') id: string, @Req() req) {
        return this.providerRequestsService.cancel(id, req.users.userId);
    }
}
