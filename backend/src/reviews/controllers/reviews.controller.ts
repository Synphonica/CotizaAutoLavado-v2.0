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
    Request,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
    ApiBody
} from '@nestjs/swagger';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';
import { ReviewsByProviderDto } from '../dto/reviews-by-provider.dto';
import { ReviewsByUserDto } from '../dto/reviews-by-user.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva reseña',
        description: 'Permite a los usuarios crear reseñas para proveedores y servicios'
    })
    @ApiResponse({
        status: 201,
        description: 'Reseña creada exitosamente',
        type: ReviewResponseDto
    })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 404, description: 'Usuario, proveedor o servicio no encontrado' })
    @ApiResponse({ status: 409, description: 'Ya existe una reseña para este proveedor/servicio' })
    @ApiBearerAuth()
    async create(
        @Body() createReviewDto: CreateReviewDto,
        @CurrentUser() user: any
    ): Promise<ReviewResponseDto> {
        // Usar el ID del usuario autenticado
        createReviewDto.userId = user.id;
        return this.reviewsService.create(createReviewDto);
    }

    @Get()
    @Public()
    @ApiOperation({
        summary: 'Obtener todas las reseñas',
        description: 'Obtiene una lista paginada de reseñas con filtros opcionales'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de reseñas obtenida exitosamente',
        schema: {
            type: 'object',
            properties: {
                reviews: { type: 'array', items: { $ref: '#/components/schemas/ReviewResponseDto' } },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Calificación mínima (1-5)' })
    @ApiQuery({ name: 'maxRating', required: false, type: Number, description: 'Calificación máxima (1-5)' })
    async findAll(@Query() queryDto: QueryReviewsDto) {
        return this.reviewsService.findAll(queryDto);
    }

    @Get('stats')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener estadísticas de reseñas',
        description: 'Obtiene estadísticas generales de todas las reseñas (solo admin)'
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                totalReviews: { type: 'number', example: 1500 },
                approvedReviews: { type: 'number', example: 1200 },
                pendingReviews: { type: 'number', example: 250 },
                rejectedReviews: { type: 'number', example: 50 },
                averageRating: { type: 'number', example: 4.2 },
                ratingDistribution: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            rating: { type: 'number', example: 5 },
                            count: { type: 'number', example: 300 }
                        }
                    }
                }
            }
        }
    })
    @ApiBearerAuth()
    async getStats() {
        return this.reviewsService.getStats();
    }

    @Get('my-reviews')
    @ApiOperation({
        summary: 'Obtener mis reseñas',
        description: 'Obtiene las reseñas del usuario autenticado'
    })
    @ApiResponse({
        status: 200,
        description: 'Reseñas del usuario obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                reviews: { type: 'array', items: { $ref: '#/components/schemas/ReviewResponseDto' } },
                total: { type: 'number', example: 5 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiBearerAuth()
    async getMyReviews(
        @Query() queryDto: ReviewsByUserDto,
        @CurrentUser() user: any
    ) {
        return this.reviewsService.findByUser(user.id, queryDto);
    }

    @Get('provider/:providerId')
    @Public()
    @ApiOperation({
        summary: 'Obtener reseñas por proveedor',
        description: 'Obtiene todas las reseñas de un proveedor específico'
    })
    @ApiParam({ name: 'providerId', description: 'ID del proveedor' })
    @ApiResponse({
        status: 200,
        description: 'Reseñas del proveedor obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                reviews: { type: 'array', items: { $ref: '#/components/schemas/ReviewResponseDto' } },
                total: { type: 'number', example: 25 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 3 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiQuery({ name: 'minRating', required: false, type: Number })
    @ApiQuery({ name: 'maxRating', required: false, type: Number })
    async findByProvider(
        @Param('providerId') providerId: string,
        @Query() queryDto: ReviewsByProviderDto
    ) {
        return this.reviewsService.findByProvider(providerId, queryDto);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Obtener reseñas por usuario',
        description: 'Obtiene todas las reseñas de un usuario específico (solo admin)'
    })
    @ApiParam({ name: 'userId', description: 'ID del usuario' })
    @ApiResponse({
        status: 200,
        description: 'Reseñas del usuario obtenidas exitosamente',
        schema: {
            type: 'object',
            properties: {
                reviews: { type: 'array', items: { $ref: '#/components/schemas/ReviewResponseDto' } },
                total: { type: 'number', example: 8 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 1 }
            }
        }
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED'] })
    @ApiBearerAuth()
    async findByUser(
        @Param('userId') userId: string,
        @Query() queryDto: ReviewsByUserDto
    ) {
        return this.reviewsService.findByUser(userId, queryDto);
    }

    @Get(':id')
    @Public()
    @ApiOperation({
        summary: 'Obtener una reseña por ID',
        description: 'Obtiene los detalles de una reseña específica'
    })
    @ApiParam({ name: 'id', description: 'ID de la reseña' })
    @ApiResponse({
        status: 200,
        description: 'Reseña obtenida exitosamente',
        type: ReviewResponseDto
    })
    @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
    async findOne(@Param('id') id: string): Promise<ReviewResponseDto> {
        return this.reviewsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar una reseña',
        description: 'Permite al autor o admin actualizar una reseña'
    })
    @ApiParam({ name: 'id', description: 'ID de la reseña' })
    @ApiResponse({
        status: 200,
        description: 'Reseña actualizada exitosamente',
        type: ReviewResponseDto
    })
    @ApiResponse({ status: 400, description: 'No se puede editar una reseña ya publicada' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para editar esta reseña' })
    @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
    @ApiBearerAuth()
    async update(
        @Param('id') id: string,
        @Body() updateReviewDto: UpdateReviewDto,
        @CurrentUser() user: any
    ): Promise<ReviewResponseDto> {
        return this.reviewsService.update(id, updateReviewDto, user.id);
    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Actualizar estado de una reseña',
        description: 'Permite a los administradores aprobar o rechazar reseñas'
    })
    @ApiParam({ name: 'id', description: 'ID de la reseña' })
    @ApiResponse({
        status: 200,
        description: 'Estado de la reseña actualizado exitosamente',
        type: ReviewResponseDto
    })
    @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
    @ApiBearerAuth()
    async updateStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateReviewStatusDto
    ): Promise<ReviewResponseDto> {
        return this.reviewsService.updateStatus(id, updateStatusDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar una reseña',
        description: 'Permite al autor o admin eliminar una reseña'
    })
    @ApiParam({ name: 'id', description: 'ID de la reseña' })
    @ApiResponse({ status: 204, description: 'Reseña eliminada exitosamente' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar esta reseña' })
    @ApiResponse({ status: 404, description: 'Reseña no encontrada' })
    @ApiBearerAuth()
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any
    ): Promise<void> {
        return this.reviewsService.remove(id, user.id);
    }
}
