import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { QueryServicesDto } from '../dto/query-services.dto';
import { UpdateServiceStatusDto } from '../dto/update-service-status.dto';
import { ServicesByProviderDto } from '../dto/services-by-provider.dto';
import { ServiceResponseDto, ServiceListResponseDto } from '../dto/service-response.dto';
import { ServiceType, ServiceStatus } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Crear un nuevo servicio
   */
  async create(createServiceDto: CreateServiceDto, userId: string): Promise<ServiceResponseDto> {
    const {
      providerId,
      name,
      description,
      type,
      price,
      discountedPrice,
      duration,
      status,
      isAvailable = true,
      category,
      tags,
      imageUrl,
      additionalImages,
      includedServices,
      requirements,
      requiresAppointment = false,
      minAdvanceBooking,
      maxAdvanceBooking,
      maxCapacity = 1,
      isFeatured = false,
      displayOrder = 0
    } = createServiceDto;

    // Verificar que el proveedor existe y pertenece al usuario
    const provider = await this.prisma.provider.findFirst({
      where: {
        id: providerId,
        userId: userId
      }
    });

    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado o no tienes permisos para crear servicios en este proveedor');
    }

    // Verificar que no existe un servicio con el mismo nombre para este proveedor
    const existingService = await this.prisma.service.findFirst({
      where: {
        providerId,
        name,
        deletedAt: null
      }
    });

    if (existingService) {
      throw new ConflictException('Ya existe un servicio con este nombre para este proveedor');
    }

    // Validar precios
    if (discountedPrice && discountedPrice >= price) {
      throw new BadRequestException('El precio con descuento debe ser menor al precio normal');
    }

    // Crear servicio
    const service = await this.prisma.service.create({
      data: {
        providerId,
        name,
        description,
        type,
        price,
        discountedPrice,
        duration,
        status: status || ServiceStatus.ACTIVE,
        isAvailable,
        category,
        tags: tags as any,
        imageUrl,
        additionalImages: additionalImages as any,
        includedServices: includedServices as any,
        requirements,
        requiresAppointment,
        minAdvanceBooking,
        maxAdvanceBooking,
        maxCapacity,
        isFeatured,
        displayOrder
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            region: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    });

    return this.mapServiceToResponse(service);
  }

  /**
   * Obtener todos los servicios con filtros
   */
  async findAll(queryDto: QueryServicesDto): Promise<ServiceListResponseDto> {
    const {
      search,
      type,
      status,
      category,
      minPrice,
      maxPrice,
      providerId,
      isAvailable,
      isFeatured,
      minDuration,
      maxDuration,
      tag,
      city,
      region,
      minProviderRating,
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'asc'
    } = queryDto;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      deletedAt: null
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (category) where.category = category;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minDuration !== undefined || maxDuration !== undefined) {
      where.duration = {};
      if (minDuration !== undefined) where.duration.gte = minDuration;
      if (maxDuration !== undefined) where.duration.lte = maxDuration;
    }

    if (tag) {
      where.tags = {
        has: tag
      };
    }

    if (providerId) {
      where.providerId = providerId;
    }

    // Filtros del proveedor
    if (city || region || minProviderRating !== undefined) {
      where.provider = {};
      if (city) where.provider.city = city;
      if (region) where.provider.region = region;
      if (minProviderRating !== undefined) {
        where.provider.rating = { gte: minProviderRating };
      }
    }

    // Ordenamiento
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Obtener servicios
    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              businessType: true,
              city: true,
              region: true,
              rating: true,
              reviewCount: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.service.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      services: services.map(service => this.mapServiceToResponse(service)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        search,
        type,
        status,
        category,
        minPrice,
        maxPrice,
        providerId,
        isAvailable,
        isFeatured
      }
    };
  }

  /**
   * Obtener un servicio por ID
   */
  async findOne(id: string): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            region: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return this.mapServiceToResponse(service);
  }

  /**
   * Obtener servicios por proveedor
   */
  async findByProvider(providerId: string, queryDto: ServicesByProviderDto): Promise<ServiceListResponseDto> {
    const {
      type,
      status,
      isAvailable,
      isFeatured,
      category,
      page = 1,
      limit = 10,
      sortBy = 'displayOrder',
      sortOrder = 'asc'
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: any = {
      providerId,
      deletedAt: null
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (category) where.category = category;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              businessType: true,
              city: true,
              region: true,
              rating: true,
              reviewCount: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.service.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      services: services.map(service => this.mapServiceToResponse(service)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Actualizar un servicio
   */
  async update(id: string, updateServiceDto: UpdateServiceDto, userId?: string): Promise<ServiceResponseDto> {
    // Verificar que el servicio existe
    const existingService = await this.prisma.service.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        provider: true
      }
    });

    if (!existingService) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Si se proporciona userId, verificar permisos
    if (userId && existingService.provider.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este servicio');
    }

    const {
      name,
      description,
      type,
      price,
      discountedPrice,
      duration,
      status,
      isAvailable,
      category,
      tags,
      imageUrl,
      additionalImages,
      includedServices,
      requirements,
      requiresAppointment,
      minAdvanceBooking,
      maxAdvanceBooking,
      maxCapacity,
      isFeatured,
      displayOrder
    } = updateServiceDto;

    // Verificar nombre único si se está actualizando
    if (name && name !== existingService.name) {
      const duplicateService = await this.prisma.service.findFirst({
        where: {
          providerId: existingService.providerId,
          name,
          deletedAt: null,
          id: { not: id }
        }
      });

      if (duplicateService) {
        throw new ConflictException('Ya existe un servicio con este nombre para este proveedor');
      }
    }

    // Validar precios
    const finalPrice = price !== undefined ? price : existingService.price;
    const finalDiscountedPrice = discountedPrice !== undefined ? discountedPrice : existingService.discountedPrice;

    if (finalDiscountedPrice && finalDiscountedPrice >= finalPrice) {
      throw new BadRequestException('El precio con descuento debe ser menor al precio normal');
    }

    // Actualizar servicio
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        type,
        price,
        discountedPrice,
        duration,
        status,
        isAvailable,
        category,
        tags: tags as any,
        imageUrl,
        additionalImages: additionalImages as any,
        includedServices: includedServices as any,
        requirements,
        requiresAppointment,
        minAdvanceBooking,
        maxAdvanceBooking,
        maxCapacity,
        isFeatured,
        displayOrder
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            region: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    });

    return this.mapServiceToResponse(service);
  }

  /**
   * Actualizar estado de un servicio
   */
  async updateStatus(id: string, updateStatusDto: UpdateServiceStatusDto): Promise<ServiceResponseDto> {
    const service = await this.prisma.service.update({
      where: { id },
      data: {
        status: updateStatusDto.status
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessType: true,
            city: true,
            region: true,
            rating: true,
            reviewCount: true
          }
        }
      }
    });

    return this.mapServiceToResponse(service);
  }

  /**
   * Eliminar un servicio (soft delete)
   */
  async remove(id: string, userId?: string): Promise<{ message: string }> {
    // Verificar que el servicio existe
    const existingService = await this.prisma.service.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        provider: true
      }
    });

    if (!existingService) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Si se proporciona userId, verificar permisos
    if (userId && existingService.provider.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este servicio');
    }

    await this.prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: 'Servicio eliminado exitosamente' };
  }

  /**
   * Eliminar servicio permanentemente
   */
  async permanentDelete(id: string): Promise<{ message: string }> {
    await this.prisma.service.delete({
      where: { id }
    });

    return { message: 'Servicio eliminado permanentemente' };
  }

  /**
   * Obtener estadísticas de servicios
   */
  async getStats(): Promise<any> {
    const [
      totalServices,
      activeServices,
      inactiveServices,
      pendingServices,
      servicesByType,
      averagePrice,
      totalRevenue
    ] = await Promise.all([
      this.prisma.service.count({
        where: { deletedAt: null }
      }),
      this.prisma.service.count({
        where: { status: ServiceStatus.ACTIVE, deletedAt: null }
      }),
      this.prisma.service.count({
        where: { status: ServiceStatus.INACTIVE, deletedAt: null }
      }),
      this.prisma.service.count({
        where: { status: ServiceStatus.PENDING_APPROVAL, deletedAt: null }
      }),
      this.prisma.service.groupBy({
        by: ['type'],
        where: { deletedAt: null },
        _count: { type: true }
      }),
      this.prisma.service.aggregate({
        where: { deletedAt: null },
        _avg: { price: true }
      }),
      this.prisma.service.aggregate({
        where: { deletedAt: null },
        _sum: { price: true }
      })
    ]);

    return {
      total: totalServices,
      byStatus: {
        active: activeServices,
        inactive: inactiveServices,
        pending: pendingServices
      },
      byType: servicesByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      averagePrice: averagePrice._avg.price || 0,
      totalRevenue: totalRevenue._sum.price || 0
    };
  }

  /**
   * Mapear servicio a DTO de respuesta
   */
  private mapServiceToResponse(service: any): ServiceResponseDto {
    return {
      id: service.id,
      providerId: service.providerId,
      name: service.name,
      description: service.description,
      type: service.type,
      price: service.price,
      discountedPrice: service.discountedPrice,
      duration: service.duration,
      status: service.status,
      isAvailable: service.isAvailable,
      category: service.category,
      tags: service.tags,
      imageUrl: service.imageUrl,
      additionalImages: service.additionalImages,
      includedServices: service.includedServices,
      requirements: service.requirements,
      requiresAppointment: service.requiresAppointment,
      minAdvanceBooking: service.minAdvanceBooking,
      maxAdvanceBooking: service.maxAdvanceBooking,
      maxCapacity: service.maxCapacity,
      isFeatured: service.isFeatured,
      displayOrder: service.displayOrder,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      deletedAt: service.deletedAt,
      provider: service.provider
    };
  }
}
