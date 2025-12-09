"use client";

import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Globe,
  Mail,
  Smartphone,
} from "lucide-react";
import { apiPut } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      priceDrops: true,
      newOffers: true,
      newsletter: false,
      bookingReminders: true,
    },
    preferences: {
      language: "es",
      currency: "CLP",
      distanceUnit: "km",
      defaultSearchRadius: 10,
    },
  });

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      const token = await getToken();
      await apiPut("/users/settings", newSettings, { token });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleToggle = (category: string, key: string) => {
    setSettings((prev: any) => {
      const newSettings = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !prev[category][key],
        },
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  return (
    <ProtectedRoute>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
            <p className="text-gray-600">Personaliza tu experiencia en Alto Carwash</p>
          </motion.div>

          <div className="space-y-6">
            {/* Notifications Settings */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Bell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Notificaciones</CardTitle>
                      <CardDescription>Administra cómo y cuándo recibir notificaciones</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="emailAlerts" className="font-medium text-gray-900 cursor-pointer">Alertas por Email</Label>
                        <p className="text-sm text-gray-500">Recibe notificaciones en tu correo</p>
                      </div>
                    </div>
                    <Switch
                      id="emailAlerts"
                      checked={settings.notifications.emailAlerts}
                      onCheckedChange={() => handleToggle("notifications", "emailAlerts")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Smartphone className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="pushNotifications" className="font-medium text-gray-900 cursor-pointer">Notificaciones Push</Label>
                        <p className="text-sm text-gray-500">Recibe alertas en tu navegador</p>
                      </div>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={() => handleToggle("notifications", "pushNotifications")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Bell className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="priceDrops" className="font-medium text-gray-900 cursor-pointer">Bajadas de Precio</Label>
                        <p className="text-sm text-gray-500">Alertas cuando bajan los precios</p>
                      </div>
                    </div>
                    <Switch
                      id="priceDrops"
                      checked={settings.notifications.priceDrops}
                      onCheckedChange={() => handleToggle("notifications", "priceDrops")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Bell className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <Label htmlFor="newOffers" className="font-medium text-gray-900 cursor-pointer">Nuevas Ofertas</Label>
                        <p className="text-sm text-gray-500">Promociones y descuentos</p>
                      </div>
                    </div>
                    <Switch
                      id="newOffers"
                      checked={settings.notifications.newOffers}
                      onCheckedChange={() => handleToggle("notifications", "newOffers")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Mail className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <Label htmlFor="newsletter" className="font-medium text-gray-900 cursor-pointer">Newsletter Semanal</Label>
                        <p className="text-sm text-gray-500">Resumen semanal de ofertas</p>
                      </div>
                    </div>
                    <Switch
                      id="newsletter"
                      checked={settings.notifications.newsletter}
                      onCheckedChange={() => handleToggle("notifications", "newsletter")}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-pink-50 rounded-lg">
                        <Bell className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <Label htmlFor="bookingReminders" className="font-medium text-gray-900 cursor-pointer">Recordatorios de Reservas</Label>
                        <p className="text-sm text-gray-500">24h antes de tu cita</p>
                      </div>
                    </div>
                    <Switch
                      id="bookingReminders"
                      checked={settings.notifications.bookingReminders}
                      onCheckedChange={() => handleToggle("notifications", "bookingReminders")}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Preferencias Generales</CardTitle>
                      <CardDescription>Personaliza la aplicación según tus necesidades</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Globe className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <Label htmlFor="language" className="font-medium text-gray-900 cursor-pointer">Idioma</Label>
                        <p className="text-sm text-gray-500">Selecciona tu idioma preferido</p>
                      </div>
                    </div>
                    <select
                      id="language"
                      value={settings.preferences.language}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          preferences: { ...settings.preferences, language: e.target.value },
                        };
                        setSettings(newSettings);
                        saveSettings(newSettings);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="font-medium text-gray-900 cursor-pointer">Moneda</Label>
                        <p className="text-sm text-gray-500">Formato de precios</p>
                      </div>
                    </div>
                    <select
                      id="currency"
                      value={settings.preferences.currency}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          preferences: { ...settings.preferences, currency: e.target.value },
                        };
                        setSettings(newSettings);
                        saveSettings(newSettings);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="CLP">CLP ($)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Globe className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <Label htmlFor="distanceUnit" className="font-medium text-gray-900 cursor-pointer">Unidad de Distancia</Label>
                        <p className="text-sm text-gray-500">Kilómetros o Millas</p>
                      </div>
                    </div>
                    <select
                      id="distanceUnit"
                      value={settings.preferences.distanceUnit}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          preferences: { ...settings.preferences, distanceUnit: e.target.value },
                        };
                        setSettings(newSettings);
                        saveSettings(newSettings);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="km">Kilómetros</option>
                      <option value="mi">Millas</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-orange-50 rounded-lg">
                        <Globe className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <Label htmlFor="searchRadius" className="font-medium text-gray-900 cursor-pointer">Radio de Búsqueda</Label>
                        <p className="text-sm text-gray-500">Distancia predeterminada para búsquedas</p>
                      </div>
                    </div>
                    <select
                      id="searchRadius"
                      value={settings.preferences.defaultSearchRadius}
                      onChange={(e) => {
                        const newSettings = {
                          ...settings,
                          preferences: { ...settings.preferences, defaultSearchRadius: Number(e.target.value) },
                        };
                        setSettings(newSettings);
                        saveSettings(newSettings);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>


          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
