'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Phone,
    Mail,
    Car,
    CreditCard,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useBookings } from '@/hooks/booking/useBookings';
import {
    CreateBookingData,
    PaymentMethod,
    PaymentMethodLabels,
    TimeSlot,
} from '@/types/booking';

interface BookingFormProps {
    providerId: string;
    providerName: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    selectedDate: Date;
    selectedSlot: TimeSlot;
    userId?: string;
    onSuccess?: (bookingId: string) => void;
    onCancel?: () => void;
}

export default function BookingForm({
    providerId,
    providerName,
    serviceId,
    serviceName,
    servicePrice,
    serviceDuration,
    selectedDate,
    selectedSlot,
    userId,
    onSuccess,
    onCancel,
}: BookingFormProps) {
    const router = useRouter();
    const { createBooking, loading, error } = useBookings();
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        vehiclePlate: '',
        vehicleColor: '',
        vehicleType: 'sedan',
        paymentMethod: PaymentMethod.CASH,
        customerNotes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'El nombre es requerido';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'El teléfono es requerido';
        } else if (!/^\+?[\d\s-]+$/.test(formData.customerPhone)) {
            newErrors.customerPhone = 'Formato de teléfono inválido';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Formato de email inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const bookingData: CreateBookingData = {
                userId: userId || 'guest', // Puedes manejar usuarios guest o requerir login
                providerId,
                serviceId,
                bookingDate: selectedDate.toISOString().split('T')[0],
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                customerEmail: formData.customerEmail,
                vehicleInfo: {
                    brand: formData.vehicleBrand,
                    model: formData.vehicleModel,
                    year: formData.vehicleYear ? parseInt(formData.vehicleYear) : undefined,
                    plate: formData.vehiclePlate,
                    color: formData.vehicleColor,
                    type: formData.vehicleType,
                },
                serviceName,
                serviceDuration,
                totalPrice: servicePrice,
                currency: 'CLP',
                paymentMethod: formData.paymentMethod as PaymentMethod,
                customerNotes: formData.customerNotes,
            };

            const newBooking = await createBooking(bookingData);
            setSuccess(true);

            setTimeout(() => {
                if (onSuccess) {
                    onSuccess(newBooking.id);
                } else {
                    router.push(`/booking/${newBooking.id}`);
                }
            }, 2000);
        } catch (err) {
            console.error('Error al crear la reserva:', err);
        }
    };

    if (success) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva Creada!</h3>
                <p className="text-gray-600 mb-4">
                    Tu reserva ha sido creada exitosamente. Recibirás un email de confirmación pronto.
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirigiendo...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Completa tu Reserva</h3>
                <p className="text-sm text-gray-600">
                    Confirma tus datos para completar la reserva
                </p>
            </div>

            {/* Resumen de la reserva */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen de la Reserva</h4>
                <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Proveedor:</span> {providerName}</p>
                    <p><span className="font-medium">Servicio:</span> {serviceName}</p>
                    <p><span className="font-medium">Fecha:</span> {selectedDate.toLocaleDateString('es-CL')}</p>
                    <p>
                        <span className="font-medium">Hora:</span>{' '}
                        {new Date(selectedSlot.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(selectedSlot.endTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p><span className="font-medium">Duración:</span> {serviceDuration} minutos</p>
                    <p className="text-lg font-bold mt-2">
                        <span className="font-medium">Total:</span> ${servicePrice.toLocaleString('es-CL')} CLP
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-900">Error al crear la reserva</p>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Información Personal */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Juan Pérez"
                        />
                        {errors.customerName && (
                            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                id="customerPhone"
                                name="customerPhone"
                                value={formData.customerPhone}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="+56 9 1234 5678"
                            />
                        </div>
                        {errors.customerPhone && (
                            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                id="customerEmail"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="juan@example.com"
                            />
                        </div>
                        {errors.customerEmail && (
                            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Información del Vehículo */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Información del Vehículo (Opcional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700 mb-1">
                            Marca
                        </label>
                        <input
                            type="text"
                            id="vehicleBrand"
                            name="vehicleBrand"
                            value={formData.vehicleBrand}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Toyota"
                        />
                    </div>

                    <div>
                        <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                            Modelo
                        </label>
                        <input
                            type="text"
                            id="vehicleModel"
                            name="vehicleModel"
                            value={formData.vehicleModel}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Corolla"
                        />
                    </div>

                    <div>
                        <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-1">
                            Año
                        </label>
                        <input
                            type="number"
                            id="vehicleYear"
                            name="vehicleYear"
                            value={formData.vehicleYear}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="2020"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                        />
                    </div>

                    <div>
                        <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-1">
                            Patente
                        </label>
                        <input
                            type="text"
                            id="vehiclePlate"
                            name="vehiclePlate"
                            value={formData.vehiclePlate}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                            placeholder="AB1234"
                            maxLength={6}
                        />
                    </div>

                    <div>
                        <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <input
                            type="text"
                            id="vehicleColor"
                            name="vehicleColor"
                            value={formData.vehicleColor}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Blanco"
                        />
                    </div>

                    <div>
                        <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Vehículo
                        </label>
                        <select
                            id="vehicleType"
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="sedan">Sedán</option>
                            <option value="suv">SUV</option>
                            <option value="truck">Camioneta</option>
                            <option value="hatchback">Hatchback</option>
                            <option value="van">Van</option>
                            <option value="coupe">Coupé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Método de Pago */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Método de Pago
                </h4>
                <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {Object.entries(PaymentMethodLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Notas Adicionales */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Notas Adicionales (Opcional)
                </h4>
                <textarea
                    id="customerNotes"
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ejemplo: Favor lavar también el motor, tiene mucho polvo..."
                />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creando Reserva...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Confirmar Reserva
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
