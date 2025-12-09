"use client";

import { useState, useEffect } from "react";
import { useProvider, UpdateProviderDto } from "@/hooks/useProvider";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Building, MapPin, Phone, Mail, Globe, Instagram, Facebook, Clock, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProviderSettingsPage() {
    const router = useRouter();
    const { provider, loading, updateProvider, hasProvider } = useProvider();
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UpdateProviderDto>({});

    useEffect(() => {
        if (!loading && !hasProvider) {
            router.push('/provider/onboarding');
        }
    }, [loading, hasProvider, router]);

    useEffect(() => {
        if (provider) {
            setFormData({
                businessName: provider.businessName,
                businessType: provider.businessType,
                description: provider.description,
                phone: provider.phone,
                email: provider.email,
                website: provider.website,
                instagram: provider.instagram,
                facebook: provider.facebook,
                twitter: provider.twitter,
                address: provider.address,
                city: provider.city,
                region: provider.region,
                postalCode: provider.postalCode,
                acceptsBookings: provider.acceptsBookings,
                minAdvanceBooking: provider.minAdvanceBooking,
                maxAdvanceBooking: provider.maxAdvanceBooking,
            });
        }
    }, [provider]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await updateProvider(formData);
            toast.success('Configuración actualizada correctamente');
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !provider) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Negocio</h1>
                        <p className="text-gray-600">Administra la información de tu autolavado</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Información Básica */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Información Básica
                                </CardTitle>
                                <CardDescription>
                                    Información general de tu negocio
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="businessName">Nombre del Negocio *</Label>
                                        <Input
                                            id="businessName"
                                            value={formData.businessName || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, businessName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="businessType">Tipo de Negocio *</Label>
                                        <Input
                                            id="businessType"
                                            value={formData.businessType || ''}
                                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Describe tu negocio y los servicios que ofreces..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contacto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Información de Contacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ubicación */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Ubicación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address || ''}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">Ciudad *</Label>
                                        <Input
                                            id="city"
                                            value={formData.city || ''}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="region">Región *</Label>
                                        <Input
                                            id="region"
                                            value={formData.region || ''}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Código Postal</Label>
                                        <Input
                                            id="postalCode"
                                            value={formData.postalCode || ''}
                                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Redes Sociales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Redes Sociales y Web
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Sitio Web</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            value={formData.website || ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="instagram">Instagram</Label>
                                        <Input
                                            id="instagram"
                                            value={formData.instagram || ''}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            placeholder="@usuario"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook">Facebook</Label>
                                        <Input
                                            id="facebook"
                                            value={formData.facebook || ''}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="twitter">Twitter/X</Label>
                                        <Input
                                            id="twitter"
                                            value={formData.twitter || ''}
                                            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                            placeholder="@usuario"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Configuración de Reservas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Configuración de Reservas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Aceptar Reservas</Label>
                                        <p className="text-sm text-gray-500">
                                            Permitir que los clientes reserven servicios
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.acceptsBookings}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, acceptsBookings: checked })
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minAdvanceBooking">
                                            Anticipación Mínima (minutos)
                                        </Label>
                                        <Input
                                            id="minAdvanceBooking"
                                            type="number"
                                            value={formData.minAdvanceBooking || 60}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    minAdvanceBooking: parseInt(e.target.value)
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxAdvanceBooking">
                                            Anticipación Máxima (minutos)
                                        </Label>
                                        <Input
                                            id="maxAdvanceBooking"
                                            type="number"
                                            value={formData.maxAdvanceBooking || 10080}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    maxAdvanceBooking: parseInt(e.target.value)
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Botones de acción */}
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push('/provider')}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                style={{ backgroundColor: '#0F9D58', color: 'white' }}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
