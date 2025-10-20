'use client';

import React, { useEffect, useState } from 'react';
import {
    Filter,
    Search,
    Calendar,
    Loader2,
    AlertCircle,
    ChevronDown,
} from 'lucide-react';
import BookingCard from './BookingCard';
import { useBookings } from '@/hooks/booking/useBookings';
import {
    BookingStatus,
    BookingStatusLabels,
    PaymentStatus,
    PaymentStatusLabels,
    BookingFilters,
} from '@/types/booking';

interface BookingListProps {
    userId?: string;
    providerId?: string;
    serviceId?: string;
    showFilters?: boolean;
    compact?: boolean;
    onBookingClick?: (bookingId: string) => void;
    onCancel?: (bookingId: string) => void;
    onReschedule?: (bookingId: string) => void;
    onDelete?: (bookingId: string) => void;
}

export default function BookingList({
    userId,
    providerId,
    serviceId,
    showFilters = true,
    compact = false,
    onBookingClick,
    onCancel,
    onReschedule,
    onDelete,
}: BookingListProps) {
    const { bookings, fetchBookings, loading, error } = useBookings();
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<BookingFilters>({
        userId,
        providerId,
        serviceId,
    });

    useEffect(() => {
        fetchBookings(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof BookingFilters, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
    };

    const clearFilters = () => {
        setFilters({
            userId,
            providerId,
            serviceId,
        });
        setSearchTerm('');
    };

    const filteredBookings = bookings.filter((booking) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            booking.customerName.toLowerCase().includes(search) ||
            booking.customerEmail.toLowerCase().includes(search) ||
            booking.customerPhone.includes(search) ||
            booking.serviceName.toLowerCase().includes(search) ||
            booking.id.toLowerCase().includes(search)
        );
    });

    const activeFiltersCount = Object.entries(filters).filter(
        ([key, value]) => {
            // No contar los filtros base (userId, providerId, serviceId)
            if (key === 'userId' && value === userId) return false;
            if (key === 'providerId' && value === providerId) return false;
            if (key === 'serviceId' && value === serviceId) return false;
            return value !== undefined;
        }
    ).length;

    return (
        <div className="space-y-4">
            {/* Barra de búsqueda y filtros */}
            {showFilters && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Barra de búsqueda */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, email, teléfono, servicio o ID..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Botón de filtros */}
                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Filter className="w-5 h-5" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                            <ChevronDown
                                className={`w-4 h-4 transition-transform ${showFilterPanel ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Panel de filtros */}
                    {showFilterPanel && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Estado */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        value={filters.status || ''}
                                        onChange={(e) =>
                                            handleFilterChange('status', e.target.value as BookingStatus)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todos</option>
                                        {Object.entries(BookingStatusLabels).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Estado de Pago */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado de Pago
                                    </label>
                                    <select
                                        value={filters.paymentStatus || ''}
                                        onChange={(e) =>
                                            handleFilterChange('paymentStatus', e.target.value as PaymentStatus)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Todos</option>
                                        {Object.entries(PaymentStatusLabels).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha de inicio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Desde
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={filters.startDate || ''}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Fecha de fin */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hasta
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            value={filters.endDate || ''}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                                <button
                                    onClick={() => fetchBookings(filters)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Contador de resultados */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                    Mostrando {filteredBookings.length} de {bookings.length} reservas
                </div>
            </div>

            {/* Estados de carga y error */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-900">Error al cargar las reservas</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Lista de reservas */}
            {!loading && !error && filteredBookings.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay reservas
                    </h3>
                    <p className="text-gray-600">
                        {searchTerm || activeFiltersCount > 0
                            ? 'No se encontraron reservas con los filtros aplicados.'
                            : 'Aún no tienes reservas registradas.'}
                    </p>
                </div>
            )}

            {!loading && !error && filteredBookings.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {filteredBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onCancel={onCancel}
                            onReschedule={onReschedule}
                            onDelete={onDelete}
                            compact={compact}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
