"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
    History,
    Star,
    MapPin,
    DollarSign,
    Calendar,
    CheckCircle,
    TrendingUp,
    Award,
    Download,
} from "lucide-react";
import { apiGet } from "@/lib/api";

interface HistoryItem {
    id: string;
    serviceName: string;
    providerName: string;
    date: string;
    price: number;
    rating?: number;
    status: "COMPLETED" | "CANCELLED";
    address: string;
}

export default function HistoryPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadHistory = async () => {
        try {
            setLoading(true);

            // TODO: Descomentar cuando el backend esté listo
            // const token = await getToken();
            // if (!token) {
            //     console.error("No token available");
            //     setLoading(false);
            //     return;
            // }
            // const data = await apiGet<HistoryItem[]>("/bookings/history", { token });
            // setHistory(data);

            // Mock data para desarrollo
            await new Promise(resolve => setTimeout(resolve, 500));
            setHistory([
                {
                    id: "1",
                    serviceName: "Lavado Premium",
                    providerName: "AutoClean Pro",
                    date: "2025-11-15",
                    price: 15000,
                    rating: 5,
                    status: "COMPLETED",
                    address: "Av. Providencia 1234",
                },
                {
                    id: "2",
                    serviceName: "Lavado Express",
                    providerName: "Quick Wash",
                    date: "2025-11-01",
                    price: 8000,
                    rating: 4,
                    status: "COMPLETED",
                    address: "Av. Vicuña Mackenna 890",
                },
                {
                    id: "3",
                    serviceName: "Detailing Completo",
                    providerName: "Car Spa Elite",
                    date: "2025-10-20",
                    price: 45000,
                    status: "CANCELLED",
                    address: "Av. Las Condes 5678",
                },
            ]);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoading(false);
        }
    };

    const completedBookings = history.filter(h => h.status === "COMPLETED");
    const totalSpent = completedBookings.reduce((sum, h) => sum + h.price, 0);
    const averageRating = completedBookings.filter(h => h.rating).reduce((sum, h) => sum + (h.rating || 0), 0) / completedBookings.filter(h => h.rating).length || 0;

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
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Servicios</h1>
                                <p className="text-gray-600">{history.length} servicios en total</p>
                            </div>
                            <Button variant="outline" disabled>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar PDF
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats */}
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
                                        <p className="text-sm text-gray-600">Servicios Usados</p>
                                        <p className="text-3xl font-bold text-blue-600">{completedBookings.length}</p>
                                    </div>
                                    <CheckCircle className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Gastado</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            ${totalSpent.toLocaleString("es-CL")}
                                        </p>
                                    </div>
                                    <DollarSign className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Rating Promedio</p>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {averageRating.toFixed(1)}
                                        </p>
                                    </div>
                                    <Star className="h-10 w-10 text-yellow-600 fill-current" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Gasto Promedio</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            ${Math.round(totalSpent / completedBookings.length || 0).toLocaleString("es-CL")}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* History List */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="space-y-4"
                    >
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-4">Cargando historial...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin historial</h3>
                                    <p className="text-gray-600">No tienes servicios completados aún</p>
                                </CardContent>
                            </Card>
                        ) : (
                            history.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{item.serviceName}</h3>
                                                    {item.status === "COMPLETED" ? (
                                                        <Badge className="bg-green-500 text-white">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Completado
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Cancelado</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                                                    <MapPin className="h-4 w-4" />
                                                    {item.providerName} • {item.address}
                                                </p>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="h-4 w-4 text-blue-500" />
                                                        <span className="text-gray-700">
                                                            {new Date(item.date).toLocaleDateString("es-CL", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="h-4 w-4 text-green-500" />
                                                        <span className="text-gray-700 font-semibold">
                                                            ${item.price.toLocaleString("es-CL")}
                                                        </span>
                                                    </div>

                                                    {item.rating && (
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < item.rating!
                                                                        ? "fill-yellow-400 text-yellow-400"
                                                                        : "text-gray-300"
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {item.status === "COMPLETED" && (
                                                <Button variant="outline" size="sm">
                                                    Volver a Reservar
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
