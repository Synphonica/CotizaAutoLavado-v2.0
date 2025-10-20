'use client';

import React from 'react';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Car,
    CreditCard,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Edit,
    Trash2,
} from 'lucide-react';
import {
    Booking,
    BookingStatus,
    BookingStatusLabels,
    BookingStatusColors,
    PaymentStatus,
    PaymentStatusLabels,
    PaymentMethodLabels,
} from '@/types/booking';

interface BookingCardProps {
    booking: Booking;
    onCancel?: (bookingId: string) => void;
    onReschedule?: (bookingId: string) => void;
    onDelete?: (bookingId: string) => void;
    showActions?: boolean;
    compact?: boolean;
}

export default function BookingCard({
    booking,
    onCancel,
    onReschedule,
    onDelete,
    showActions = true,
    compact = false,
}: BookingCardProps) {
    const [showMenu, setShowMenu] = React.useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusIcon = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
            case BookingStatus.COMPLETED:
                return <CheckCircle className="w-5 h-5" />;
            case BookingStatus.CANCELLED:
            case BookingStatus.REJECTED:
            case BookingStatus.NO_SHOW:
                return <XCircle className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getStatusColorClasses = (status: BookingStatus) => {
        const colors = BookingStatusColors[status];
        return `${colors.bg} ${colors.text} ${colors.border}`;
    };

    const canCancel = [
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
    ].includes(booking.status);

    const canReschedule = [
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
    ].includes(booking.status);

    if (compact) {
        return (
            <Link href={`/booking/${booking.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{booking.serviceName}</h4>
                            <p className="text-sm text-gray-600">{booking.provider?.name || 'Proveedor'}</p>
                        </div>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColorClasses(
                                booking.status
                            )}`}
                        >
                            {BookingStatusLabels[booking.status]}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.bookingDate).toLocaleDateString('es-CL')}
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(booking.startTime)}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold mb-1">{booking.serviceName}</h3>
                        <p className="text-blue-100 text-sm">
                            Reserva #{booking.id.slice(0, 8)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border-2 flex items-center gap-1 ${getStatusColorClasses(
                                booking.status
                            )}`}
                        >
                            {getStatusIcon(booking.status)}
                            {BookingStatusLabels[booking.status]}
                        </span>
                        {showActions && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                        {canReschedule && onReschedule && (
                                            <button
                                                onClick={() => {
                                                    onReschedule(booking.id);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Reagendar
                                            </button>
                                        )}
                                        {canCancel && onCancel && (
                                            <button
                                                onClick={() => {
                                                    onCancel(booking.id);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Cancelar
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => {
                                                    onDelete(booking.id);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Fecha y Hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fecha</p>
                            <p className="font-semibold text-gray-900">
                                {formatDate(booking.bookingDate)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Horario</p>
                            <p className="font-semibold text-gray-900">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                            <p className="text-xs text-gray-500">{booking.serviceDuration} minutos</p>
                        </div>
                    </div>
                </div>

                {/* Proveedor */}
                {booking.provider && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Proveedor</p>
                            <p className="font-semibold text-gray-900">{booking.provider.name}</p>
                            {booking.provider.address && (
                                <p className="text-sm text-gray-600">{booking.provider.address}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Cliente */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Cliente</p>
                        <p className="font-semibold text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                        <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                    </div>
                </div>

                {/* Vehículo */}
                {booking.vehicleInfo && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Car className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Vehículo</p>
                            <p className="font-semibold text-gray-900">
                                {booking.vehicleInfo.brand} {booking.vehicleInfo.model}{' '}
                                {booking.vehicleInfo.year}
                            </p>
                            {booking.vehicleInfo.plate && (
                                <p className="text-sm text-gray-600">
                                    Patente: {booking.vehicleInfo.plate}
                                </p>
                            )}
                            {booking.vehicleInfo.color && (
                                <p className="text-sm text-gray-600">
                                    Color: {booking.vehicleInfo.color}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Pago */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">Pago</p>
                        <p className="font-semibold text-gray-900">
                            ${booking.totalPrice.toLocaleString('es-CL')} {booking.currency}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">
                                {booking.paymentMethod ? PaymentMethodLabels[booking.paymentMethod] : 'No especificado'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span
                                className={`text-sm font-medium ${booking.paymentStatus === PaymentStatus.PAID
                                        ? 'text-green-600'
                                        : booking.paymentStatus === PaymentStatus.FAILED
                                            ? 'text-red-600'
                                            : 'text-yellow-600'
                                    }`}
                            >
                                {PaymentStatusLabels[booking.paymentStatus]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notas */}
                {booking.customerNotes && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Notas del Cliente</p>
                            <p className="text-sm text-gray-900 mt-1">{booking.customerNotes}</p>
                        </div>
                    </div>
                )}

                {booking.providerNotes && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Notas del Proveedor</p>
                            <p className="text-sm text-gray-900 mt-1">{booking.providerNotes}</p>
                        </div>
                    </div>
                )}

                {booking.cancellationReason && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-900">Razón de Cancelación</p>
                            <p className="text-sm text-red-700 mt-1">{booking.cancellationReason}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                <div>
                    Creada: {new Date(booking.createdAt).toLocaleDateString('es-CL')}
                </div>
                <Link
                    href={`/booking/${booking.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Ver Detalles →
                </Link>
            </div>
        </div>
    );
}
