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
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { QueryServicesDto } from '../dto/query-services.dto';
import { UpdateServiceStatusDto } from '../dto/update-service-status.dto';
import { ServicesByProviderDto } from '../dto/services-by-provider.dto';
import { ServiceResponseDto, ServiceListResponseDto } from '../dto/service-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('services')
@Controller('services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  /**
   * Crear un nuevo servicio
   */
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo servicio',
    description: 'Permite a un proveedor crear un nuevo servicio de autolavado'
  })
  @ApiResponse({
    status: 201,
    description: 'Servicio creado exitosamente',
    type: ServiceResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un servicio con este nombre para este proveedor' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreateServiceDto })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() user: any
  ): Promise<ServiceResponseDto> {
    return this.servicesService.create(createServiceDto, user.id);
  }

  /**
   * Obtener todos los servicios con filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener servicios con filtros',
    description: 'Obtiene una lista paginada de servicios con filtros opcionales'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios obtenida exitosamente',
    type: ServiceListResponseDto
  })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre, descripción o categoría' })
  @ApiQuery({ name: 'type', required: false, enum: ['BASIC_WASH', 'PREMIUM_WASH', 'DETAILING', 'WAXING', 'INTERIOR_CLEAN', 'ENGINE_CLEAN', 'TIRE_CLEAN', 'PAINT_PROTECTION', 'CERAMIC_COATING'] })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL'] })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoría' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo' })
  @ApiQuery({ name: 'providerId', required: false, description: 'Filtrar por proveedor' })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Solo servicios disponibles' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Solo servicios destacados' })
  @ApiQuery({ name: 'minDuration', required: false, description: 'Duración mínima en minutos' })
  @ApiQuery({ name: 'maxDuration', required: false, description: 'Duración máxima en minutos' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filtrar por etiqueta' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por ciudad del proveedor' })
  @ApiQuery({ name: 'region', required: false, description: 'Filtrar por región del proveedor' })
  @ApiQuery({ name: 'minProviderRating', required: false, description: 'Rating mínimo del proveedor' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryServicesDto): Promise<ServiceListResponseDto> {
    return this.servicesService.findAll(queryDto);
  }

  /**
   * Obtener servicios por proveedor
   */
  @Get('provider/:providerId')
  @ApiOperation({
    summary: 'Obtener servicios por proveedor',
    description: 'Obtiene todos los servicios de un proveedor específico'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios del proveedor obtenida exitosamente',
    type: ServiceListResponseDto
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo de servicio' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Solo servicios disponibles' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Solo servicios destacados' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoría' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findByProvider(
    @Param('providerId') providerId: string,
    @Query() queryDto: ServicesByProviderDto
  ): Promise<ServiceListResponseDto> {
    return this.servicesService.findByProvider(providerId, queryDto);
  }

  /**
   * Obtener estadísticas de servicios (Solo Admin)
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas de servicios',
    description: 'Obtiene estadísticas generales de servicios (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  async getStats(): Promise<any> {
    return this.servicesService.getStats();
  }

  /**
   * Obtener un servicio por ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Obtener servicio por ID',
    description: 'Obtiene un servicio específico por su ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio obtenido exitosamente',
    type: ServiceResponseDto
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  async findOne(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.servicesService.findOne(id);
  }

  /**
   * Actualizar un servicio
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar servicio',
    description: 'Actualiza un servicio. Los proveedores solo pueden actualizar sus propios servicios, los administradores pueden actualizar cualquier servicio'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado exitosamente',
    type: ServiceResponseDto
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para actualizar este servicio' })
  @ApiResponse({ status: 409, description: 'Ya existe un servicio con este nombre para este proveedor' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiBody({ type: UpdateServiceDto })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: any
  ): Promise<ServiceResponseDto> {
    // Los administradores pueden actualizar cualquier servicio
    const isAdmin = user.role === UserRole.ADMIN;
    return this.servicesService.update(id, updateServiceDto, isAdmin ? undefined : user.id);
  }

  /**
   * Actualizar estado de un servicio (Solo Admin)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de servicio (Admin)',
    description: 'Actualiza el estado de un servicio (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: ServiceResponseDto
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  @ApiBody({ type: UpdateServiceStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateServiceStatusDto
  ): Promise<ServiceResponseDto> {
    return this.servicesService.updateStatus(id, updateStatusDto);
  }

  /**
   * Eliminar un servicio (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar servicio',
    description: 'Elimina un servicio (soft delete). Los proveedores solo pueden eliminar sus propios servicios, los administradores pueden eliminar cualquier servicio'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio eliminado exitosamente'
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar este servicio' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    // Los administradores pueden eliminar cualquier servicio
    const isAdmin = user.role === UserRole.ADMIN;
    return this.servicesService.remove(id, isAdmin ? undefined : user.id);
  }

  /**
   * Eliminar servicio permanentemente (Solo Admin)
   */
  @Delete(':id/permanent')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar servicio permanentemente (Admin)',
    description: 'Elimina un servicio permanentemente de la base de datos (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio eliminado permanentemente'
  })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del servicio' })
  async permanentDelete(@Param('id') id: string): Promise<{ message: string }> {
    return this.servicesService.permanentDelete(id);
  }
}
