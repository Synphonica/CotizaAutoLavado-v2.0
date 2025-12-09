import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderRequestDto } from './dto/create-provider-request.dto';
import { UpdateProviderRequestStatusDto } from './dto/update-provider-request-status.dto';
import { ProviderRequestStatus } from '@prisma/client';

@Injectable()
export class ProviderRequestsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear una nueva solicitud para convertirse en proveedor
     */
    async create(userId: string, createDto: CreateProviderRequestDto) {
        // Verificar si el usuario ya tiene una solicitud pendiente o aprobada
        const existingRequest = await this.prisma.providerRequest.findFirst({
            where: {
                userId,
                status: {
                    in: [ProviderRequestStatus.PENDING, ProviderRequestStatus.UNDER_REVIEW],
                },
            },
        });

        if (existingRequest) {
            throw new ConflictException(
                'Ya tienes una solicitud pendiente. Por favor espera la revisión.',
            );
        }

        // Verificar si el usuario ya es proveedor
        const existingProvider = await this.prisma.provider.findUnique({
            where: { userId },
        });

        if (existingProvider) {
            throw new ConflictException('Ya estás registrado como proveedor.');
        }

        // Crear la solicitud
        return this.prisma.providerRequest.create({
            data: {
                userId,
                ...createDto,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    /**
     * Obtener la solicitud del usuario actual
     */
    async getMyRequest(userId: string) {
        const request = await this.prisma.providerRequest.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return request;
    }

    /**
     * Obtener todas las solicitudes (solo para admins)
     */
    async findAll(status?: ProviderRequestStatus) {
        return this.prisma.providerRequest.findMany({
            where: status ? { status } : undefined,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Obtener una solicitud por ID (solo para admins)
     */
    async findOne(id: string) {
        const request = await this.prisma.providerRequest.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!request) {
            throw new NotFoundException('Solicitud no encontrada');
        }

        return request;
    }

    /**
     * Actualizar el estado de una solicitud (solo para admins)
     */
    async updateStatus(
        id: string,
        reviewerId: string,
        updateDto: UpdateProviderRequestStatusDto,
    ) {
        const request = await this.findOne(id);

        // Si se aprueba, crear el perfil de proveedor
        if (updateDto.status === ProviderRequestStatus.APPROVED) {
            // Verificar si ya existe un proveedor
            const existingProvider = await this.prisma.provider.findUnique({
                where: { userId: request.userId },
            });

            if (existingProvider) {
                throw new ConflictException('El usuario ya es proveedor');
            }

            // Crear proveedor y actualizar solicitud en una transacción
            return this.prisma.$transaction(async (tx) => {
                // Crear el perfil de proveedor
                await tx.provider.create({
                    data: {
                        userId: request.userId,
                        businessName: request.businessName,
                        businessType: request.businessType,
                        description: request.description || '',
                        phone: request.phone,
                        email: request.email,
                        address: request.address || '',
                        latitude: 0, // Debe ser actualizado por el proveedor
                        longitude: 0, // Debe ser actualizado por el proveedor
                        city: request.city,
                        region: request.region,
                        operatingHours: {},
                    },
                });

                // Actualizar la solicitud
                const updatedRequest = await tx.providerRequest.update({
                    where: { id },
                    data: {
                        status: updateDto.status,
                        reviewedBy: reviewerId,
                        reviewedAt: new Date(),
                        rejectionReason: updateDto.rejectionReason,
                        adminNotes: updateDto.adminNotes,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        reviewer: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                });

                // Actualizar el rol del usuario a PROVIDER
                await tx.user.update({
                    where: { id: request.userId },
                    data: { role: 'PROVIDER' },
                });

                return updatedRequest;
            });
        }

        // Si se rechaza o está bajo revisión, solo actualizar el estado
        return this.prisma.providerRequest.update({
            where: { id },
            data: {
                status: updateDto.status,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
                rejectionReason: updateDto.rejectionReason,
                adminNotes: updateDto.adminNotes,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    /**
     * Cancelar solicitud (solo el usuario que la creó)
     */
    async cancel(id: string, userId: string) {
        const request = await this.findOne(id);

        if (request.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para cancelar esta solicitud');
        }

        if (request.status !== ProviderRequestStatus.PENDING) {
            throw new ConflictException('Solo se pueden cancelar solicitudes pendientes');
        }

        return this.prisma.providerRequest.update({
            where: { id },
            data: { status: ProviderRequestStatus.REJECTED },
        });
    }
}
