'use client';

import React, { useState } from 'react';
import BookingCalendar from '@/components/booking/BookingCalendar';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import BookingForm from '@/components/booking/BookingForm';
import BookingList from '@/components/booking/BookingList';
import BookingDashboard from '@/components/booking/BookingDashboard';
import { TimeSlot } from '@/types/booking';
import { ChevronLeft, Calendar, Clock, CheckCircle } from 'lucide-react';

export default function BookingPage() {
    const [step, setStep] = useState<'calendar' | 'timeslot' | 'form' | 'success'>(
        'calendar'
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    // Datos de ejemplo - En producción estos vendrían de props o context
    const providerId = 'provider-123';
    const providerName = 'Centro de Lavado Premium';
    const serviceId = 'service-456';
    const serviceName = 'Lavado Completo + Encerado';
    const servicePrice = 25000;
    const serviceDuration = 90; // minutos
    const userId = 'user-789';

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setStep('timeslot');
    };

    const handleSlotSelect = (slot: TimeSlot) => {
        setSelectedSlot(slot);
        setStep('form');
    };

    const handleBookingSuccess = (bookingId: string) => {
        setStep('success');
        console.log('Booking created:', bookingId);
    };

    const handleBack = () => {
        if (step === 'timeslot') {
            setStep('calendar');
            setSelectedSlot(null);
        } else if (step === 'form') {
            setStep('timeslot');
        }
    };

    const handleStartNew = () => {
        setStep('calendar');
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    // Ejemplo de fechas deshabilitadas (domingos y feriados)
    const getDisabledDates = () => {
        const disabled: Date[] = [];
        const today = new Date();

        // Deshabilitar domingos del próximo mes
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            if (date.getDay() === 0) {
                // Domingo
                disabled.push(date);
            }
        }

        return disabled;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Sistema de Agendamiento
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Agenda tu servicio de lavado de forma rápida y sencilla
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                {step !== 'success' && (
                    <div className="mb-8">
                        <div className="flex items-center justify-center">
                            {/* Step 1: Calendario */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 'calendar'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : selectedDate
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {selectedDate ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <Calendar className="w-5 h-5" />
                                    )}
                                </div>
                                <span
                                    className={`ml-2 text-sm font-medium ${step === 'calendar' || selectedDate
                                            ? 'text-gray-900'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    Fecha
                                </span>
                            </div>

                            {/* Conector */}
                            <div
                                className={`w-24 h-0.5 mx-4 ${selectedDate ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            />

                            {/* Step 2: Horario */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 'timeslot'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : selectedSlot
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {selectedSlot ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <Clock className="w-5 h-5" />
                                    )}
                                </div>
                                <span
                                    className={`ml-2 text-sm font-medium ${step === 'timeslot' || selectedSlot
                                            ? 'text-gray-900'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    Horario
                                </span>
                            </div>

                            {/* Conector */}
                            <div
                                className={`w-24 h-0.5 mx-4 ${selectedSlot ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            />

                            {/* Step 3: Formulario */}
                            <div className="flex items-center">
                                <div
                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step === 'form'
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-300 text-gray-400'
                                        }`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <span
                                    className={`ml-2 text-sm font-medium ${step === 'form' ? 'text-gray-900' : 'text-gray-400'
                                        }`}
                                >
                                    Confirmar
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Botón de Retroceso */}
                        {(step === 'timeslot' || step === 'form') && (
                            <button
                                onClick={handleBack}
                                className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Volver
                            </button>
                        )}

                        {/* Step 1: Calendario */}
                        {step === 'calendar' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Selecciona una Fecha
                                </h2>
                                <BookingCalendar
                                    selectedDate={selectedDate}
                                    onSelectDate={handleDateSelect}
                                    minDate={new Date()}
                                    disabledDates={getDisabledDates()}
                                />
                            </div>
                        )}

                        {/* Step 2: Selección de Horario */}
                        {step === 'timeslot' && selectedDate && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Selecciona un Horario
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Fecha seleccionada:{' '}
                                    {selectedDate.toLocaleDateString('es-CL', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <TimeSlotPicker
                                    providerId={providerId}
                                    date={selectedDate}
                                    duration={serviceDuration}
                                    selectedSlot={selectedSlot}
                                    onSelectSlot={handleSlotSelect}
                                />
                            </div>
                        )}

                        {/* Step 3: Formulario */}
                        {step === 'form' && selectedDate && selectedSlot && (
                            <div>
                                <BookingForm
                                    providerId={providerId}
                                    providerName={providerName}
                                    serviceId={serviceId}
                                    serviceName={serviceName}
                                    servicePrice={servicePrice}
                                    serviceDuration={serviceDuration}
                                    selectedDate={selectedDate}
                                    selectedSlot={selectedSlot}
                                    userId={userId}
                                    onSuccess={handleBookingSuccess}
                                    onCancel={handleBack}
                                />
                            </div>
                        )}

                        {/* Step 4: Confirmación */}
                        {step === 'success' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    ¡Reserva Exitosa!
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Tu reserva ha sido confirmada. Recibirás un email con los
                                    detalles.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleStartNew}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Nueva Reserva
                                    </button>
                                    <button
                                        onClick={() => window.location.href = '/bookings'}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Ver Mis Reservas
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Información del Servicio */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">
                                Información del Servicio
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-600">Proveedor</p>
                                    <p className="font-semibold text-gray-900">{providerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Servicio</p>
                                    <p className="font-semibold text-gray-900">{serviceName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Duración</p>
                                    <p className="font-semibold text-gray-900">
                                        {serviceDuration} minutos
                                    </p>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <p className="text-gray-600">Precio</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${servicePrice.toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Selección */}
                        {(selectedDate || selectedSlot) && (
                            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                                <h3 className="font-bold text-blue-900 mb-4">
                                    Resumen de tu Selección
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {selectedDate && (
                                        <div>
                                            <p className="text-blue-600">Fecha</p>
                                            <p className="font-semibold text-blue-900">
                                                {selectedDate.toLocaleDateString('es-CL', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {selectedSlot && (
                                        <div>
                                            <p className="text-blue-600">Horario</p>
                                            <p className="font-semibold text-blue-900">
                                                {new Date(selectedSlot.startTime).toLocaleTimeString(
                                                    'es-CL',
                                                    { hour: '2-digit', minute: '2-digit' }
                                                )}{' '}
                                                -{' '}
                                                {new Date(selectedSlot.endTime).toLocaleTimeString(
                                                    'es-CL',
                                                    { hour: '2-digit', minute: '2-digit' }
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sección de Dashboard (solo para proveedores) */}
                <div className="mt-12 pt-12 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Panel de Control (Vista Proveedor)
                    </h2>
                    <BookingDashboard providerId={providerId} showTrends={true} />
                </div>

                {/* Sección de Lista de Reservas */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Mis Reservas
                    </h2>
                    <BookingList
                        userId={userId}
                        showFilters={true}
                        onCancel={(bookingId) => console.log('Cancel:', bookingId)}
                        onReschedule={(bookingId) => console.log('Reschedule:', bookingId)}
                        onDelete={(bookingId) => console.log('Delete:', bookingId)}
                    />
                </div>
            </main>
        </div>
    );
}
