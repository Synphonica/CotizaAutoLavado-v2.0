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
    ApiParam,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';
import { FavoritesService } from '../services/favorites.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { QueryFavoritesDto } from '../dto/query-favorites.dto';
import { FavoritesByUserDto } from '../dto/favorites-by-user.dto';
import { FavoritesByProviderDto } from '../dto/favorites-by-provider.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear un nuevo favorito',
        description: 'Permite a los usuarios marcar un proveedor como favorito'
    })
    @ApiResponse({
        status: 201,
        description: 'Favorito creado exitosamente',
        type: FavoriteResponseDto
    })
    @ApiResponse({ status: 400, description: 'Este proveedor ya está en tus favoritos' })
    @ApiResponse({ status: 404, description: 'Usuario o proveedor no encontrado' })
    @ApiBearerAuth()
    async create(
        @Body() createFavoriteDto: CreateFavoriteDto,
        @CurrentUser() user: any
    ): Promise<FavoriteResponseDto> {
        // Usar el ID del usuario autenticado
        createFavoriteDto.userId = user.id;
        return this.favoritesService.create(createFavoriteDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener todos los favoritos',
        description: 'Obtiene una lista paginada de todos los favoritos (solo admin)'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de favoritos obtenida exitosamente',
        schema: {
            type: 'object',
            properties: {
                favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteResponseDto' } },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID del usuario' })
    @ApiQuery({ name: 'providerId', required: false, type: String, description: 'ID del proveedor' })
    @ApiBearerAuth()
    async findAll(@Query() queryDto: QueryFavoritesDto) {
        return this.favoritesService.findAll(queryDto);
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener estadísticas de favoritos',
        description: 'Obtiene estadísticas generales de todos los favoritos (solo admin)'
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                totalFavorites: { type: 'number', example: 500 },
                favoritesByUser: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            userId: { type: 'string', example: 'user_123' },
                            count: { type: 'number', example: 5 }
                        }
                    }
                },
                favoritesByProvider: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            providerId: { type: 'string', example: 'provider_123' },
                            count: { type: 'number', example: 10 }
                        }
                    }
                },
                mostFavoritedProviders: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            providerId: { type: 'string', example: 'provider_123' },
                            businessName: { type: 'string', example: 'AutoLavado Premium' },
                            count: { type: 'number', example: 25 }
                        }
                    }
                }
            }
        }
    })
    @ApiBearerAuth()
    async getStats() {
        return this.favoritesService.getStats();
    }

    @Get('my-favorites')
    @ApiOperation({
        summary: 'Obtener mis favoritos',
        description: 'Obtiene los favoritos del usuario autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Favoritos del usuario obtenidos exitosamente',
        schema: {
            type: 'object',
            properties: {
                favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteResponseDto' } },
                total: { type: 'number', example: 5 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'sortBy', required: false, enum: ['addedAt', 'businessName', 'rating'] })
    @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
    @ApiBearerAuth()
    async getMyFavorites(
        @Query() queryDto: FavoritesByUserDto,
        @CurrentUser() user: any
    ) {
        return this.favoritesService.findByUser(user.id, queryDto);
    }

    @Get('provider/:providerId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener favoritos por proveedor',
        description: 'Obtiene todos los usuarios que marcaron un proveedor como favorito (solo admin)'
    })
    @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
    @ApiResponse({
        status: 200,
        description: 'Favoritos del proveedor obtenidos exitosamente',
        schema: {
            type: 'object',
            properties: {
                favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteResponseDto' } },
                total: { type: 'number', example: 15 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 2 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiBearerAuth()
    async findByProvider(
        @Param('providerId') providerId: string,
        @Query() queryDto: FavoritesByProviderDto
    ) {
        return this.favoritesService.findByProvider(providerId, queryDto);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener favoritos por usuario',
        description: 'Obtiene todos los favoritos de un usuario específico (solo admin)'
    })
    @ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({
        status: 200,
        description: 'Favoritos del usuario obtenidos exitosamente',
        schema: {
            type: 'object',
            properties: {
                favorites: { type: 'array', items: { $ref: '#/components/schemas/FavoriteResponseDto' } },
                total: { type: 'number', example: 8 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiBearerAuth()
    async findByUser(
        @Param('userId') userId: string,
        @Query() queryDto: FavoritesByUserDto
    ) {
        return this.favoritesService.findByUser(userId, queryDto);
    }

    @Get('check/:providerId')
    @ApiOperation({
        summary: 'Verificar si un proveedor está en favoritos',
        description: 'Verifica si el usuario autenticado tiene un proveedor en sus favoritos'
    })
    @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
    @ApiResponse({
        status: 200,
        description: 'Estado del favorito obtenido exitosamente',
        schema: {
            type: 'object',
            properties: {
                isFavorite: { type: 'boolean', example: true }
            }
        }
    })
    @ApiBearerAuth()
    async checkFavorite(
        @Param('providerId') providerId: string,
        @CurrentUser() user: any
    ) {
        const isFavorite = await this.favoritesService.isFavorite(user.id, providerId);
        return { isFavorite };
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Obtener un favorito por ID',
        description: 'Obtiene los detalles de un favorito específico'
    })
    @ApiParam({ name: 'id', description: 'ID del favorito' })
    @ApiResponse({
        status: 200,
        description: 'Favorito obtenido exitosamente',
        type: FavoriteResponseDto
    })
    @ApiResponse({ status: 404, description: 'Favorito no encontrado' })
    async findOne(@Param('id') id: string): Promise<FavoriteResponseDto> {
        return this.favoritesService.findOne(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar un favorito',
        description: 'Permite al usuario eliminar un favorito de su lista'
    })
    @ApiParam({ name: 'id', description: 'ID del favorito' })
    @ApiResponse({ status: 204, description: 'Favorito eliminado exitosamente' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar este favorito' })
    @ApiResponse({ status: 404, description: 'Favorito no encontrado' })
    @ApiBearerAuth()
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any
    ): Promise<void> {
        return this.favoritesService.remove(id, user.id);
    }

    @Delete('provider/:providerId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar favorito por proveedor',
        description: 'Elimina un favorito específico del usuario autenticado por ID de proveedor'
    })
    @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
    @ApiResponse({ status: 204, description: 'Favorito eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Favorito no encontrado' })
    @ApiBearerAuth()
    async removeByProvider(
        @Param('providerId') providerId: string,
        @CurrentUser() user: any
    ): Promise<void> {
        return this.favoritesService.removeByUserAndProvider(user.id, providerId);
    }
}
