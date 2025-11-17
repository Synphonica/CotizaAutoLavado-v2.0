import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriceAlertDto, UpdatePriceAlertDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PriceAlertsService {
    private readonly logger = new Logger(PriceAlertsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear una nueva alerta de precio para un usuario
     */
    async create(userId: string, createPriceAlertDto: CreatePriceAlertDto) {
        const { serviceId, targetPrice, percentageOff, notifyEmail, notifyInApp } = createPriceAlertDto;

        // Verificar que el servicio existe
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: { provider: { select: { businessName: true } } },
        });

        if (!service) {
            throw new NotFoundException(`Servicio con ID ${serviceId} no encontrado`);
        }

        // Verificar que no exista ya una alerta para este servicio y usuario
        const existingAlert = await this.prisma.priceAlert.findUnique({
            where: {
                userId_serviceId: {
                    userId,
                    serviceId,
                },
            },
        });

        if (existingAlert) {
            throw new BadRequestException(
                'Ya tienes una alerta activa para este servicio. Puedes actualizarla o eliminarla.'
            );
        }

        // Validar que al menos uno de los criterios esté definido
        if (!targetPrice && !percentageOff) {
            throw new BadRequestException(
                'Debes especificar al menos un criterio: precio objetivo o porcentaje de descuento'
            );
        }

        // Crear la alerta
        const priceAlert = await this.prisma.priceAlert.create({
            data: {
                userId,
                serviceId,
                targetPrice: targetPrice ? new Decimal(targetPrice) : null,
                percentageOff,
                notifyEmail: notifyEmail ?? true,
                notifyInApp: notifyInApp ?? true,
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        provider: {
                            select: {
                                businessName: true,
                            },
                        },
                    },
                },
            },
        });

        this.logger.log(`Alerta de precio creada para usuario ${userId} en servicio ${serviceId}`);

        return priceAlert;
    }

    /**
     * Obtener todas las alertas de un usuario
     */
    async findAllByUser(userId: string) {
        const alerts = await this.prisma.priceAlert.findMany({
            where: { userId },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discountedPrice: true,
                        provider: {
                            select: {
                                id: true,
                                businessName: true,
                                city: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return alerts;
    }

    /**
     * Obtener todas las alertas activas (para el job scheduler)
     */
    async findAllActive() {
        return this.prisma.priceAlert.findMany({
            where: { isActive: true },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discountedPrice: true,
                        provider: {
                            select: {
                                businessName: true,
                                city: true,
                            },
                        },
                    },
                },
            },
        });
    }

    /**
     * Obtener una alerta específica
     */
    async findOne(id: string, userId: string) {
        const alert = await this.prisma.priceAlert.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discountedPrice: true,
                        provider: {
                            select: {
                                businessName: true,
                                city: true,
                            },
                        },
                    },
                },
            },
        });

        if (!alert) {
            throw new NotFoundException(`Alerta con ID ${id} no encontrada`);
        }

        return alert;
    }

    /**
     * Actualizar una alerta
     */
    async update(id: string, userId: string, updatePriceAlertDto: UpdatePriceAlertDto) {
        // Verificar que la alerta existe y pertenece al usuario
        await this.findOne(id, userId);

        const updatedAlert = await this.prisma.priceAlert.update({
            where: { id },
            data: {
                ...updatePriceAlertDto,
                targetPrice: updatePriceAlertDto.targetPrice
                    ? new Decimal(updatePriceAlertDto.targetPrice)
                    : undefined,
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        provider: {
                            select: {
                                businessName: true,
                            },
                        },
                    },
                },
            },
        });

        this.logger.log(`Alerta ${id} actualizada por usuario ${userId}`);

        return updatedAlert;
    }

    /**
     * Eliminar una alerta
     */
    async remove(id: string, userId: string) {
        // Verificar que la alerta existe y pertenece al usuario
        await this.findOne(id, userId);

        await this.prisma.priceAlert.delete({
            where: { id },
        });

        this.logger.log(`Alerta ${id} eliminada por usuario ${userId}`);

        return { message: 'Alerta eliminada exitosamente' };
    }

    /**
     * Registrar precio en el historial
     */
    async recordPriceHistory(serviceId: string, currentPrice: Decimal) {
        // Obtener el último registro de precio
        const lastRecord = await this.prisma.priceHistory.findFirst({
            where: { serviceId },
            orderBy: { recordedAt: 'desc' },
        });

        let changeType = 'no_change';
        let oldPrice: Decimal | null = null;

        if (lastRecord && lastRecord.price) {
            oldPrice = lastRecord.price;
            if (currentPrice.lt(oldPrice)) {
                changeType = 'decrease';
            } else if (currentPrice.gt(oldPrice)) {
                changeType = 'increase';
            }
        }

        // Crear nuevo registro
        const record = await this.prisma.priceHistory.create({
            data: {
                serviceId,
                price: currentPrice,
                oldPrice,
                changeType,
            },
        });

        return record;
    }

    /**
     * Obtener historial de precios de un servicio
     */
    async getPriceHistory(serviceId: string, limit: number = 30) {
        return this.prisma.priceHistory.findMany({
            where: { serviceId },
            orderBy: { recordedAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Marcar alerta como notificada
     */
    async markAsNotified(alertId: string) {
        return this.prisma.priceAlert.update({
            where: { id: alertId },
            data: {
                lastNotifiedAt: new Date(),
                triggeredCount: {
                    increment: 1,
                },
            },
        });
    }
}
