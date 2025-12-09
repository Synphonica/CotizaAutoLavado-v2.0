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
  ParseUUIDPipe,
  NotFoundException
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
import { ProvidersService } from '../services/providers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { UpdateProviderDto } from '../dto/update-provider.dto';
import { QueryProvidersDto } from '../dto/query-providers.dto';
import { UpdateProviderStatusDto } from '../dto/update-provider-status.dto';
import { NearbyProvidersDto } from '../dto/nearby-providers.dto';
import { ProviderResponseDto, ProviderListResponseDto } from '../dto/provider-response.dto';
import { ClerkAuthGuard } from '../../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, ProviderStatus } from '@prisma/client';

@ApiTags('providers')
@Controller('providers')
@UseGuards(ClerkAuthGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly prisma: PrismaService
  ) { }

  /**
   * Crear un nuevo proveedor
   */
  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo proveedor',
    description: 'Permite a un usuario crear su perfil de proveedor de servicios de autolavado'
  })
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene un proveedor o el email está en uso' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiBody({ type: CreateProviderDto })
  async create(
    @Body() createProviderDto: CreateProviderDto,
    @CurrentUser() user: any
  ): Promise<ProviderResponseDto> {
    return this.providersService.create(createProviderDto, user.clerkId);
  }

  /**
   * Obtener solicitudes de proveedores (Admin)
   */
  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener solicitudes de proveedores pendientes (Admin)',
    description: 'Obtiene proveedores con estatus PENDING_APPROVAL que tienen usuario asociado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de solicitudes obtenida exitosamente',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE'], description: 'Filtrar por status' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  async getProviderRequests(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<any> {
    const filterStatus = status || 'PENDING_APPROVAL';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    // Buscar proveedores con el status especificado y que tengan usuario asociado
    const where: any = {
      status: filterStatus as ProviderStatus,
      userId: { not: null } // Solo proveedores con usuario
    };

    const [data, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              clerkId: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      this.prisma.provider.count({ where })
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
  }

  /**
   * Obtener todos los proveedores con filtros
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener proveedores con filtros',
    description: 'Obtiene una lista paginada de proveedores con filtros opcionales'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores obtenida exitosamente',
    type: ProviderListResponseDto
  })
  @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre, tipo o descripción' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'VERIFIED'] })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por ciudad' })
  @ApiQuery({ name: 'region', required: false, description: 'Filtrar por región' })
  @ApiQuery({ name: 'latitude', required: false, description: 'Latitud para búsqueda geográfica' })
  @ApiQuery({ name: 'longitude', required: false, description: 'Longitud para búsqueda geográfica' })
  @ApiQuery({ name: 'radius', required: false, description: 'Radio en metros para búsqueda geográfica' })
  @ApiQuery({ name: 'minRating', required: false, description: 'Rating mínimo' })
  @ApiQuery({ name: 'acceptsBookings', required: false, description: 'Acepta reservas' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query() queryDto: QueryProvidersDto): Promise<ProviderListResponseDto> {
    return this.providersService.findAll(queryDto);
  }

  /**
   * Obtener proveedores cercanos
   */
  @Get('nearby')
  @ApiOperation({
    summary: 'Obtener proveedores cercanos',
    description: 'Obtiene proveedores activos en un radio específico desde un punto geográfico'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores cercanos obtenida exitosamente',
    type: [ProviderResponseDto]
  })
  @ApiQuery({ name: 'latitude', required: true, description: 'Latitud del punto de referencia' })
  @ApiQuery({ name: 'longitude', required: true, description: 'Longitud del punto de referencia' })
  @ApiQuery({ name: 'radius', required: false, description: 'Radio en metros (default: 5000)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (default: 10)' })
  async findNearby(@Query() nearbyDto: NearbyProvidersDto): Promise<ProviderResponseDto[]> {
    return this.providersService.findNearby(nearbyDto);
  }

  /**
   * Obtener estadísticas de proveedores (Solo Admin)
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Obtener estadísticas de proveedores',
    description: 'Obtiene estadísticas generales de proveedores (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  async getStats(): Promise<any> {
    return this.providersService.getStats();
  }

  /**
   * Obtener mi proveedor
   */
  @Get('my-provider')
  @ApiOperation({
    summary: 'Obtener mi proveedor',
    description: 'Obtiene el proveedor asociado al usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor obtenido exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Usuario no tiene proveedor registrado' })
  async getMyProvider(@CurrentUser() user: any): Promise<ProviderResponseDto | null> {
    return this.providersService.findByClerkId(user.clerkId);
  }

  /**
   * Obtener un proveedor por ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener proveedor por ID',
    description: 'Obtiene un proveedor específico por su ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor obtenido exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProviderResponseDto> {
    return this.providersService.findOne(id);
  }

  /**
   * Actualizar mi proveedor
   */
  @Patch('my-provider')
  @ApiOperation({
    summary: 'Actualizar mi proveedor',
    description: 'Actualiza el proveedor asociado al usuario autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Usuario no tiene proveedor registrado' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso por otro proveedor' })
  @ApiBody({ type: UpdateProviderDto })
  async updateMyProvider(
    @Body() updateProviderDto: UpdateProviderDto,
    @CurrentUser() user: any
  ): Promise<ProviderResponseDto> {
    const myProvider = await this.providersService.findByClerkId(user.clerkId);
    if (!myProvider) {
      throw new NotFoundException('No tienes un proveedor registrado');
    }
    return this.providersService.update(myProvider.id, updateProviderDto);
  }

  /**
   * Actualizar un proveedor (Solo Admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Actualizar proveedor (Admin)',
    description: 'Actualiza cualquier proveedor (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiBody({ type: UpdateProviderDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProviderDto: UpdateProviderDto
  ): Promise<ProviderResponseDto> {
    return this.providersService.update(id, updateProviderDto);
  }

  /**
   * Actualizar estado de un proveedor (Solo Admin)
   */
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Actualizar estado de proveedor (Admin)',
    description: 'Actualiza el estado de un proveedor (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: ProviderResponseDto
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  @ApiBody({ type: UpdateProviderStatusDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateProviderStatusDto
  ): Promise<ProviderResponseDto> {
    return this.providersService.updateStatus(id, updateStatusDto);
  }

  /**
   * Eliminar mi proveedor (soft delete)
   */
  @Delete('my-provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar mi proveedor',
    description: 'Elimina el proveedor asociado al usuario autenticado (soft delete)'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor eliminado exitosamente'
  })
  @ApiResponse({ status: 404, description: 'Usuario no tiene proveedor registrado' })
  async removeMyProvider(@CurrentUser() user: any): Promise<{ message: string }> {
    const myProvider = await this.providersService.findByClerkId(user.clerkId);
    if (!myProvider) {
      throw new NotFoundException('No tienes un proveedor registrado');
    }
    return this.providersService.remove(myProvider.id);
  }

  /**
   * Eliminar un proveedor (Solo Admin - soft delete)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar proveedor (Admin)',
    description: 'Elimina un proveedor (soft delete - solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor eliminado exitosamente'
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.providersService.remove(id);
  }

  /**
   * Eliminar proveedor permanentemente (Solo Admin)
   */
  @Delete(':id/permanent')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar proveedor permanentemente (Admin)',
    description: 'Elimina un proveedor permanentemente de la base de datos (solo administradores)'
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor eliminado permanentemente'
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo administradores' })
  @ApiParam({ name: 'id', description: 'ID del proveedor' })
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.providersService.permanentDelete(id);
  }
}
