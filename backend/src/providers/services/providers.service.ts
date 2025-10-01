import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { UpdateProviderDto } from '../dto/update-provider.dto';
import { QueryProvidersDto } from '../dto/query-providers.dto';
import { UpdateProviderStatusDto } from '../dto/update-provider-status.dto';
import { NearbyProvidersDto } from '../dto/nearby-providers.dto';
import { ProviderResponseDto, ProviderListResponseDto } from '../dto/provider-response.dto';
import { ProviderStatus } from '@prisma/client';

@Injectable()
export class ProvidersService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear un nuevo proveedor
     */
    async create(createProviderDto: CreateProviderDto, userId: string): Promise<ProviderResponseDto> {
        const {
            businessName,
            businessType,
            description,
            phone,
            email,
            website,
            address,
            latitude,
            longitude,
            city,
            region,
            postalCode,
            operatingHours,
            businessLicense,
            taxId,
            acceptsBookings,
            minAdvanceBooking,
            maxAdvanceBooking,
            status
        } = createProviderDto;

        // Verificar si el usuario ya tiene un proveedor
        const existingProvider = await this.prisma.provider.findUnique({
            where: { userId },
        });

        if (existingProvider) {
            throw new ConflictException('El usuario ya tiene un proveedor registrado');
        }

        // Verificar si el email ya está en uso
        const existingEmail = await this.prisma.provider.findFirst({
            where: { email },
        });

        if (existingEmail) {
            throw new ConflictException('El email ya está en uso por otro proveedor');
        }

        // Crear proveedor
        const provider = await this.prisma.provider.create({
            data: {
                userId,
                businessName,
                businessType,
                description,
                phone,
                email,
                website,
                address,
                latitude,
                longitude,
                city,
                region,
                postalCode,
                operatingHours: operatingHours as any,
                businessLicense,
                taxId,
                acceptsBookings,
                minAdvanceBooking,
                maxAdvanceBooking,
                status: status || ProviderStatus.PENDING_APPROVAL,
            },
        });

        return this.mapProviderToResponse(provider);
    }

    /**
     * Obtener todos los proveedores con filtros y paginación
     */
    async findAll(queryDto: QueryProvidersDto): Promise<ProviderListResponseDto> {
        const {
            search,
            status,
            city,
            region,
            latitude,
            longitude,
            radius,
            minRating,
            acceptsBookings,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryDto;

        // Construir filtros
        const where: any = {};

        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { businessType: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (region) {
            where.region = { contains: region, mode: 'insensitive' };
        }

        if (minRating) {
            where.rating = { gte: minRating };
        }

        if (acceptsBookings !== undefined) {
            where.acceptsBookings = acceptsBookings;
        }

        // Filtro geográfico
        if (latitude && longitude && radius) {
            // Calcular límites del rectángulo para optimizar la consulta
            const latRange = radius / 111000; // Aproximadamente 111km por grado
            const lngRange = radius / (111000 * Math.cos(latitude * Math.PI / 180));

            where.latitude = {
                gte: latitude - latRange,
                lte: latitude + latRange,
            };
            where.longitude = {
                gte: longitude - lngRange,
                lte: longitude + lngRange,
            };
        }

        // Calcular offset
        const skip = (page - 1) * limit;

        // Obtener proveedores y total
        const [providers, total] = await Promise.all([
            this.prisma.provider.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.provider.count({ where }),
        ]);

        // Filtrar por distancia si se especificó
        let filteredProviders = providers;
        if (latitude && longitude && radius) {
            filteredProviders = providers.filter(provider => {
                const distance = this.calculateDistance(
                    latitude,
                    longitude,
                    provider.latitude,
                    provider.longitude
                );
                return distance <= radius;
            });
        }

        return {
            providers: filteredProviders.map(provider => this.mapProviderToResponse(provider)),
            total: filteredProviders.length,
            page,
            limit,
            totalPages: Math.ceil(filteredProviders.length / limit),
        };
    }

    /**
     * Obtener proveedores cercanos
     */
    async findNearby(nearbyDto: NearbyProvidersDto): Promise<ProviderResponseDto[]> {
        const { latitude, longitude, radius = 5000, limit = 10 } = nearbyDto;

        // Obtener proveedores en un área amplia primero
        const latRange = radius / 111000;
        const lngRange = radius / (111000 * Math.cos(latitude * Math.PI / 180));

        const providers = await this.prisma.provider.findMany({
            where: {
                status: ProviderStatus.ACTIVE,
                latitude: {
                    gte: latitude - latRange,
                    lte: latitude + latRange,
                },
                longitude: {
                    gte: longitude - lngRange,
                    lte: longitude + lngRange,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        // Calcular distancias y filtrar
        const providersWithDistance = providers
            .map(provider => ({
                ...provider,
                distance: this.calculateDistance(
                    latitude,
                    longitude,
                    provider.latitude,
                    provider.longitude
                ),
            }))
            .filter(provider => provider.distance <= radius)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);

        return providersWithDistance.map(provider => this.mapProviderToResponse(provider));
    }

    /**
     * Obtener un proveedor por ID
     */
    async findOne(id: string): Promise<ProviderResponseDto> {
        const provider = await this.prisma.provider.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        return this.mapProviderToResponse(provider);
    }

    /**
     * Obtener proveedor por ID de usuario
     */
    async findByUserId(userId: string): Promise<ProviderResponseDto | null> {
        const provider = await this.prisma.provider.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return provider ? this.mapProviderToResponse(provider) : null;
    }

    /**
     * Actualizar un proveedor
     */
    async update(id: string, updateProviderDto: UpdateProviderDto): Promise<ProviderResponseDto> {
        const {
            businessName,
            businessType,
            description,
            phone,
            email,
            website,
            address,
            latitude,
            longitude,
            city,
            region,
            postalCode,
            operatingHours,
            businessLicense,
            taxId,
            acceptsBookings,
            minAdvanceBooking,
            maxAdvanceBooking
        } = updateProviderDto;

        // Verificar si el proveedor existe
        const existingProvider = await this.prisma.provider.findUnique({
            where: { id },
        });

        if (!existingProvider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        // Verificar si el email ya está en uso por otro proveedor
        if (email && email !== existingProvider.email) {
            const existingEmail = await this.prisma.provider.findFirst({
                where: {
                    email,
                    id: { not: id }
                },
            });

            if (existingEmail) {
                throw new ConflictException('El email ya está en uso por otro proveedor');
            }
        }

        // Actualizar proveedor
        const provider = await this.prisma.provider.update({
            where: { id },
            data: {
                businessName,
                businessType,
                description,
                phone,
                email,
                website,
                address,
                latitude,
                longitude,
                city,
                region,
                postalCode,
                operatingHours: operatingHours as any,
                businessLicense,
                taxId,
                acceptsBookings,
                minAdvanceBooking,
                maxAdvanceBooking,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return this.mapProviderToResponse(provider);
    }

    /**
     * Actualizar el estado de un proveedor
     */
    async updateStatus(id: string, updateStatusDto: UpdateProviderStatusDto): Promise<ProviderResponseDto> {
        const { status } = updateStatusDto;

        const provider = await this.prisma.provider.update({
            where: { id },
            data: {
                status,
                verifiedAt: status === ProviderStatus.VERIFIED ? new Date() : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });

        return this.mapProviderToResponse(provider);
    }

    /**
     * Eliminar un proveedor (soft delete)
     */
    async remove(id: string): Promise<{ message: string }> {
        const provider = await this.prisma.provider.findUnique({
            where: { id },
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        // Soft delete - cambiar estado a INACTIVE
        await this.prisma.provider.update({
            where: { id },
            data: { status: ProviderStatus.INACTIVE },
        });

        return { message: 'Proveedor eliminado exitosamente' };
    }

    /**
     * Eliminar un proveedor permanentemente
     */
    async permanentDelete(id: string): Promise<{ message: string }> {
        const provider = await this.prisma.provider.findUnique({
            where: { id },
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        await this.prisma.provider.delete({
            where: { id },
        });

        return { message: 'Proveedor eliminado permanentemente' };
    }

    /**
     * Obtener estadísticas de proveedores
     */
    async getStats(): Promise<any> {
        const [total, active, inactive, pending, verified] = await Promise.all([
            this.prisma.provider.count(),
            this.prisma.provider.count({ where: { status: ProviderStatus.ACTIVE } }),
            this.prisma.provider.count({ where: { status: ProviderStatus.INACTIVE } }),
            this.prisma.provider.count({ where: { status: ProviderStatus.PENDING_APPROVAL } }),
            this.prisma.provider.count({ where: { status: ProviderStatus.VERIFIED } }),
        ]);

        return {
            total,
            byStatus: {
                active,
                inactive,
                pending,
                verified,
            },
        };
    }

    /**
     * Calcular distancia entre dos puntos geográficos (fórmula de Haversine)
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Radio de la Tierra en metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distancia en metros
    }

    /**
     * Mapear proveedor de Prisma a DTO de respuesta
     */
    private mapProviderToResponse(provider: any): ProviderResponseDto {
        return {
            id: provider.id,
            userId: provider.userId,
            businessName: provider.businessName,
            businessType: provider.businessType,
            description: provider.description,
            phone: provider.phone,
            email: provider.email,
            website: provider.website,
            address: provider.address,
            latitude: provider.latitude,
            longitude: provider.longitude,
            city: provider.city,
            region: provider.region,
            postalCode: provider.postalCode,
            operatingHours: provider.operatingHours,
            businessLicense: provider.businessLicense,
            taxId: provider.taxId,
            acceptsBookings: provider.acceptsBookings,
            minAdvanceBooking: provider.minAdvanceBooking,
            maxAdvanceBooking: provider.maxAdvanceBooking,
            rating: provider.rating,
            totalReviews: provider.totalReviews,
            totalBookings: provider.totalBookings,
            status: provider.status,
            createdAt: provider.createdAt,
            updatedAt: provider.updatedAt,
            verifiedAt: provider.verifiedAt,
        };
    }
}
