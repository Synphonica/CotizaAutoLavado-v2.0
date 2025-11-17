'use client';

import { useState } from 'react';
import { Bell, BellOff, Plus, RefreshCw } from 'lucide-react';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import AlertCard from '@/components/alerts/AlertCard';

export default function AlertsDashboard() {
    const { alerts, loading, error, refetch } = usePriceAlerts();
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredAlerts = alerts.filter((alert) => {
        if (filter === 'active') return alert.isActive;
        if (filter === 'inactive') return !alert.isActive;
        return true;
    });

    const activeCount = alerts.filter((a) => a.isActive).length;
    const inactiveCount = alerts.filter((a) => !a.isActive).length;

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando alertas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar alertas</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🔔 Mis Alertas de Precio
                </h1>
                <p className="text-gray-600">
                    Recibe notificaciones cuando los servicios que te interesan bajen de precio
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total de alertas</p>
                            <p className="text-3xl font-bold text-blue-900">{alerts.length}</p>
                        </div>
                        <Bell className="w-10 h-10 text-blue-600 opacity-50" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Alertas activas</p>
                            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
                        </div>
                        <Bell className="w-10 h-10 text-green-600 opacity-50" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Desactivadas</p>
                            <p className="text-3xl font-bold text-gray-900">{inactiveCount}</p>
                        </div>
                        <BellOff className="w-10 h-10 text-gray-600 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Todas ({alerts.length})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Activas ({activeCount})
                    </button>
                    <button
                        onClick={() => setFilter('inactive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'inactive'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Desactivadas ({inactiveCount})
                    </button>
                </div>
                <button
                    onClick={refetch}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Actualizar"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {filter === 'all' ? 'No tienes alertas' : `No tienes alertas ${filter === 'active' ? 'activas' : 'desactivadas'}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Crea alertas para recibir notificaciones cuando los precios bajen
                    </p>
                    <a
                        href="/results"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Explorar Servicios
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onUpdate={refetch}
                            onDelete={refetch}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
