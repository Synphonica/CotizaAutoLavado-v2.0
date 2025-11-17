'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase-client';
import type { Booking } from '@/types/booking';
import { Loader2, Calendar, Clock, MapPin, Car, Phone, Mail } from 'lucide-react';

export default function BookingDetailPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const params = useParams();
    const bookingId = params.id as string;
    const supabase = useSupabaseClient();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in?redirect_url=/user/bookings');
            return;
        }

        if (isSignedIn && bookingId) {
            fetchBookingDetail();
        }
    }, [isLoaded, isSignedIn, bookingId]);

    const fetchBookingDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: supabaseError } = await supabase
                .from('bookings')
                .select(`
                    *,
                    service:services(name, price, duration, description),
                    provider:providers(businessName, address, phone, email, latitude, longitude)
                `)
                .eq('id', bookingId)
                .single();

            if (supabaseError) {
                throw new Error(supabaseError.message);
            }

            setBooking(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar la reserva';
            setError(errorMessage);
            console.error('Error fetching booking:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isSignedIn) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                        <button
                            onClick={() => router.push('/user/bookings')}
                            className="mt-4 text-blue-600 hover:underline"
                        >
                            Volver a mis reservas
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto px-4">
                    <p>Reserva no encontrada</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="mb-6 text-blue-600 hover:underline"
                >
                    ← Volver
                </button>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            Detalles de la Reserva
                        </h1>
                        <p className="text-blue-100 mt-1">ID: {booking.id}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status */}
                        <div>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                }`}>
                                {booking.status}
                            </span>
                        </div>

                        {/* Service Info */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Servicio</h3>
                            <div className="space-y-2">
                                <p className="text-gray-900 font-medium">{booking.serviceName}</p>
                                <div className="flex items-center text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{booking.serviceDuration} minutos</span>
                                </div>
                                <p className="text-lg font-bold text-blue-600">
                                    ${booking.totalPrice.toLocaleString()} {booking.currency}
                                </p>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Fecha y Hora</h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-gray-700">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>{new Date(booking.startTime).toLocaleDateString('es-CL')}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>
                                        {new Date(booking.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                        {' - '}
                                        {new Date(booking.endTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        {booking.vehicleInfo && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Vehículo</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-700">
                                        <Car className="w-4 h-4 mr-2" />
                                        <span>
                                            {booking.vehicleInfo.brand} {booking.vehicleInfo.model}
                                            {booking.vehicleInfo.year && ` (${booking.vehicleInfo.year})`}
                                        </span>
                                    </div>
                                    {booking.vehicleInfo.plate && (
                                        <p className="text-gray-600 ml-6">Patente: {booking.vehicleInfo.plate}</p>
                                    )}
                                    {booking.vehicleInfo.color && (
                                        <p className="text-gray-600 ml-6">Color: {booking.vehicleInfo.color}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {booking.customerNotes && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Notas</h3>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded">{booking.customerNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
