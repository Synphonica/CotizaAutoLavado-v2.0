"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { notificationsApi, type NotificationPreference } from '@/lib/api/notifications';

const notificationTypes = [
    {
        type: 'PRICE_DROP',
        label: 'Bajadas de precio',
        description: 'Recibe notificaciones cuando un servicio baja de precio'
    },
    {
        type: 'NEW_OFFER',
        label: 'Nuevas ofertas',
        description: 'Entérate de nuevas ofertas y promociones'
    },
    {
        type: 'NEW_PROVIDER',
        label: 'Nuevos proveedores',
        description: 'Descubre cuando se agregan nuevos autolavados'
    },
    {
        type: 'SYSTEM_UPDATE',
        label: 'Actualizaciones del sistema',
        description: 'Recibe avisos sobre mejoras y novedades de la plataforma'
    }
];

export function NotificationSettings() {
    const [preferences, setPreferences] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [allEnabled, setAllEnabled] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            setLoading(true);
            const response = await notificationsApi.getMyPreferences();

            const prefsMap: Record<string, boolean> = {};
            response.preferences.forEach((pref: NotificationPreference) => {
                prefsMap[pref.type] = pref.enabled;
            });

            setPreferences(prefsMap);
            setAllEnabled(response.allEnabled);
        } catch (error) {
            console.error('Error loading preferences:', error);
            toast.error('Error al cargar preferencias');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (type: string, enabled: boolean) => {
        try {
            setSaving(true);
            await notificationsApi.updatePreference(type, enabled);

            setPreferences(prev => ({
                ...prev,
                [type]: enabled
            }));

            // Check if all are now enabled
            const newPrefs = { ...preferences, [type]: enabled };
            const allAreEnabled = Object.values(newPrefs).every(v => v === true);
            setAllEnabled(allAreEnabled);

            toast.success(
                enabled
                    ? 'Notificaciones activadas'
                    : 'Notificaciones desactivadas'
            );
        } catch (error) {
            console.error('Error updating preference:', error);
            toast.error('Error al actualizar preferencia');
        } finally {
            setSaving(false);
        }
    };

    const handleEnableAll = async () => {
        try {
            setSaving(true);
            const response = await notificationsApi.enableAllPreferences();

            const prefsMap: Record<string, boolean> = {};
            response.preferences.forEach((pref: NotificationPreference) => {
                prefsMap[pref.type] = pref.enabled;
            });

            setPreferences(prefsMap);
            setAllEnabled(true);
            toast.success('Todas las notificaciones activadas');
        } catch (error) {
            console.error('Error enabling all:', error);
            toast.error('Error al activar notificaciones');
        } finally {
            setSaving(false);
        }
    };

    const handleDisableAll = async () => {
        try {
            setSaving(true);
            const response = await notificationsApi.disableAllPreferences();

            const prefsMap: Record<string, boolean> = {};
            response.preferences.forEach((pref: NotificationPreference) => {
                prefsMap[pref.type] = pref.enabled;
            });

            setPreferences(prefsMap);
            setAllEnabled(false);
            toast.success('Todas las notificaciones desactivadas');
        } catch (error) {
            console.error('Error disabling all:', error);
            toast.error('Error al desactivar notificaciones');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Configuración de Notificaciones
                        </CardTitle>
                        <CardDescription>
                            Personaliza qué notificaciones deseas recibir
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEnableAll}
                            disabled={saving || allEnabled}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Activar todas
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDisableAll}
                            disabled={saving || !Object.values(preferences).some(v => v)}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Desactivar todas
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {notificationTypes.map((notifType) => (
                    <div
                        key={notifType.type}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                {preferences[notifType.type] ? (
                                    <Bell className="h-5 w-5 text-blue-600" />
                                ) : (
                                    <BellOff className="h-5 w-5 text-gray-400" />
                                )}
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {notifType.label}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {notifType.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Switch
                            checked={preferences[notifType.type] || false}
                            onCheckedChange={(checked) => handleToggle(notifType.type, checked)}
                            disabled={saving}
                        />
                    </div>
                ))}

                {Object.values(preferences).every(v => v === false) && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <BellOff className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                                    Todas las notificaciones están desactivadas
                                </h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    No recibirás ninguna notificación. Activa al menos una para mantenerte informado.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
