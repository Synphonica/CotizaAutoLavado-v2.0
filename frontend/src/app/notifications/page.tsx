"use client";

import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/NotificationSettings";
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
  X,
  Loader2
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import type { Notification } from "@/lib/api/notifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'PRICE_ALERT':
    case 'PRICE_DROP':
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    case 'BOOKING_CONFIRMATION':
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case 'REVIEW_RESPONSE':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'NEW_OFFER':
      return <AlertCircle className="h-5 w-5 text-purple-500" />;
    case 'SYSTEM_UPDATE':
    case 'NEW_PROVIDER':
      return <Info className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case 'PRICE_ALERT':
    case 'PRICE_DROP':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Precio</Badge>;
    case 'BOOKING_CONFIRMATION':
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Reserva</Badge>;
    case 'REVIEW_RESPONSE':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Reseña</Badge>;
    case 'NEW_OFFER':
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Promoción</Badge>;
    case 'SYSTEM_UPDATE':
    case 'NEW_PROVIDER':
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
  const [filter, setFilter] = useState<'all' | 'unread' | 'settings'>('all');

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification: handleDelete,
    deleteAllNotifications,
  } = useNotifications();

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications; if (!isLoaded) {
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
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread' | 'settings')}>
              <TabsList className="bg-white border border-emerald-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                  Todas ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                  Sin leer ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </TabsTrigger>
              </TabsList>

              {/* Tab Content - Notifications */}
              <TabsContent value="all" className="mt-6">
                {renderNotificationsList()}
              </TabsContent>

              <TabsContent value="unread" className="mt-6">
                {renderNotificationsList()}
              </TabsContent>

              {/* Tab Content - Settings */}
              <TabsContent value="settings" className="mt-6">
                <NotificationSettings />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  );

  function renderNotificationsList() {
    return (
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
                className={`border-emerald-100 hover:shadow-md transition-all cursor-pointer ${!notification.read ? 'bg-emerald-50/50 border-l-4 border-l-[#0F9D58]' : ''
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
    );
  }
}

const clearAll = async () => {
  if (confirm('¿Estás seguro de que deseas eliminar todas las notificaciones?')) {
    await deleteAllNotifications();
  }
};

return (
  <>
    <ModernNavbar />
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
      {/* Existing content from line 140 onwards */}
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
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread' | 'settings')}>
            <TabsList className="bg-white border border-emerald-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                Sin leer ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-[#0F9D58] data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Notifications */}
            <TabsContent value="all" className="mt-6">
              {renderNotificationsList()}

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
            </TabsContent>

            <TabsContent value="unread" className="mt-6">
              {renderNotificationsList()}
            </TabsContent>

            {/* Tab Content - Settings */}
            <TabsContent value="settings" className="mt-6">
              <NotificationSettings />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  </>
);
  }
}
