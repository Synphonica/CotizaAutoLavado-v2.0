'use client';

import React, { useEffect } from 'react';
import {
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    DollarSign,
    Users,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { useBookingStats } from '@/hooks/booking/useBookings';
import { BookingStats } from '@/types/booking';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div
                            className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}
                        >
                            <TrendingUp
                                className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`}
                            />
                            {trend.value}%
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            </div>
        </div>
    );
}

interface BookingDashboardProps {
    providerId: string;
    showTrends?: boolean;
}

export default function BookingDashboard({
    providerId,
    showTrends = false,
}: BookingDashboardProps) {
    const { stats, fetchStats, loading, error } = useBookingStats(providerId);

    useEffect(() => {
        fetchStats();
    }, [providerId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-medium text-red-900">Error al cargar estadísticas</p>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const completionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const confirmationRate = stats.total > 0
        ? Math.round((stats.confirmed / stats.total) * 100)
        : 0;

    const noShowRate = stats.total > 0
        ? Math.round((stats.noShow / stats.total) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Título del Dashboard */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Dashboard de Reservas
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Estadísticas y métricas de tus reservas
                    </p>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total de Reservas"
                    value={stats.total}
                    icon={<Calendar className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50"
                    trend={
                        showTrends ? { value: 12, isPositive: true } : undefined
                    }
                />

                <StatCard
                    title="Confirmadas"
                    value={stats.confirmed}
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                    trend={
                        showTrends ? { value: 8, isPositive: true } : undefined
                    }
                />

                <StatCard
                    title="Pendientes"
                    value={stats.pending}
                    icon={<Clock className="w-6 h-6 text-yellow-600" />}
                    color="bg-yellow-50"
                />

                <StatCard
                    title="Completadas"
                    value={stats.completed}
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                    color="bg-green-50"
                    trend={
                        showTrends ? { value: 15, isPositive: true } : undefined
                    }
                />
            </div>

            {/* Tarjetas Adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Canceladas"
                    value={stats.cancelled}
                    icon={<XCircle className="w-6 h-6 text-red-600" />}
                    color="bg-red-50"
                />

                <StatCard
                    title="No Presentados"
                    value={stats.noShow}
                    icon={<Users className="w-6 h-6 text-orange-600" />}
                    color="bg-orange-50"
                />

                <StatCard
                    title="Tasa de Finalización"
                    value={`${completionRate}%`}
                    icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50"
                />
            </div>

            {/* Métricas de Rendimiento */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Métricas de Rendimiento
                </h3>
                <div className="space-y-4">
                    {/* Tasa de Confirmación */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Tasa de Confirmación
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {confirmationRate}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${confirmationRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Tasa de Finalización */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Tasa de Finalización
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {completionRate}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Tasa de No Presentados */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Tasa de No Presentados
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {noShowRate}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${noShowRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen Rápido */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Resumen Rápido</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold">{stats.total}</p>
                        <p className="text-blue-100 text-sm mt-1">Total</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">{stats.confirmed + stats.completed}</p>
                        <p className="text-blue-100 text-sm mt-1">Exitosas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">{stats.pending}</p>
                        <p className="text-blue-100 text-sm mt-1">Por Confirmar</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">{completionRate}%</p>
                        <p className="text-blue-100 text-sm mt-1">Tasa Éxito</p>
                    </div>
                </div>
            </div>

            {/* Alertas y Recomendaciones */}
            {(stats.pending > 5 || noShowRate > 10) && (
                <div className="space-y-3">
                    {stats.pending > 5 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-yellow-900">
                                    Tienes {stats.pending} reservas pendientes
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Considera revisar y confirmar las reservas pendientes para mejorar
                                    la experiencia del cliente.
                                </p>
                            </div>
                        </div>
                    )}

                    {noShowRate > 10 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-orange-900">
                                    Alta tasa de no presentados ({noShowRate}%)
                                </p>
                                <p className="text-sm text-orange-700 mt-1">
                                    Considera implementar recordatorios automáticos o políticas de
                                    confirmación para reducir las ausencias.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
