import { Suspense } from 'react';
import AlertsDashboard from '@/components/alerts/AlertsDashboard';
import { Bell } from 'lucide-react';
import { ModernNavbar } from '@/components/ModernNavbar';

export const metadata = {
    title: 'Mis Alertas de Precio | Alto Carwash',
    description: 'Administra tus alertas de precio y recibe notificaciones cuando los servicios bajen de precio',
};

export default function AlertsPage() {
    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-full p-3">
                                <Bell className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Mis Alertas de Precio</h1>
                                <p className="text-gray-600 mt-1">
                                    Gestiona tus alertas y recibe notificaciones cuando los precios bajen
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard */}
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        }
                    >
                        <AlertsDashboard />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
