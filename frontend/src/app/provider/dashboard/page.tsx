"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    BarChart3,
    Calendar,
    Users,
    Star,
    TrendingUp,
    TrendingDown,
    Clock,
    MapPin,
    Phone,
    Mail,
    DollarSign,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Image as ImageIcon,
    Settings,
    Bell,
    Loader2,
    Sparkles,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";
import { ProviderRoute } from "@/components/ProtectedRoute";

function ProviderDashboardContent() {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const { getToken } = useAuth();

    // Detectar hash en la URL para cambiar de pestaña
    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (hash && ["overview", "bookings", "reviews", "analytics", "ai-insights"].includes(hash)) {
            setActiveTab(hash);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();

            // Obtener datos del proveedor
            const provider = await apiGet<any>("/providers/my-provider", { token });

            if (!provider) {
                setError("No tienes un perfil de proveedor registrado");
                return;
            }

            // Obtener estadísticas de bookings
            const startDate = new Date();
            if (timeRange === "7d") startDate.setDate(startDate.getDate() - 7);
            else if (timeRange === "30d") startDate.setDate(startDate.getDate() - 30);
            else startDate.setDate(startDate.getDate() - 90);

            const stats = await apiGet<any>(
                `/bookings/stats/${provider.id}?startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`,
                { token }
            );

            // Obtener servicios del proveedor
            const servicesData = await apiGet<any[]>(
                `/services/my-services`,
                { token }
            );

            // Actualizar datos con información real
            setData({
                provider: {
                    id: provider.id,
                    businessName: provider.businessName,
                    email: provider.email,
                    phone: provider.phone,
                    address: provider.address,
                    rating: provider.rating || 0,
                    totalReviews: provider.totalReviews || 0,
                    status: provider.status,
                    createdAt: provider.createdAt,
                },
                metrics: {
                    views: {
                        current: stats.views || 0,
                        previous: stats.previousViews || 0,
                        change: stats.viewsChange || 0,
                        trend: ((stats.viewsChange || 0) >= 0 ? "up" : "down") as "up" | "down",
                    },
                    bookings: {
                        current: stats.totalBookings || 0,
                        previous: stats.previousBookings || 0,
                        change: stats.bookingsChange || 0,
                        trend: ((stats.bookingsChange || 0) >= 0 ? "up" : "down") as "up" | "down",
                    },
                    revenue: {
                        current: stats.totalRevenue || 0,
                        previous: stats.previousRevenue || 0,
                        change: stats.revenueChange || 0,
                        trend: ((stats.revenueChange || 0) >= 0 ? "up" : "down") as "up" | "down",
                    },
                    rating: {
                        current: provider.rating || 0,
                        previous: stats.previousRating || 0,
                        change: stats.ratingChange || 0,
                        trend: ((stats.ratingChange || 0) >= 0 ? "up" : "down") as "up" | "down",
                    },
                },
                services: {
                    total: servicesData?.length || 0,
                    active: servicesData?.filter((s: any) => s.status === "ACTIVE").length || 0,
                    inactive: servicesData?.filter((s: any) => s.status !== "ACTIVE").length || 0,
                },
                bookings: {
                    pending: stats.pendingCount || 0,
                    confirmed: stats.confirmedCount || 0,
                    completed: stats.completedCount || 0,
                    cancelled: stats.cancelledCount || 0,
                },
                recentBookings: stats.recentBookings || [],
                recentReviews: provider.reviews?.slice(0, 2) || [],
                chartData: stats.chartData || [],
            });
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Error al cargar los datos del dashboard");
            toast.error("No se pudieron cargar los datos del dashboard");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatChange = (value: number, trend: "up" | "down") => {
        const prefix = trend === "up" ? "+" : "";
        return `${prefix}${value.toFixed(1)}%`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <Card className="border-red-300 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        {data.provider.businessName}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{data.provider.address}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{data.provider.rating}</span>
                                            <span>({data.provider.totalReviews} reseñas)</span>
                                        </div>
                                        <Badge variant="default" className="bg-green-500">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Verificado
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/provider/dashboard/settings">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Configuración
                                        </Link>
                                    </Button>
                                    <Button variant="outline">
                                        <Bell className="w-4 h-4 mr-2" />
                                        Notificaciones
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Time Range Selector */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6"
                        >
                            <div className="flex gap-2">
                                {[
                                    { value: "7d", label: "Últimos 7 días" },
                                    { value: "30d", label: "Últimos 30 días" },
                                    { value: "90d", label: "Últimos 90 días" },
                                ].map((range) => (
                                    <Button
                                        key={range.value}
                                        variant={timeRange === range.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTimeRange(range.value as any)}
                                    >
                                        {range.label}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Visualizaciones */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Visualizaciones
                                        </CardTitle>
                                        <Eye className="w-4 h-4 text-blue-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {data.metrics.views.current.toLocaleString()}
                                        </div>
                                        <div className="flex items-center text-xs mt-2">
                                            {data.metrics.views.trend === "up" ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                                            )}
                                            <span
                                                className={
                                                    data.metrics.views.trend === "up"
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }
                                            >
                                                {formatChange(
                                                    data.metrics.views.change,
                                                    data.metrics.views.trend
                                                )}
                                            </span>
                                            <span className="text-gray-500 ml-1">vs período anterior</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Agendamientos */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Agendamientos
                                        </CardTitle>
                                        <Calendar className="w-4 h-4 text-purple-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {data.metrics.bookings.current}
                                        </div>
                                        <div className="flex items-center text-xs mt-2">
                                            {data.metrics.bookings.trend === "up" ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                                            )}
                                            <span
                                                className={
                                                    data.metrics.bookings.trend === "up"
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }
                                            >
                                                {formatChange(
                                                    data.metrics.bookings.change,
                                                    data.metrics.bookings.trend
                                                )}
                                            </span>
                                            <span className="text-gray-500 ml-1">vs período anterior</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Ingresos */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Ingresos Proyectados
                                        </CardTitle>
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(data.metrics.revenue.current)}
                                        </div>
                                        <div className="flex items-center text-xs mt-2">
                                            {data.metrics.revenue.trend === "up" ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                                            )}
                                            <span
                                                className={
                                                    data.metrics.revenue.trend === "up"
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }
                                            >
                                                {formatChange(
                                                    data.metrics.revenue.change,
                                                    data.metrics.revenue.trend
                                                )}
                                            </span>
                                            <span className="text-gray-500 ml-1">vs período anterior</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Calificación */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Calificación Promedio
                                        </CardTitle>
                                        <Star className="w-4 h-4 text-yellow-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {data.metrics.rating.current.toFixed(1)}
                                        </div>
                                        <div className="flex items-center text-xs mt-2">
                                            {data.metrics.rating.trend === "up" ? (
                                                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                                            )}
                                            <span
                                                className={
                                                    data.metrics.rating.trend === "up"
                                                        ? "text-green-500"
                                                        : "text-red-500"
                                                }
                                            >
                                                {data.metrics.rating.trend === "up" ? "+" : ""}
                                                {data.metrics.rating.change.toFixed(1)}
                                            </span>
                                            <span className="text-gray-500 ml-1">
                                                de {data.provider.totalReviews} reseñas
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Main Content - Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="overview">Vista General</TabsTrigger>
                                <TabsTrigger value="bookings">Agendamientos</TabsTrigger>
                                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                                <TabsTrigger value="analytics">Analítica</TabsTrigger>
                                <TabsTrigger value="ai-insights">Análisis IA</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Quick Stats */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Estado de Servicios</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Total de servicios
                                                </span>
                                                <Badge variant="outline">{data.services.total}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Activos</span>
                                                <Badge className="bg-green-500">{data.services.active}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Inactivos</span>
                                                <Badge variant="secondary">{data.services.inactive}</Badge>
                                            </div>
                                            <Button className="w-full mt-4" asChild>
                                                <Link href="/provider/dashboard/services">
                                                    <Package className="w-4 h-4 mr-2" />
                                                    Gestionar Servicios
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Bookings Status */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Estado de Agendamientos</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Pendientes</span>
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                    {data.bookings.pending}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Confirmados</span>
                                                <Badge className="bg-blue-500">{data.bookings.confirmed}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Completados</span>
                                                <Badge className="bg-green-500">{data.bookings.completed}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Cancelados</span>
                                                <Badge variant="secondary">{data.bookings.cancelled}</Badge>
                                            </div>
                                            <Button className="w-full mt-4" asChild>
                                                <Link href="/provider/dashboard/bookings">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Ver Agendamientos
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Bookings */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Agendamientos Recientes</CardTitle>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/provider/dashboard/bookings">Ver todos</Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {data.recentBookings.map((booking: any) => (
                                                <div
                                                    key={booking.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium">{booking.customerName}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {booking.service}
                                                        </div>
                                                    </div>
                                                    <div className="text-right mr-4">
                                                        <div className="text-sm font-medium">
                                                            {booking.date} - {booking.time}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {formatCurrency(booking.price)}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            booking.status === "confirmed"
                                                                ? "default"
                                                                : "secondary"
                                                        }
                                                        className={
                                                            booking.status === "confirmed"
                                                                ? "bg-blue-500"
                                                                : "bg-yellow-500"
                                                        }
                                                    >
                                                        {booking.status === "confirmed"
                                                            ? "Confirmado"
                                                            : "Pendiente"}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recent Reviews */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Reseñas Recientes</CardTitle>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/provider/dashboard/reviews">Ver todas</Link>
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {data.recentReviews.map((review: any) => (
                                                <div
                                                    key={review.id}
                                                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="font-medium">{review.customerName}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {review.service}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                            <span className="ml-1 font-medium">{review.rating}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{review.comment}</p>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {review.date}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Bookings Tab */}
                            <TabsContent value="bookings">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Todos los Agendamientos</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Contenido del tab de agendamientos - TODO: Implementar
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Reviews Tab */}
                            <TabsContent value="reviews">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Todas las Reseñas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Contenido del tab de reseñas - TODO: Implementar
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Analítica Detallada</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600">
                                            Gráficos y estadísticas detalladas - TODO: Implementar
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* AI Insights Tab */}
                            <TabsContent value="ai-insights">
                                <AIInsightsTab providerId={data.provider.id} />
                            </TabsContent>
                        </Tabs>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <Button variant="outline" className="h-20" asChild>
                                <Link href="/provider/dashboard/services/new">
                                    <Package className="w-5 h-5 mr-2" />
                                    Agregar Nuevo Servicio
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-20" asChild>
                                <Link href="/provider/dashboard/gallery">
                                    <ImageIcon className="w-5 h-5 mr-2" />
                                    Actualizar Fotos
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-20" asChild>
                                <Link href="/provider/dashboard/settings">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Configuración
                                </Link>
                            </Button>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}

// AI Insights Tab Component
function AIInsightsTab({ providerId }: { providerId: number }) {
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useAuth();

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await apiGet(`/ai-insights/provider-analysis/${providerId}`, { token });
            setAnalysis(response);
        } catch (error: any) {
            console.error("Error fetching AI analysis:", error);
            setError(error.message || "Error al cargar el análisis");
            toast.error("Error al cargar el análisis con IA");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [providerId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto" />
                    <p className="text-gray-600">Generando análisis con IA...</p>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <p className="text-gray-600">{error || "No se pudo cargar el análisis"}</p>
                        <Button onClick={fetchAnalysis} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reintentar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { stats, analysis: aiAnalysis, hasUserHistory } = analysis;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 border-teal-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500 rounded-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Análisis Inteligente</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">
                                    Generado por IA basado en tus servicios, reseñas y estadísticas
                                </p>
                            </div>
                        </div>
                        <Button onClick={fetchAnalysis} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Servicios Totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-teal-600">
                                {stats.totalServices}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Reseñas Totales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-teal-600">
                                {stats.totalReviews}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Calificación Promedio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-3xl font-bold text-teal-600">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                Rango de Precios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold text-teal-600">
                                ${stats.priceRange.min.toLocaleString()} - ${stats.priceRange.max.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Promedio: ${stats.priceRange.average.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Rating Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Calificaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const dist = stats.ratingDistribution.find((r: any) => r.rating === rating);
                            const percentage = dist?.percentage || 0;
                            const count = dist?.count || 0;

                            return (
                                <div key={rating} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium w-8">{rating}</span>
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <span className="text-gray-600">
                                            {count} ({percentage.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </motion.div>

            {/* AI Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="border-teal-200">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-600" />
                            <CardTitle>Análisis Generado por IA</CardTitle>
                        </div>
                        {hasUserHistory && (
                            <Badge variant="secondary" className="w-fit mt-2">
                                Análisis personalizado basado en tu historial
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                {aiAnalysis}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Info Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-sm text-gray-500 py-4"
            >
                <p>
                    Este análisis es generado automáticamente por inteligencia artificial y se actualiza
                    en tiempo real basándose en tus servicios, reseñas y métricas.
                </p>
            </motion.div>
        </div>
    );
}

export default function ProviderDashboard() {
    return (
        <ProviderRoute>
            <ProviderDashboardContent />
        </ProviderRoute>
    );
}
