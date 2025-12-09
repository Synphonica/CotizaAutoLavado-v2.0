"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
    Bell,
    DollarSign,
    TrendingDown,
    Star,
    CheckCircle,
    AlertCircle,
    Info,
    Trash2,
    Check,
} from "lucide-react";
import { apiGet, apiPut, apiDelete } from "@/lib/api";

interface Notification {
    id: string;
    type: "PRICE_DROP" | "NEW_OFFER" | "BOOKING_REMINDER" | "SYSTEM_UPDATE" | "NEW_REVIEW";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
}

export default function NotificationsPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);

            // TODO: Descomentar cuando el backend esté listo
            // const token = await getToken();
            // if (!token) {
            //     console.error("No token available");
            //     setLoading(false);
            //     return;
            // }
            // const data = await apiGet<Notification[]>("/notifications", { token });
            // setNotifications(data);

            // Mock data para desarrollo
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications([
                {
                    id: "1",
                    type: "PRICE_DROP",
                    title: "¡Bajó el precio!",
                    message: "El servicio 'Lavado Premium' de AutoClean Pro bajó a $12.000",
                    isRead: false,
                    createdAt: "2025-11-24T10:00:00Z",
                    actionUrl: "/services/s1",
                },
                {
                    id: "2",
                    type: "BOOKING_REMINDER",
                    title: "Recordatorio de Reserva",
                    message: "Tu cita de lavado es mañana a las 10:00 AM",
                    isRead: false,
                    createdAt: "2025-11-24T08:00:00Z",
                },
                {
                    id: "3",
                    type: "NEW_OFFER",
                    title: "Nueva Oferta Disponible",
                    message: "Car Spa Elite tiene 20% de descuento este fin de semana",
                    isRead: true,
                    createdAt: "2025-11-23T15:00:00Z",
                    actionUrl: "/services/s2",
                },
                {
                    id: "4",
                    type: "SYSTEM_UPDATE",
                    title: "Actualización del Sistema",
                    message: "Hemos mejorado la búsqueda de servicios",
                    isRead: true,
                    createdAt: "2025-11-22T12:00:00Z",
                },
            ]);
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const token = await getToken();
            await apiPut(`/notifications/${notificationId}`, { isRead: true }, { token });
            setNotifications(
                notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = await getToken();
            await apiPut("/notifications/mark-all-read", {}, { token });
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            const token = await getToken();
            await apiDelete(`/notifications/${notificationId}`, { token });
            setNotifications(notifications.filter((n) => n.id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "PRICE_DROP":
                return <TrendingDown className="h-5 w-5 text-orange-500" />;
            case "NEW_OFFER":
                return <DollarSign className="h-5 w-5 text-green-500" />;
            case "BOOKING_REMINDER":
                return <Bell className="h-5 w-5 text-blue-500" />;
            case "NEW_REVIEW":
                return <Star className="h-5 w-5 text-yellow-500" />;
            case "SYSTEM_UPDATE":
                return <Info className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter((n) => !n.isRead)
            : notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const NotificationCard = ({ notification }: { notification: Notification }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card
                className={`${!notification.isRead ? "bg-blue-50 border-blue-200" : ""
                    } hover:shadow-md transition-shadow`}
            >
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${!notification.isRead ? "bg-white" : "bg-gray-100"}`}>
                            {getIcon(notification.type)}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                    {!notification.isRead && (
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            Nueva
                                        </Badge>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleDateString("es-CL", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

                            <div className="flex gap-2">
                                {!notification.isRead && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Marcar leída
                                    </Button>
                                )}
                                {notification.actionUrl && (
                                    <Button variant="outline" size="sm">
                                        Ver más
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(notification.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <ProtectedRoute>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificaciones</h1>
                                <p className="text-gray-600">
                                    {unreadCount} {unreadCount === 1 ? "notificación sin leer" : "notificaciones sin leer"}
                                </p>
                            </div>

                            {unreadCount > 0 && (
                                <Button onClick={handleMarkAllAsRead} variant="outline">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                    >
                        <Tabs defaultValue="all" className="space-y-6" onValueChange={(v) => setFilter(v as any)}>
                            <TabsList>
                                <TabsTrigger value="all">
                                    Todas ({notifications.length})
                                </TabsTrigger>
                                <TabsTrigger value="unread">
                                    Sin leer ({unreadCount})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={filter} className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-600 mt-4">Cargando notificaciones...</p>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-12 text-center">
                                            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {filter === "unread"
                                                    ? "No tienes notificaciones sin leer"
                                                    : "No tienes notificaciones"}
                                            </h3>
                                            <p className="text-gray-600">
                                                {filter === "unread"
                                                    ? "¡Genial! Estás al día con todas tus notificaciones"
                                                    : "Te notificaremos sobre ofertas, recordatorios y más"}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    filteredNotifications.map((notification) => (
                                        <NotificationCard key={notification.id} notification={notification} />
                                    ))
                                )}
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
