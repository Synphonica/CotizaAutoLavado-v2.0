'use client';

import React, { useEffect, useState, useRef } from 'react';
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
    
    // Usar una referencia para almacenar la última fecha/proveedor cargado
    const lastLoadedRef = useRef<string>('');

    useEffect(() => {
        if (date && providerId) {
            const dateString = date.toISOString().split('T')[0];
            const loadKey = `${providerId}-${dateString}`;
            
            // Solo cargar si es diferente a la última carga
            if (loadKey !== lastLoadedRef.current) {
                lastLoadedRef.current = loadKey;
                checkAvailability(providerId, dateString);
            }
        }
    }, [date, providerId]); // No incluir checkAvailability en dependencias

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
                <h4 className="text-sm font-semibold text-[#073642] mb-3 flex items-center gap-2">
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
                                        ? 'bg-[#0F9D58] text-white border-[#0F9D58] shadow-md shadow-emerald-200'
                                        : 'bg-white text-[#073642] border-emerald-200 hover:border-[#0F9D58] hover:bg-emerald-50'
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
            <div className={`bg-emerald-50/50 rounded-lg border border-emerald-200 p-8 text-center ${className}`}>
                <Clock className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-[#073642]/70">Selecciona una fecha para ver los horarios disponibles</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-lg border border-emerald-200 p-8 text-center ${className}`}>
                <Loader2 className="w-8 h-8 text-[#0F9D58] animate-spin mx-auto mb-3" />
                <p className="text-[#073642]/70">Cargando horarios disponibles...</p>
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
            <div className={`bg-[#FFD166]/10 rounded-lg border border-[#FFD166]/30 p-8 text-center ${className}`}>
                <Clock className="w-12 h-12 text-[#FFD166] mx-auto mb-3" />
                <p className="text-[#073642] font-medium mb-1">No hay horarios disponibles</p>
                <p className="text-[#073642]/70 text-sm">
                    Por favor, selecciona otra fecha
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg border border-emerald-200 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#073642] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#0F9D58]" />
                    Horarios Disponibles
                </h3>
                <span className="text-sm text-[#073642]/70">
                    {availability.slots.length} horarios
                </span>
            </div>

            <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-[#073642]">
                    <span className="font-medium">Duración del servicio:</span> {duration} minutos
                </p>
            </div>

            {renderSlotGroup(groupedSlots.morning, 'Mañana', '🌅')}
            {renderSlotGroup(groupedSlots.afternoon, 'Tarde', '☀️')}
            {renderSlotGroup(groupedSlots.evening, 'Noche', '🌙')}

            {selectedSlot && (
                <div className="mt-4 p-4 bg-[#0F9D58]/10 rounded-lg border border-[#0F9D58]/30">
                    <p className="text-sm text-[#073642]">
                        <span className="font-medium">Horario seleccionado:</span>{' '}
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                    </p>
                </div>
            )}
        </div>
    );
}
