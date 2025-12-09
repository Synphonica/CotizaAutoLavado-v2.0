import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { FilterBookingDto } from './dto/filter-booking.dto';
import { CheckAvailabilityDto, RescheduleBookingDto } from './dto/booking-actions.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear una nueva reserva
     */
    async create(createBookingDto: CreateBookingDto) {
        // Validar que el proveedor existe y está activo
        const provider = await this.prisma.provider.findUnique({
            where: { id: createBookingDto.providerId },
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        // Verificar que el proveedor está verificado o activo Y acepta bookings
        if (provider.status !== 'VERIFIED' && provider.status !== 'ACTIVE') {
            throw new BadRequestException('El proveedor no está activo o verificado');
        }

        if (!provider.acceptsBookings) {
            throw new BadRequestException('El proveedor no acepta reservas en este momento');
        }

        // Validar que el servicio existe
        const service = await this.prisma.service.findUnique({
            where: { id: createBookingDto.serviceId },
        });

        if (!service) {
            throw new NotFoundException('Servicio no encontrado');
        }

        if (!service.isAvailable) {
            throw new BadRequestException('El servicio no está disponible');
        }

        // Verificar disponibilidad horaria
        const isAvailable = await this.checkTimeSlotAvailability(
            createBookingDto.providerId,
            new Date(createBookingDto.startTime),
            new Date(createBookingDto.endTime),
        );

        if (!isAvailable) {
            throw new ConflictException('El horario seleccionado no está disponible');
        }

        // Crear la reserva
        const booking = await this.prisma.booking.create({
            data: {
                userId: createBookingDto.userId,
                providerId: createBookingDto.providerId,
                serviceId: createBookingDto.serviceId,
                bookingDate: new Date(createBookingDto.bookingDate),
                startTime: new Date(createBookingDto.startTime),
                endTime: new Date(createBookingDto.endTime),
                customerName: createBookingDto.customerName,
                customerPhone: createBookingDto.customerPhone,
                customerEmail: createBookingDto.customerEmail,
                vehicleInfo: createBookingDto.vehicleInfo as any,
                serviceName: createBookingDto.serviceName,
                serviceDuration: createBookingDto.serviceDuration,
                totalPrice: createBookingDto.totalPrice,
                currency: createBookingDto.currency || 'CLP',
                customerNotes: createBookingDto.customerNotes,
                status: 'PENDING',
            },
        });

        // Aquí podrías enviar una notificación al proveedor
        // await this.notificationService.sendBookingNotification(booking);

        return booking;
    }

    /**
     * Obtener todas las reservas con filtros opcionales
     */
    async findAll(filters: FilterBookingDto) {
        const where: any = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.providerId) where.providerId = filters.providerId;
        if (filters.serviceId) where.serviceId = filters.serviceId;
        if (filters.status) where.status = filters.status;
        if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

        if (filters.startDate || filters.endDate) {
            where.bookingDate = {};
            if (filters.startDate) where.bookingDate.gte = new Date(filters.startDate);
            if (filters.endDate) where.bookingDate.lte = new Date(filters.endDate);
        }

        const bookings = await this.prisma.booking.findMany({
            where,
            include: {
                user: filters.userId ? {
                    select: {
                        id: true,
                        clerkId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                } : false,
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        duration: true,
                        type: true,
                    },
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        phone: true,
                        email: true,
                        address: true,
                        city: true,
                        region: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
            orderBy: { bookingDate: 'desc' },
        });

        return { bookings };
    }

    /**
     * Obtener una reserva por ID
     */
    async findOne(id: string) {
        // Primero obtenemos la reserva para verificar si tiene userId
        const bookingCheck = await this.prisma.booking.findUnique({
            where: { id },
            select: { userId: true },
        });

        if (!bookingCheck) {
            throw new NotFoundException('Reserva no encontrada');
        }

        // Construir el include dinámicamente
        const includeConfig: any = {
            service: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    duration: true,
                    type: true,
                },
            },
            provider: {
                select: {
                    id: true,
                    businessName: true,
                    phone: true,
                    email: true,
                    address: true,
                    city: true,
                    region: true,
                    latitude: true,
                    longitude: true,
                },
            },
        };

        // Solo incluir user si existe userId
        if (bookingCheck.userId) {
            includeConfig.user = true;
        }

        // Hacer el query completo con include condicional de user
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: includeConfig,
        });

        if (!booking) {
            throw new NotFoundException('Reserva no encontrada');
        }

        return booking;
    }

    /**
     * Actualizar una reserva
     */
    async update(id: string, updateBookingDto: UpdateBookingDto) {
        await this.findOne(id); // Verifica que existe

        const updateData: any = { ...updateBookingDto };

        // Si se está cambiando el estado a CONFIRMED
        if (updateBookingDto.status === BookingStatus.CONFIRMED && !updateData.confirmedAt) {
            updateData.confirmedAt = new Date();
        }

        // Si se está cambiando el estado a COMPLETED
        if (updateBookingDto.status === BookingStatus.COMPLETED && !updateData.completedAt) {
            updateData.completedAt = new Date();
        }

        // Si se está cambiando el estado a CANCELLED
        if (updateBookingDto.status === BookingStatus.CANCELLED && !updateData.cancelledAt) {
            updateData.cancelledAt = new Date();
        }

        return this.prisma.booking.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Cancelar una reserva
     */
    async cancel(id: string, reason?: string) {
        const booking = await this.findOne(id);

        // Verificar que la reserva puede ser cancelada
        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('No se puede cancelar una reserva completada');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('La reserva ya está cancelada');
        }

        return this.update(id, {
            status: BookingStatus.CANCELLED,
            cancellationReason: reason,
        });
    }

    /**
     * Reagendar una reserva
     */
    async reschedule(id: string, rescheduleDto: RescheduleBookingDto) {
        const booking = await this.findOne(id);

        // Verificar que la reserva puede ser reagendada
        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('No se puede reagendar una reserva completada');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('No se puede reagendar una reserva cancelada');
        }

        // Verificar disponibilidad del nuevo horario
        const isAvailable = await this.checkTimeSlotAvailability(
            booking.providerId,
            new Date(rescheduleDto.newStartTime),
            new Date(rescheduleDto.newEndTime),
            id, // Excluir la reserva actual de la verificación
        );

        if (!isAvailable) {
            throw new ConflictException('El nuevo horario seleccionado no está disponible');
        }

        return this.prisma.booking.update({
            where: { id },
            data: {
                bookingDate: new Date(rescheduleDto.newBookingDate),
                startTime: new Date(rescheduleDto.newStartTime),
                endTime: new Date(rescheduleDto.newEndTime),
                status: BookingStatus.RESCHEDULED,
                providerNotes: rescheduleDto.reason
                    ? `Reagendada: ${rescheduleDto.reason}`
                    : booking.providerNotes,
            },
        });
    }

    /**
     * Verificar disponibilidad de horarios
     */
    async checkAvailability(checkDto: CheckAvailabilityDto) {
        const date = new Date(checkDto.date);
        const dayOfWeek = date.getDay();

        // Obtener franjas horarias del proveedor para ese día
        const timeSlots = await this.prisma.timeSlot.findMany({
            where: {
                providerId: checkDto.providerId,
                dayOfWeek,
                isAvailable: true,
            },
        });

        if (timeSlots.length === 0) {
            return { available: false, message: 'No hay horarios disponibles para este día', slots: [] };
        }

        // Obtener reservas existentes para ese día
        const existingBookings = await this.prisma.booking.findMany({
            where: {
                providerId: checkDto.providerId,
                bookingDate: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lte: new Date(date.setHours(23, 59, 59, 999)),
                },
                status: {
                    notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
                },
            },
        });

        // Generar slots de 30 minutos disponibles
        const availableSlots = this.generateAvailableSlots(timeSlots, existingBookings, date);

        return {
            available: availableSlots.length > 0,
            slots: availableSlots,
            message: availableSlots.length > 0 ? 'Horarios disponibles' : 'No hay horarios disponibles',
        };
    }

    /**
     * Verificar si un rango horario específico está disponible
     */
    private async checkTimeSlotAvailability(
        providerId: string,
        startTime: Date,
        endTime: Date,
        excludeBookingId?: string,
    ): Promise<boolean> {
        const where: any = {
            providerId,
            status: {
                notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
            },
            OR: [
                {
                    // La reserva existente empieza durante el nuevo rango
                    startTime: {
                        gte: startTime,
                        lt: endTime,
                    },
                },
                {
                    // La reserva existente termina durante el nuevo rango
                    endTime: {
                        gt: startTime,
                        lte: endTime,
                    },
                },
                {
                    // La reserva existente engloba el nuevo rango
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gte: endTime } },
                    ],
                },
            ],
        };

        if (excludeBookingId) {
            where.id = { not: excludeBookingId };
        }

        const conflictingBookings = await this.prisma.booking.findMany({ where });

        return conflictingBookings.length === 0;
    }

    /**
     * Generar slots disponibles de 30 minutos
     */
    private generateAvailableSlots(timeSlots: any[], existingBookings: any[], date: Date) {
        const slots: any[] = [];
        const slotDuration = 30; // minutos

        timeSlots.forEach((timeSlot) => {
            const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number);
            const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number);

            const slotStart = new Date(date);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEnd = new Date(date);
            slotEnd.setHours(endHour, endMinute, 0, 0);

            let currentTime = new Date(slotStart);

            while (currentTime < slotEnd) {
                const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);

                // Verificar si este slot está ocupado
                const isOccupied = existingBookings.some((booking) => {
                    return (
                        (currentTime >= booking.startTime && currentTime < booking.endTime) ||
                        (nextTime > booking.startTime && nextTime <= booking.endTime) ||
                        (currentTime <= booking.startTime && nextTime >= booking.endTime)
                    );
                });

                if (!isOccupied && nextTime <= slotEnd) {
                    slots.push({
                        startTime: currentTime.toISOString(),
                        endTime: nextTime.toISOString(),
                        available: true,
                    });
                }

                currentTime = nextTime;
            }
        });

        return slots;
    }

    /**
     * Obtener estadísticas de reservas
     */
    async getBookingStats(providerId: string, startDate?: string, endDate?: string) {
        const where: any = { providerId };

        if (startDate || endDate) {
            where.bookingDate = {};
            if (startDate) where.bookingDate.gte = new Date(startDate);
            if (endDate) where.bookingDate.lte = new Date(endDate);
        }

        const [total, confirmed, pending, completed, cancelled] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
            this.prisma.booking.count({ where: { ...where, status: BookingStatus.PENDING } }),
            this.prisma.booking.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
            this.prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
        ]);

        return {
            total,
            confirmed,
            pending,
            completed,
            cancelled,
            noShow: await this.prisma.booking.count({ where: { ...where, status: BookingStatus.NO_SHOW } }),
        };
    }

    /**
     * Eliminar una reserva (soft delete - cambiar estado)
     */
    async remove(id: string) {
        return this.cancel(id, 'Eliminada por el usuario');
    }

    /**
     * Obtener proveedor por userId (clerkId)
     */
    async getProviderByUserId(clerkId: string) {
        const user = await this.prisma.user.findUnique({
            where: { clerkId },
            include: { providerProfile: true },
        });
        return user?.providerProfile || null;
    }

    /**
     * Verificar que el proveedor sea dueño de la reserva
     */
    async verifyBookingOwnership(bookingId: string, providerId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
        });

        if (!booking) {
            throw new NotFoundException('Reserva no encontrada');
        }

        if (booking.providerId !== providerId) {
            throw new BadRequestException('No tienes permiso para modificar esta reserva');
        }

        return booking;
    }
}
