"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellOff, 
  Check, 
  Trash2, 
  Settings, 
  TrendingDown, 
  Calendar, 
  Star,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { apiGet, apiPut, apiDelete } from "@/lib/api";

interface Notification {
  id: string;
  type: 'price_alert' | 'booking' | 'review' | 'system' | 'promotion';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    serviceId?: string;
    providerId?: string;
    bookingId?: string;
    oldPrice?: number;
    newPrice?: number;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "price_alert",
    title: "¡Alerta de precio!",
    message: "El servicio 'Lavado Premium' en AutoClean Pro bajó de $18.000 a $15.000",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    data: { serviceId: "1", oldPrice: 18000, newPrice: 15000 }
  },
  {
    id: "2",
    type: "booking",
    title: "Reserva confirmada",
    message: "Tu reserva para mañana a las 10:00 AM en SparkleWash ha sido confirmada",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data: { bookingId: "b1" }
  },
  {
    id: "3",
    type: "review",
    title: "Nueva respuesta a tu reseña",
    message: "AutoClean Pro respondió a tu reseña del servicio 'Lavado Completo'",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    data: { providerId: "p1" }
  },
  {
    id: "4",
    type: "promotion",
    title: "¡Oferta especial!",
    message: "20% de descuento en todos los servicios de detailing este fin de semana",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "5",
    type: "system",
    title: "Actualización del sistema",
    message: "Hemos mejorado la búsqueda de autolavados cercanos. ¡Pruébalo!",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'price_alert':
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    case 'booking':
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case 'review':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'promotion':
      return <AlertCircle className="h-5 w-5 text-purple-500" />;
    case 'system':
      return <Info className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationBadge = (type: Notification['type']) => {
  switch (type) {
    case 'price_alert':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Precio</Badge>;
    case 'booking':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Reserva</Badge>;
    case 'review':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Reseña</Badge>;
    case 'promotion':
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Promoción</Badge>;
    case 'system':
      return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Sistema</Badge>;
    default:
      return null;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Hace un momento";
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  return date.toLocaleDateString('es-CL');
};

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isLoaded) {
    return (
      <>
        <ModernNavbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D58]"></div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <ModernNavbar />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 transition-all duration-300 flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
              <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus notificaciones</p>
              <Button 
                onClick={() => window.location.href = '/sign-in'}
                className="bg-[#0F9D58] hover:bg-[#0F9D58]/90"
              >
                Iniciar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0F9D58]/10 rounded-xl">
                  <Bell className="h-8 w-8 text-[#0F9D58]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#073642]">Notificaciones</h1>
                  <p className="text-[#073642]/60">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="border-emerald-200 hover:bg-emerald-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar todas como leídas
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/alerts'}
                  className="border-emerald-200 hover:bg-emerald-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar alertas
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
              <TabsList className="bg-white border border-emerald-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                  Todas ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                  Sin leer ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card className="border-emerald-100">
                <CardContent className="p-12 text-center">
                  <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? '¡Genial! Estás al día con todas tus notificaciones'
                      : 'Aquí aparecerán tus alertas de precios, reservas y más'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`border-emerald-100 hover:shadow-md transition-all cursor-pointer ${
                      !notification.read ? 'bg-emerald-50/50 border-l-4 border-l-[#0F9D58]' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${!notification.read ? 'text-[#073642]' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                {getNotificationBadge(notification.type)}
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-[#0F9D58] rounded-full"></span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notification.createdAt)}</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-emerald-100"
                                >
                                  <Check className="h-4 w-4 text-[#0F9D58]" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Clear All */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <Button
                variant="ghost"
                onClick={clearAll}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Borrar todas las notificaciones
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
