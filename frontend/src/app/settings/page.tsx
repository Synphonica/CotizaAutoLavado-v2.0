"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    CreditCard,
    HelpCircle,
    LogOut,
    Camera,
    Mail,
    Phone,
    MapPin,
    Lock,
    Eye,
    EyeOff,
    ChevronRight,
    Check,
    Moon,
    Sun,
    Smartphone
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("profile");

    // Settings states
    const [notifications, setNotifications] = useState({
        priceAlerts: true,
        bookingReminders: true,
        promotions: true,
        newsletter: false,
        sms: false,
        push: true
    });

    const [privacy, setPrivacy] = useState({
        showProfile: true,
        showFavorites: false,
        shareActivity: false
    });

    const [appearance, setAppearance] = useState({
        theme: 'light',
        language: 'es'
    });

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isLoaded || loading) {
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
                            <SettingsIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h2>
                            <p className="text-gray-600 mb-6">Debes iniciar sesión para acceder a configuración</p>
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

    const settingsSections = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'privacy', label: 'Privacidad', icon: Shield },
        { id: 'appearance', label: 'Apariencia', icon: Palette },
        { id: 'help', label: 'Ayuda', icon: HelpCircle },
    ];

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-white lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#0F9D58]/10 rounded-xl">
                                <SettingsIcon className="h-8 w-8 text-[#0F9D58]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-[#073642]">Configuración</h1>
                                <p className="text-[#073642]/60">Administra tu cuenta y preferencias</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-full lg:w-64 space-y-2"
                        >
                            {settingsSections.map((section) => (
                                <Button
                                    key={section.id}
                                    variant={activeTab === section.id ? 'default' : 'ghost'}
                                    onClick={() => setActiveTab(section.id)}
                                    className={`w-full justify-start ${activeTab === section.id
                                            ? 'bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white'
                                            : 'hover:bg-emerald-50'
                                        }`}
                                >
                                    <section.icon className="h-4 w-4 mr-3" />
                                    {section.label}
                                </Button>
                            ))}

                            <div className="pt-4 border-t border-gray-200">
                                <Button
                                    variant="ghost"
                                    onClick={() => signOut({ redirectUrl: '/' })}
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Cerrar sesión
                                </Button>
                            </div>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1"
                        >
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <Card className="border-emerald-100">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-[#0F9D58]" />
                                            Información del perfil
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Avatar */}
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                                                    {user.imageUrl ? (
                                                        <img src={user.imageUrl} alt={user.fullName || ''} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.firstName?.charAt(0) || 'U'
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 bg-[#0F9D58] hover:bg-[#0F9D58]/90"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-[#073642]">
                                                    {user.fullName || 'Usuario'}
                                                </h3>
                                                <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress}</p>
                                                <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                                                    Cuenta verificada
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Nombre completo</Label>
                                                <Input
                                                    id="name"
                                                    defaultValue={user.fullName || ''}
                                                    className="border-emerald-200 focus:ring-[#0F9D58]"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Correo electrónico</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    defaultValue={user.primaryEmailAddress?.emailAddress || ''}
                                                    disabled
                                                    className="border-emerald-200 bg-gray-50"
                                                />
                                                <p className="text-xs text-gray-500">
                                                    El correo no se puede cambiar desde aquí
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="phone">Teléfono</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+56 9 1234 5678"
                                                    className="border-emerald-200 focus:ring-[#0F9D58]"
                                                />
                                            </div>
                                        </div>

                                        <Button className="bg-[#0F9D58] hover:bg-[#0F9D58]/90">
                                            Guardar cambios
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <Card className="border-emerald-100">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-[#0F9D58]" />
                                            Preferencias de notificaciones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-green-100 rounded-lg">
                                                        <Bell className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#073642]">Alertas de precio</p>
                                                        <p className="text-sm text-gray-500">Notificaciones cuando bajan los precios</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications.priceAlerts}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, priceAlerts: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Bell className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#073642]">Recordatorios de reserva</p>
                                                        <p className="text-sm text-gray-500">Recordatorios antes de tus citas</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications.bookingReminders}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, bookingReminders: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        <Bell className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#073642]">Promociones</p>
                                                        <p className="text-sm text-gray-500">Ofertas especiales y descuentos</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications.promotions}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                                        <Smartphone className="h-5 w-5 text-yellow-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[#073642]">Notificaciones push</p>
                                                        <p className="text-sm text-gray-500">Notificaciones en tu dispositivo</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications.push}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <Card className="border-emerald-100">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-[#0F9D58]" />
                                            Privacidad y seguridad
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-[#073642]">Perfil público</p>
                                                    <p className="text-sm text-gray-500">Permitir que otros vean tu perfil</p>
                                                </div>
                                                <Switch
                                                    checked={privacy.showProfile}
                                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showProfile: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-[#073642]">Mostrar favoritos</p>
                                                    <p className="text-sm text-gray-500">Otros pueden ver tus favoritos</p>
                                                </div>
                                                <Switch
                                                    checked={privacy.showFavorites}
                                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, showFavorites: checked })}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                                                <div>
                                                    <p className="font-medium text-[#073642]">Compartir actividad</p>
                                                    <p className="text-sm text-gray-500">Compartir tu actividad con proveedores</p>
                                                </div>
                                                <Switch
                                                    checked={privacy.shareActivity}
                                                    onCheckedChange={(checked) => setPrivacy({ ...privacy, shareActivity: checked })}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 space-y-3">
                                            <Button variant="outline" className="w-full justify-between border-emerald-200">
                                                <span className="flex items-center gap-2">
                                                    <Lock className="h-4 w-4" />
                                                    Cambiar contraseña
                                                </span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>

                                            <Button variant="outline" className="w-full justify-between text-red-500 border-red-200 hover:bg-red-50">
                                                <span>Eliminar cuenta</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <Card className="border-emerald-100">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Palette className="h-5 w-5 text-[#0F9D58]" />
                                            Apariencia
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <Label className="mb-3 block">Tema</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'light', label: 'Claro', icon: Sun },
                                                    { id: 'dark', label: 'Oscuro', icon: Moon },
                                                    { id: 'system', label: 'Sistema', icon: Smartphone },
                                                ].map((theme) => (
                                                    <Button
                                                        key={theme.id}
                                                        variant={appearance.theme === theme.id ? 'default' : 'outline'}
                                                        onClick={() => setAppearance({ ...appearance, theme: theme.id })}
                                                        className={`flex flex-col items-center gap-2 h-auto py-4 ${appearance.theme === theme.id
                                                                ? 'bg-[#0F9D58] hover:bg-[#0F9D58]/90'
                                                                : 'border-emerald-200'
                                                            }`}
                                                    >
                                                        <theme.icon className="h-5 w-5" />
                                                        {theme.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="mb-3 block">Idioma</Label>
                                            <select
                                                value={appearance.language}
                                                onChange={(e) => setAppearance({ ...appearance, language: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-[#0F9D58] focus:border-[#0F9D58]"
                                            >
                                                <option value="es">Español</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Help Tab */}
                            {activeTab === 'help' && (
                                <Card className="border-emerald-100">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <HelpCircle className="h-5 w-5 text-[#0F9D58]" />
                                            Ayuda y soporte
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between border-emerald-200 hover:bg-emerald-50"
                                            onClick={() => window.location.href = '/help'}
                                        >
                                            <span className="flex items-center gap-2">
                                                <HelpCircle className="h-4 w-4" />
                                                Centro de ayuda
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-between border-emerald-200 hover:bg-emerald-50"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Contactar soporte
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-between border-emerald-200 hover:bg-emerald-50"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Términos y condiciones
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-between border-emerald-200 hover:bg-emerald-50"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Lock className="h-4 w-4" />
                                                Política de privacidad
                                            </span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                                            <p>Alto Carwash v1.0.0</p>
                                            <p>© 2024 Todos los derechos reservados</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}
