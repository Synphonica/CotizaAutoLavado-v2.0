'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    disabledDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

export default function BookingCalendar({
    selectedDate,
    onSelectDate,
    disabledDates = [],
    minDate = new Date(),
    maxDate,
    className = '',
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysCount = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Días vacíos del mes anterior
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Días del mes actual
        for (let i = 1; i <= daysCount; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [currentMonth]);

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const isDateDisabled = (date: Date | null): boolean => {
        if (!date) return true;

        // Verificar si está antes de minDate
        if (minDate && date < minDate) return true;

        // Verificar si está después de maxDate
        if (maxDate && date > maxDate) return true;

        // Verificar si está en disabledDates
        return disabledDates.some(
            (disabledDate) =>
                disabledDate.getFullYear() === date.getFullYear() &&
                disabledDate.getMonth() === date.getMonth() &&
                disabledDate.getDate() === date.getDate()
        );
    };

    const isDateSelected = (date: Date | null): boolean => {
        if (!date || !selectedDate) return false;

        return (
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
        );
    };

    const isToday = (date: Date | null): boolean => {
        if (!date) return false;
        const today = new Date();

        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Mes anterior"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                </div>

                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Mes siguiente"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-medium text-gray-600 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((date, index) => {
                    const disabled = isDateDisabled(date);
                    const selected = isDateSelected(date);
                    const today = isToday(date);

                    return (
                        <button
                            key={index}
                            onClick={() => date && !disabled && onSelectDate(date)}
                            disabled={disabled}
                            className={`
                aspect-square p-2 rounded-lg text-sm font-medium transition-all
                ${!date ? 'invisible' : ''}
                ${disabled
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                                }
                ${selected
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : ''
                                }
                ${today && !selected
                                    ? 'border-2 border-blue-600'
                                    : ''
                                }
              `}
                        >
                            {date?.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-blue-600 rounded"></div>
                    <span className="text-gray-600">Hoy</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-gray-600">No disponible</span>
                </div>
            </div>
        </div>
    );
}
