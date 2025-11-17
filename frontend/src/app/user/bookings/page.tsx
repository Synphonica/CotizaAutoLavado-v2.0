'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingList from '@/components/booking/BookingList';
import { Loader2 } from 'lucide-react';
import { ModernNavbar } from '@/components/ModernNavbar';

export default function MyBookingsPage() {
    const { isLoaded, isSignedIn, userId } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in?redirect_url=/user/bookings');
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!isSignedIn || !userId) {
        return null;
    }

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gray-50 py-8 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
                        <p className="mt-2 text-gray-600">
                            Gestiona y visualiza todas tus reservas de lavado de auto
                        </p>
                    </div>

                    {/* Bookings List */}
                    <div className="bg-white rounded-lg shadow">
                        <BookingList
                            userId={userId}
                            showFilters={true}
                            onBookingClick={(bookingId) => router.push(`/user/bookings/${bookingId}`)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
