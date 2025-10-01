import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { QueryReviewsDto } from '../dto/query-reviews.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';
import { ReviewsByProviderDto } from '../dto/reviews-by-provider.dto';
import { ReviewsByUserDto } from '../dto/reviews-by-user.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva reseña
     */
    async create(createReviewDto: CreateReviewDto): Promise<ReviewResponseDto> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: createReviewDto.userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar que el proveedor existe
        const provider = await this.prisma.provider.findUnique({
            where: { id: createReviewDto.providerId }
        });
        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        // Verificar que el servicio existe (si se proporciona)
        if (createReviewDto.serviceId) {
            const service = await this.prisma.service.findUnique({
                where: { id: createReviewDto.serviceId }
            });
            if (!service) {
                throw new NotFoundException('Servicio no encontrado');
            }
        }

        // Verificar que el usuario no haya dejado ya una reseña para este proveedor/servicio
        const existingReview = await this.prisma.review.findFirst({
            where: {
                userId: createReviewDto.userId,
                providerId: createReviewDto.providerId,
                serviceId: createReviewDto.serviceId || null
            }
        });

        if (existingReview) {
            throw new BadRequestException('Ya has dejado una reseña para este proveedor/servicio');
        }

        // Crear la reseña
        const review = await this.prisma.review.create({
            data: {
                ...createReviewDto,
                status: createReviewDto.status || ReviewStatus.PENDING
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        // Actualizar estadísticas del proveedor
        await this.updateProviderStats(createReviewDto.providerId);

        return this.mapToResponseDto(review);
    }

    /**
     * Obtener todas las reseñas con filtros y paginación
     */
    async findAll(queryDto: QueryReviewsDto): Promise<{
        reviews: ReviewResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = queryDto;
        const skip = (page - 1) * limit;

        // Construir filtros
        const where: any = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.providerId) where.providerId = filters.providerId;
        if (filters.serviceId) where.serviceId = filters.serviceId;
        if (filters.status) where.status = filters.status;

        // Filtros de calificación
        if (filters.minRating || filters.maxRating) {
            where.rating = {};
            if (filters.minRating) where.rating.gte = filters.minRating;
            if (filters.maxRating) where.rating.lte = filters.maxRating;
        }

        // Filtros de fecha
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        // Construir include
        const include: any = {};
        if (filters.includeUser) {
            include.user = {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            };
        }
        if (filters.includeProvider) {
            include.provider = {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    logo: true
                }
            };
        }
        if (filters.includeService) {
            include.service = {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    type: true
                }
            };
        }

        // Ejecutar consultas
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                include,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            this.prisma.review.count({ where })
        ]);

        return {
            reviews: reviews.map(review => this.mapToResponseDto(review)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Obtener una reseña por ID
     */
    async findOne(id: string): Promise<ReviewResponseDto> {
        const review = await this.prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        if (!review) {
            throw new NotFoundException('Reseña no encontrada');
        }

        return this.mapToResponseDto(review);
    }

    /**
     * Actualizar una reseña
     */
    async update(id: string, updateReviewDto: UpdateReviewDto, userId?: string): Promise<ReviewResponseDto> {
        const review = await this.prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Reseña no encontrada');
        }

        // Verificar permisos (solo el autor o admin puede editar)
        if (userId && review.userId !== userId) {
            throw new ForbiddenException('No tienes permisos para editar esta reseña');
        }

        // Verificar que no se esté editando una reseña ya publicada
        if (review.status === ReviewStatus.APPROVED && review.publishedAt) {
            throw new BadRequestException('No se puede editar una reseña ya publicada');
        }

        const updatedReview = await this.prisma.review.update({
            where: { id },
            data: updateReviewDto,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        // Actualizar estadísticas del proveedor si cambió la calificación
        if (updateReviewDto.rating && updateReviewDto.rating !== review.rating) {
            await this.updateProviderStats(review.providerId);
        }

        return this.mapToResponseDto(updatedReview);
    }

    /**
     * Actualizar el estado de una reseña (solo admin)
     */
    async updateStatus(id: string, updateStatusDto: UpdateReviewStatusDto): Promise<ReviewResponseDto> {
        const review = await this.prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Reseña no encontrada');
        }

        const updateData: any = {
            status: updateStatusDto.status
        };

        // Si se aprueba la reseña, establecer fecha de publicación
        if (updateStatusDto.status === ReviewStatus.APPROVED) {
            updateData.publishedAt = updateStatusDto.publishedAt ? new Date(updateStatusDto.publishedAt) : new Date();
        }

        const updatedReview = await this.prisma.review.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        // Actualizar estadísticas del proveedor
        await this.updateProviderStats(review.providerId);

        return this.mapToResponseDto(updatedReview);
    }

    /**
     * Obtener reseñas por proveedor
     */
    async findByProvider(providerId: string, queryDto: ReviewsByProviderDto): Promise<{
        reviews: ReviewResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // Verificar que el proveedor existe
        const provider = await this.prisma.provider.findUnique({
            where: { id: providerId }
        });
        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        const queryWithProvider = { ...queryDto, providerId };
        return this.findAll(queryWithProvider);
    }

    /**
     * Obtener reseñas por usuario
     */
    async findByUser(userId: string, queryDto: ReviewsByUserDto): Promise<{
        reviews: ReviewResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const queryWithUser = { ...queryDto, userId };
        return this.findAll(queryWithUser);
    }

    /**
     * Eliminar una reseña (soft delete)
     */
    async remove(id: string, userId?: string): Promise<void> {
        const review = await this.prisma.review.findUnique({
            where: { id }
        });

        if (!review) {
            throw new NotFoundException('Reseña no encontrada');
        }

        // Verificar permisos (solo el autor o admin puede eliminar)
        if (userId && review.userId !== userId) {
            throw new ForbiddenException('No tienes permisos para eliminar esta reseña');
        }

        await this.prisma.review.delete({
            where: { id }
        });

        // Actualizar estadísticas del proveedor
        await this.updateProviderStats(review.providerId);
    }

    /**
     * Obtener estadísticas de reseñas
     */
    async getStats(): Promise<{
        totalReviews: number;
        approvedReviews: number;
        pendingReviews: number;
        rejectedReviews: number;
        averageRating: number;
        ratingDistribution: { rating: number; count: number }[];
    }> {
        const [
            totalReviews,
            approvedReviews,
            pendingReviews,
            rejectedReviews,
            ratingStats,
            ratingDistribution
        ] = await Promise.all([
            this.prisma.review.count(),
            this.prisma.review.count({ where: { status: ReviewStatus.APPROVED } }),
            this.prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
            this.prisma.review.count({ where: { status: ReviewStatus.REJECTED } }),
            this.prisma.review.aggregate({
                _avg: { rating: true },
                _count: { rating: true }
            }),
            this.prisma.review.groupBy({
                by: ['rating'],
                _count: { rating: true },
                orderBy: { rating: 'asc' }
            })
        ]);

        return {
            totalReviews,
            approvedReviews,
            pendingReviews,
            rejectedReviews,
            averageRating: ratingStats._avg.rating || 0,
            ratingDistribution: ratingDistribution.map(item => ({
                rating: item.rating,
                count: item._count.rating
            }))
        };
    }

    /**
     * Actualizar estadísticas del proveedor
     */
    private async updateProviderStats(providerId: string): Promise<void> {
        const stats = await this.prisma.review.aggregate({
            where: {
                providerId,
                status: ReviewStatus.APPROVED
            },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await this.prisma.provider.update({
            where: { id: providerId },
            data: {
                rating: stats._avg.rating || 0,
                reviewCount: stats._count.rating || 0
            }
        });
    }

    /**
     * Mapear entidad de Prisma a DTO de respuesta
     */
    private mapToResponseDto(review: any): ReviewResponseDto {
        return {
            id: review.id,
            userId: review.userId,
            providerId: review.providerId,
            serviceId: review.serviceId,
            status: review.status,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            serviceQuality: review.serviceQuality,
            cleanliness: review.cleanliness,
            valueForMoney: review.valueForMoney,
            staffFriendliness: review.staffFriendliness,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            publishedAt: review.publishedAt,
            user: review.user,
            provider: review.provider,
            service: review.service
        };
    }
}
