"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { AdminRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import {
    Users,
    Building2,
    Wrench,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    FileText,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Activity
} from "lucide-react";

interface DashboardStats {
    users: {
        total: number;
        customers: number;
        providers: number;
        admins: number;
    };
    providers: {
        total: number;
        active: number;
        pending: number;
        inactive: number;
    };
    services: {
        total: number;
        active: number;
    };
    requests: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export default function AdminDashboardPage() {
    const { get } = useApi();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            console.log('[Admin Dashboard] Loading dashboard data...');

            // Intentar cargar estadísticas desde múltiples endpoints
            const [usersStats, providersStats, servicesStats, requestsData] = await Promise.all([
                get<any>('/users/stats').catch((err) => {
                    console.warn('[Admin Dashboard] /users/stats failed:', err.message);
                    return null;
                }),
                get<any>('/providers/stats').catch((err) => {
                    console.warn('[Admin Dashboard] /providers/stats failed:', err.message);
                    return null;
                }),
                get<any>('/services/stats').catch((err) => {
                    console.warn('[Admin Dashboard] /services/stats failed:', err.message);
                    return null;
                }),
                get<any>('/providers/requests?status=PENDING_APPROVAL').catch((err) => {
                    console.warn('[Admin Dashboard] /providers/requests failed:', err.message);
                    return { data: [], total: 0 };
                }),
            ]);

            console.log('[Admin Dashboard] Data loaded:', { usersStats, providersStats, servicesStats, requestsData });

            setStats({
                users: {
                    total: usersStats?.total || 0,
                    customers: usersStats?.byRole?.CUSTOMER || 0,
                    providers: usersStats?.byRole?.PROVIDER || 0,
                    admins: usersStats?.byRole?.ADMIN || 0,
                },
                providers: {
                    total: providersStats?.total || 0,
                    active: providersStats?.byStatus?.ACTIVE || 0,
                    pending: providersStats?.byStatus?.PENDING || 0,
                    inactive: providersStats?.byStatus?.INACTIVE || 0,
                },
                services: {
                    total: servicesStats?.total || 0,
                    active: servicesStats?.byStatus?.ACTIVE || 0,
                },
                requests: {
                    total: requestsData?.total || 0,
                    pending: requestsData?.data?.filter((r: any) => r.status === 'PENDING').length || 0,
                    approved: 0,
                    rejected: 0,
                }
            });

        } catch (error) {
            console.error('[Admin Dashboard] Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Usuarios",
            value: stats?.users.total || 0,
            icon: Users,
            color: "blue",
            trend: "+12%",
            trendUp: true,
            href: "/admin/users"
        },
        {
            title: "Proveedores Activos",
            value: stats?.providers.active || 0,
            icon: Building2,
            color: "green",
            trend: "+8%",
            trendUp: true,
            href: "/admin/providers"
        },
        {
            title: "Servicios",
            value: stats?.services.total || 0,
            icon: Wrench,
            color: "purple",
            trend: "+15%",
            trendUp: true,
            href: "/admin/services"
        },
        {
            title: "Solicitudes Pendientes",
            value: stats?.requests.pending || 0,
            icon: FileText,
            color: "orange",
            trend: stats?.requests.pending && stats.requests.pending > 0 ? "Requiere atención" : "Al día",
            trendUp: false,
            href: "/admin/requests"
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
            blue: { bg: "from-blue-50 to-blue-100", text: "text-blue-600", iconBg: "bg-blue-100" },
            green: { bg: "from-green-50 to-green-100", text: "text-green-600", iconBg: "bg-green-100" },
            purple: { bg: "from-purple-50 to-purple-100", text: "text-purple-600", iconBg: "bg-purple-100" },
            orange: { bg: "from-orange-50 to-orange-100", text: "text-orange-600", iconBg: "bg-orange-100" },
        };
        return colors[color] || colors.blue;
    };

    if (loading) {
        return (
            <AdminRoute>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminRoute>
        );
    }

    return (
        <AdminRoute>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
                    <p className="text-gray-600 mt-1">Bienvenido al panel de administración de Alto Carwash</p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {statCards.map((stat, index) => {
                        const colors = getColorClasses(stat.color);
                        return (
                            <Link key={stat.title} href={stat.href}>
                                <Card className={`bg-gradient-to-br ${colors.bg} border-none hover:shadow-lg transition-all cursor-pointer`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                                <p className={`text-3xl font-bold ${colors.text} mt-1`}>{stat.value.toLocaleString()}</p>
                                                <div className="flex items-center mt-2">
                                                    {stat.trendUp ? (
                                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                    ) : stat.color === "orange" && stat.value > 0 ? (
                                                        <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                                                    ) : (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                                    )}
                                                    <span className={`text-xs ${stat.trendUp ? 'text-green-600' : stat.color === 'orange' && stat.value > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                        {stat.trend}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`${colors.iconBg} p-3 rounded-xl`}>
                                                <stat.icon className={`h-6 w-6 ${colors.text}`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </motion.div>

                {/* Quick Actions & Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Acciones Rápidas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/admin/requests">
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-orange-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Solicitudes pendientes</p>
                                                <p className="text-sm text-gray-600">{stats?.requests.pending || 0} solicitudes esperan revisión</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </Link>

                                <Link href="/admin/users">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Gestionar usuarios</p>
                                                <p className="text-sm text-gray-600">{stats?.users.total || 0} usuarios registrados</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </Link>

                                <Link href="/admin/providers">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Gestionar proveedores</p>
                                                <p className="text-sm text-gray-600">{stats?.providers.total || 0} proveedores en el sistema</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Summary */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Resumen del Sistema
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Users Breakdown */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Usuarios por Rol</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                Clientes: {stats?.users.customers || 0}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                Proveedores: {stats?.users.providers || 0}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                                Admins: {stats?.users.admins || 0}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Providers Status */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Estado de Proveedores</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-green-50 p-3 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-green-600">{stats?.providers.active || 0}</p>
                                                <p className="text-xs text-gray-600">Activos</p>
                                            </div>
                                            <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-yellow-600">{stats?.providers.pending || 0}</p>
                                                <p className="text-xs text-gray-600">Pendientes</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-gray-600">{stats?.providers.inactive || 0}</p>
                                                <p className="text-xs text-gray-600">Inactivos</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Servicios</span>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Total servicios activos</p>
                                                    <p className="text-2xl font-bold text-purple-600">{stats?.services.active || 0}</p>
                                                </div>
                                                <Wrench className="h-10 w-10 text-purple-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AdminRoute>
    );
}
