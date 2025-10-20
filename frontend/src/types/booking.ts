export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
    NO_SHOW = 'NO_SHOW',
    RESCHEDULED = 'RESCHEDULED',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    REFUNDED = 'REFUNDED',
    FAILED = 'FAILED',
}

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    TRANSFER = 'TRANSFER',
    ONLINE_PAYMENT = 'ONLINE_PAYMENT',
}

export interface VehicleInfo {
    brand?: string;
    model?: string;
    year?: number;
    plate?: string;
    color?: string;
    type?: string; // sedan, suv, truck, etc.
}

export interface Booking {
    id: string;
    userId: string;
    providerId: string;
    serviceId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    totalPrice: number;
    currency: string;

    // Información del cliente
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleInfo?: VehicleInfo;

    // Detalles del servicio
    serviceName: string;
    serviceDuration: number;

    // Pago
    paymentStatus: PaymentStatus;
    paymentMethod?: PaymentMethod;
    paidAmount?: number;
    transactionId?: string;

    // Notas
    customerNotes?: string;
    providerNotes?: string;
    cancellationReason?: string;

    // Timestamps
    confirmedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;

    // Recordatorios
    reminderSent: boolean;
    reminderSentAt?: string;

    // Relaciones opcionales (pobladas por el backend cuando se incluyen)
    provider?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CreateBookingData {
    userId: string;
    providerId: string;
    serviceId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    vehicleInfo?: VehicleInfo;
    serviceName: string;
    serviceDuration: number;
    totalPrice: number;
    currency?: string;
    paymentMethod?: PaymentMethod;
    customerNotes?: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    available: boolean;
}

export interface AvailabilityResponse {
    available: boolean;
    slots: TimeSlot[];
    message: string;
}

export interface BookingStats {
    total: number;
    confirmed: number;
    pending: number;
    completed: number;
    cancelled: number;
    noShow: number;
}

export interface BookingFilters {
    userId?: string;
    providerId?: string;
    serviceId?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    startDate?: string;
    endDate?: string;
}

export interface RescheduleData {
    newBookingDate: string;
    newStartTime: string;
    newEndTime: string;
    reason?: string;
}

// Mapeo de estados a español
export const BookingStatusLabels: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Pendiente',
    [BookingStatus.CONFIRMED]: 'Confirmada',
    [BookingStatus.IN_PROGRESS]: 'En Progreso',
    [BookingStatus.COMPLETED]: 'Completada',
    [BookingStatus.CANCELLED]: 'Cancelada',
    [BookingStatus.REJECTED]: 'Rechazada',
    [BookingStatus.NO_SHOW]: 'No Presentado',
    [BookingStatus.RESCHEDULED]: 'Reagendada',
};

// Mapeo de estados de pago a español
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'Pendiente',
    [PaymentStatus.PAID]: 'Pagado',
    [PaymentStatus.PARTIALLY_PAID]: 'Pago Parcial',
    [PaymentStatus.REFUNDED]: 'Reembolsado',
    [PaymentStatus.FAILED]: 'Fallido',
};

// Mapeo de métodos de pago a español
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: 'Efectivo',
    [PaymentMethod.CREDIT_CARD]: 'Tarjeta de Crédito',
    [PaymentMethod.DEBIT_CARD]: 'Tarjeta de Débito',
    [PaymentMethod.TRANSFER]: 'Transferencia',
    [PaymentMethod.ONLINE_PAYMENT]: 'Pago Online',
};

// Colores para estados
export const BookingStatusColors: Record<BookingStatus, { bg: string; text: string; border: string }> = {
    [BookingStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    [BookingStatus.CONFIRMED]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    [BookingStatus.IN_PROGRESS]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    [BookingStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    [BookingStatus.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    [BookingStatus.REJECTED]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
    [BookingStatus.NO_SHOW]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    [BookingStatus.RESCHEDULED]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
};
