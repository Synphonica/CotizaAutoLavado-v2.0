import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFavoriteDto } from '../dto/create-favorite.dto';
import { QueryFavoritesDto } from '../dto/query-favorites.dto';
import { FavoritesByUserDto } from '../dto/favorites-by-user.dto';
import { FavoritesByProviderDto } from '../dto/favorites-by-provider.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Crear un nuevo favorito
   */
  async create(createFavoriteDto: CreateFavoriteDto): Promise<FavoriteResponseDto> {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: createFavoriteDto.userId }
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el proveedor existe
    const provider = await this.prisma.provider.findUnique({
      where: { id: createFavoriteDto.providerId }
    });
    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Verificar que el usuario no haya marcado ya este proveedor como favorito
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId: createFavoriteDto.userId,
        providerId: createFavoriteDto.providerId
      }
    });

    if (existingFavorite) {
      throw new BadRequestException('Este proveedor ya está en tus favoritos');
    }

    // Crear el favorito
    const favorite = await this.prisma.favorite.create({
      data: createFavoriteDto,
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
            businessName: true,
            businessType: true,
            address: true,
            city: true,
            region: true,
            phone: true,
            email: true,
            rating: true,
            reviewCount: true,
            status: true
          }
        }
      }
    });

    return this.mapToResponseDto(favorite);
  }

  /**
   * Obtener todos los favoritos con filtros y paginación
   */
  async findAll(queryDto: QueryFavoritesDto): Promise<{
    favorites: FavoriteResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy = 'addedAt', sortOrder = 'desc', ...filters } = queryDto;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.providerId) where.providerId = filters.providerId;

    // Filtros de fecha
    if (filters.startDate || filters.endDate) {
      where.addedAt = {};
      if (filters.startDate) where.addedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.addedAt.lte = new Date(filters.endDate);
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
          businessName: true,
          businessType: true,
          address: true,
          city: true,
          region: true,
          phone: true,
          email: true,
          rating: true,
          reviewCount: true,
          status: true
        }
      };
    }

    // Construir orderBy
    let orderBy: any = {};
    if (sortBy === 'businessName') {
      orderBy = { provider: { businessName: sortOrder } };
    } else if (sortBy === 'rating') {
      orderBy = { provider: { rating: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Ejecutar consultas
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.favorite.count({ where })
    ]);

    return {
      favorites: favorites.map(favorite => this.mapToResponseDto(favorite)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Obtener un favorito por ID
   */
  async findOne(id: string): Promise<FavoriteResponseDto> {
    const favorite = await this.prisma.favorite.findUnique({
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
            businessName: true,
            businessType: true,
            address: true,
            city: true,
            region: true,
            phone: true,
            email: true,
            rating: true,
            reviewCount: true,
            status: true
          }
        }
      }
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return this.mapToResponseDto(favorite);
  }

  /**
   * Verificar si un proveedor está en favoritos de un usuario
   */
  async isFavorite(userId: string, providerId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        providerId
      }
    });

    return !!favorite;
  }

  /**
   * Obtener favoritos por usuario
   */
  async findByUser(userId: string, queryDto: FavoritesByUserDto): Promise<{
    favorites: FavoriteResponseDto[];
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
   * Obtener favoritos por proveedor
   */
  async findByProvider(providerId: string, queryDto: FavoritesByProviderDto): Promise<{
    favorites: FavoriteResponseDto[];
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
   * Eliminar un favorito
   */
  async remove(id: string, userId?: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id }
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    // Verificar permisos (solo el autor puede eliminar)
    if (userId && favorite.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este favorito');
    }

    await this.prisma.favorite.delete({
      where: { id }
    });
  }

  /**
   * Eliminar favorito por usuario y proveedor
   */
  async removeByUserAndProvider(userId: string, providerId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        providerId
      }
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id }
    });
  }

  /**
   * Obtener estadísticas de favoritos
   */
  async getStats(): Promise<{
    totalFavorites: number;
    favoritesByUser: { userId: string; count: number }[];
    favoritesByProvider: { providerId: string; count: number }[];
    mostFavoritedProviders: { providerId: string; businessName: string; count: number }[];
  }> {
    const [
      totalFavorites,
      favoritesByUser,
      favoritesByProvider,
      mostFavoritedProviders
    ] = await Promise.all([
      this.prisma.favorite.count(),
      this.prisma.favorite.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      }),
      this.prisma.favorite.groupBy({
        by: ['providerId'],
        _count: { providerId: true },
        orderBy: { _count: { providerId: 'desc' } },
        take: 10
      }),
      this.prisma.favorite.groupBy({
        by: ['providerId'],
        _count: { providerId: true },
        orderBy: { _count: { providerId: 'desc' } },
        take: 5
      })
    ]);

    // Obtener información de los proveedores más favoritos
    const providerIds = mostFavoritedProviders.map(item => item.providerId);
    const providers = await this.prisma.provider.findMany({
      where: { id: { in: providerIds } },
      select: { id: true, businessName: true }
    });

    const mostFavoritedWithNames = mostFavoritedProviders.map(item => {
      const provider = providers.find(p => p.id === item.providerId);
      return {
        providerId: item.providerId,
        businessName: provider?.businessName || 'Proveedor no encontrado',
        count: item._count.providerId
      };
    });

    return {
      totalFavorites,
      favoritesByUser: favoritesByUser.map(item => ({
        userId: item.userId,
        count: item._count.userId
      })),
      favoritesByProvider: favoritesByProvider.map(item => ({
        providerId: item.providerId,
        count: item._count.providerId
      })),
      mostFavoritedProviders: mostFavoritedWithNames
    };
  }

  /**
   * Mapear entidad de Prisma a DTO de respuesta
   */
  private mapToResponseDto(favorite: any): FavoriteResponseDto {
    return {
      id: favorite.id,
      userId: favorite.userId,
      providerId: favorite.providerId,
      addedAt: favorite.addedAt,
      user: favorite.user,
      provider: favorite.provider
    };
  }
}
