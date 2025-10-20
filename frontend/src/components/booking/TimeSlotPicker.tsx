'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useAvailability } from '@/hooks/booking/useBookings';
import { TimeSlot } from '@/types/booking';

interface TimeSlotPickerProps {
    providerId: string;
    date: Date | null;
    duration: number; // Duración del servicio en minutos
    selectedSlot: TimeSlot | null;
    onSelectSlot: (slot: TimeSlot) => void;
    className?: string;
}

export default function TimeSlotPicker({
    providerId,
    date,
    duration,
    selectedSlot,
    onSelectSlot,
    className = '',
}: TimeSlotPickerProps) {
    const { availability, loading, error, checkAvailability } = useAvailability();
    const [groupedSlots, setGroupedSlots] = useState<{ morning: TimeSlot[]; afternoon: TimeSlot[]; evening: TimeSlot[] }>({
        morning: [],
        afternoon: [],
        evening: [],
    });

    useEffect(() => {
        if (date && providerId) {
            const dateString = date.toISOString().split('T')[0];
            checkAvailability(providerId, dateString);
        }
    }, [date, providerId, checkAvailability]);

    useEffect(() => {
        if (availability?.slots) {
            const grouped = {
                morning: [] as TimeSlot[],
                afternoon: [] as TimeSlot[],
                evening: [] as TimeSlot[],
            };

            availability.slots.forEach((slot) => {
                const hour = new Date(slot.startTime).getHours();

                if (hour < 12) {
                    grouped.morning.push(slot);
                } else if (hour < 18) {
                    grouped.afternoon.push(slot);
                } else {
                    grouped.evening.push(slot);
                }
            });

            setGroupedSlots(grouped);
        }
    }, [availability]);

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const isSlotSelected = (slot: TimeSlot): boolean => {
        if (!selectedSlot) return false;
        return slot.startTime === selectedSlot.startTime && slot.endTime === selectedSlot.endTime;
    };

    const renderSlotGroup = (slots: TimeSlot[], title: string, icon: string) => {
        if (slots.length === 0) return null;

        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>{icon}</span>
                    {title}
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {slots.map((slot, index) => (
                        <button
                            key={index}
                            onClick={() => slot.available && onSelectSlot(slot)}
                            disabled={!slot.available}
                            className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all border
                ${!slot.available
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                    : isSlotSelected(slot)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                }
              `}
                        >
                            {formatTime(slot.startTime)}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (!date) {
        return (
            <div className={`bg-gray-50 rounded-lg border border-gray-200 p-8 text-center ${className}`}>
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Selecciona una fecha para ver los horarios disponibles</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-lg border border-gray-200 p-8 text-center ${className}`}>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Cargando horarios disponibles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 rounded-lg border border-red-200 p-6 ${className}`}>
                <p className="text-red-600 text-center">{error}</p>
            </div>
        );
    }

    if (!availability?.available || availability.slots.length === 0) {
        return (
            <div className={`bg-yellow-50 rounded-lg border border-yellow-200 p-8 text-center ${className}`}>
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-yellow-800 font-medium mb-1">No hay horarios disponibles</p>
                <p className="text-yellow-700 text-sm">
                    Por favor, selecciona otra fecha
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Horarios Disponibles
                </h3>
                <span className="text-sm text-gray-600">
                    {availability.slots.length} horarios
                </span>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                    <span className="font-medium">Duración del servicio:</span> {duration} minutos
                </p>
            </div>

            {renderSlotGroup(groupedSlots.morning, 'Mañana', '🌅')}
            {renderSlotGroup(groupedSlots.afternoon, 'Tarde', '☀️')}
            {renderSlotGroup(groupedSlots.evening, 'Noche', '🌙')}

            {selectedSlot && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                        <span className="font-medium">Horario seleccionado:</span>{' '}
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </p>
                </div>
            )}
        </div>
    );
}
