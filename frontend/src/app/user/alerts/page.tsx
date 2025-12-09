"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
    Bell,
    DollarSign,
    TrendingDown,
    Trash2,
    Plus,
    Star,
    MapPin,
    Check,
    X,
    AlertCircle,
} from "lucide-react";
import { apiGet, apiPost, apiDelete, apiPut } from "@/lib/api";

interface PriceAlert {
    id: string;
    serviceId: string;
    serviceName: string;
    providerName: string;
    currentPrice: number;
    targetPrice: number;
    isActive: boolean;
    createdAt: string;
    lastChecked?: string;
    priceDropDetected?: boolean;
}

export default function AlertsPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAlertForm, setShowNewAlertForm] = useState(false);

    useEffect(() => {
        if (user) {
            loadAlerts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadAlerts = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            console.log("🔑 Token obtenido:", token ? "✓ Token presente" : "✗ No token");

            if (!token) {
                console.error("No token available");
                setLoading(false);
                return;
            }

            const data = await apiGet<PriceAlert[]>("/price-alerts", { token });
            setAlerts(data);
        } catch (error) {
            console.error("Error loading alerts:", error);
            // Mock data para desarrollo
            setAlerts([
                {
                    id: "1",
                    serviceId: "s1",
                    serviceName: "Lavado Premium Exterior",
                    providerName: "AutoClean Pro",
                    currentPrice: 15000,
                    targetPrice: 12000,
                    isActive: true,
                    createdAt: "2025-11-20T10:00:00Z",
                    lastChecked: "2025-11-24T08:00:00Z",
                },
                {
                    id: "2",
                    serviceId: "s2",
                    serviceName: "Lavado Completo + Encerado",
                    providerName: "Car Spa Elite",
                    currentPrice: 25000,
                    targetPrice: 20000,
                    isActive: true,
                    createdAt: "2025-11-18T14:30:00Z",
                    lastChecked: "2025-11-24T08:00:00Z",
                    priceDropDetected: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAlert = async (alertId: string) => {
        try {
            const token = await getToken();
            await apiDelete(`/price-alerts/${alertId}`, { token });
            setAlerts(alerts.filter(a => a.id !== alertId));
        } catch (error) {
            console.error("Error deleting alert:", error);
        }
    };

    const handleToggleAlert = async (alertId: string, isActive: boolean) => {
        try {
            const token = await getToken();
            await apiPut(`/price-alerts/${alertId}`, { isActive: !isActive }, { token });
            setAlerts(alerts.map(a => a.id === alertId ? { ...a, isActive: !isActive } : a));
        } catch (error) {
            console.error("Error toggling alert:", error);
        }
    };

    const AlertCard = ({ alert }: { alert: PriceAlert }) => {
        const savingsPercentage = Math.round(((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100);
        const priceReached = alert.currentPrice <= alert.targetPrice;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className={`${priceReached ? "ring-2 ring-green-500" : ""}`}>
                    <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{alert.serviceName}</h3>
                                    {priceReached && (
                                        <Badge className="bg-green-500 text-white">
                                            <Check className="h-3 w-3 mr-1" />
                                            ¡Alcanzado!
                                        </Badge>
                                    )}
                                    {alert.priceDropDetected && !priceReached && (
                                        <Badge className="bg-orange-500 text-white">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            Bajó
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {alert.providerName}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                                    className={`p-2 rounded-lg transition-colors ${alert.isActive
                                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                        }`}
                                    title={alert.isActive ? "Pausar alerta" : "Activar alerta"}
                                >
                                    <Bell className={`h-5 w-5 ${alert.isActive ? "fill-current" : ""}`} />
                                </button>
                                <button
                                    onClick={() => handleDeleteAlert(alert.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Price Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Precio Actual</p>
                                <p className="text-xl font-bold text-gray-900">
                                    ${alert.currentPrice.toLocaleString("es-CL")}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Precio Objetivo</p>
                                <p className="text-xl font-bold text-green-600">
                                    ${alert.targetPrice.toLocaleString("es-CL")}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                                <span>Progreso hacia objetivo</span>
                                <span className="font-semibold">{savingsPercentage}% de ahorro</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${priceReached ? "bg-green-500" : "bg-blue-500"} transition-all`}
                                    style={{ width: `${Math.min((alert.targetPrice / alert.currentPrice) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-4 border-t text-xs text-gray-500">
                            <span>
                                Creada: {new Date(alert.createdAt).toLocaleDateString("es-CL")}
                            </span>
                            {alert.lastChecked && (
                                <span>
                                    Última revisión: {new Date(alert.lastChecked).toLocaleDateString("es-CL")}
                                </span>
                            )}
                        </div>

                        {priceReached && (
                            <div className="mt-4">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    <Check className="h-4 w-4 mr-2" />
                                    ¡Reservar Ahora!
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    return (
        <ProtectedRoute>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas de Precio</h1>
                                <p className="text-gray-600">
                                    {alerts.length} {alerts.length === 1 ? "alerta activa" : "alertas activas"}
                                </p>
                            </div>

                            <Button onClick={() => setShowNewAlertForm(!showNewAlertForm)} size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Nueva Alerta
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                    >
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Alertas</p>
                                        <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
                                    </div>
                                    <Bell className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Activas</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {alerts.filter(a => a.isActive).length}
                                        </p>
                                    </div>
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Precio Alcanzado</p>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {alerts.filter(a => a.currentPrice <= a.targetPrice).length}
                                        </p>
                                    </div>
                                    <TrendingDown className="h-10 w-10 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Ahorro Potencial</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            ${alerts
                                                .reduce((sum, a) => sum + Math.max(0, a.currentPrice - a.targetPrice), 0)
                                                .toLocaleString("es-CL")}
                                        </p>
                                    </div>
                                    <DollarSign className="h-10 w-10 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Alerts Grid */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando alertas...</p>
                            </div>
                        ) : alerts.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No tienes alertas de precio
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Crea alertas para recibir notificaciones cuando los precios bajen
                                    </p>
                                    <Button onClick={() => setShowNewAlertForm(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Primera Alerta
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {alerts.map((alert) => (
                                    <AlertCard key={alert.id} alert={alert} />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Info Card */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-8"
                    >
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">¿Cómo funcionan las alertas?</h3>
                                        <ul className="text-sm text-gray-700 space-y-2">
                                            <li>• Revisamos los precios cada 6 horas automáticamente</li>
                                            <li>• Te notificamos por email cuando el precio alcanza tu objetivo</li>
                                            <li>• Puedes pausar o eliminar alertas en cualquier momento</li>
                                            <li>• Las alertas se desactivan automáticamente después de 30 días</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
