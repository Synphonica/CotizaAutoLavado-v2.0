'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
    Building2, MapPin, Upload, CheckCircle, AlertCircle,
    Car, Sparkles, ShieldCheck, BadgeCheck, Clock, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const serviceCategories = [
    { id: 'exterior', name: 'Lavado Exterior', icon: Car },
    { id: 'interior', name: 'Lavado Interior', icon: Sparkles },
    { id: 'complete', name: 'Lavado Completo', icon: BadgeCheck },
    { id: 'express', name: 'Lavado Express', icon: Clock },
];

const regions = [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Biobío',
    'Región de Los Lagos',
    'Región de Antofagasta',
    'Región de Coquimbo',
    'Región de La Araucanía',
    'Región de Maule',
    'Otras regiones'
];

export default function ProviderOnboardingPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        businessName: '',
        businessRut: '',
        businessPhone: user?.primaryPhoneNumber?.phoneNumber || '',
        businessAddress: '',
        businessCity: '',
        businessRegion: '',
        services: [] as string[],
        logo: null as File | null,
        description: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.businessName) newErrors.businessName = 'Nombre requerido';
            if (!formData.businessRut) newErrors.businessRut = 'RUT requerido';
            if (!formData.businessPhone) newErrors.businessPhone = 'Teléfono requerido';
            if (!formData.businessAddress) newErrors.businessAddress = 'Dirección requerida';
            if (!formData.businessCity) newErrors.businessCity = 'Ciudad requerida';
            if (!formData.businessRegion) newErrors.businessRegion = 'Región requerida';
        }

        if (currentStep === 2) {
            if (formData.services.length === 0) {
                newErrors.services = 'Selecciona al menos un tipo de servicio';
            }
            if (!formData.description) newErrors.description = 'Descripción requerida';
            if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, logo: 'El archivo debe ser menor a 5MB' });
                return;
            }
            setFormData({ ...formData, logo: file });
            setErrors({ ...errors, logo: '' });
        }
    };

    const toggleService = (serviceId: string) => {
        const newServices = formData.services.includes(serviceId)
            ? formData.services.filter((s) => s !== serviceId)
            : [...formData.services, serviceId];
        setFormData({ ...formData, services: newServices });
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        if (!user) return;

        setIsLoading(true);

        try {
            const token = await getToken();

            // Sincronizar con backend enviando rol PROVIDER + datos del negocio
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/clerk/sync-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clerkId: user.id,
                    userData: {
                        email: user.primaryEmailAddress?.emailAddress,
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: formData.businessPhone,
                        role: 'PROVIDER', // ⬅️ Aquí especificamos que es provider
                        providerData: {
                            businessName: formData.businessName,
                            businessType: 'CAR_WASH',
                            description: formData.description,
                            address: formData.businessAddress,
                            city: formData.businessCity,
                            region: formData.businessRegion,
                            latitude: 0, // TODO: Geocoding con Google Maps
                            longitude: 0,
                        },
                    },
                }),
            });

            if (!response.ok) {
                throw new Error('Error al registrar el proveedor');
            }

            // Redirigir al dashboard del proveedor
            router.push('/provider?registered=true');
        } catch (error) {
            console.error('Error:', error);
            setErrors({ submit: 'Error al registrar. Intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D58]"></div>
            </div>
        );
    }

    if (!user) {
        router.push('/sign-in?redirect_url=/provider/onboarding');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-2xl flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-[#073642] dark:text-white">
                            Completa tu Perfil de Proveedor
                        </h1>
                    </div>
                    <p className="text-[#073642]/70 dark:text-gray-300">
                        Ya iniciaste sesión con <strong>{user.primaryEmailAddress?.emailAddress}</strong>
                    </p>
                </motion.div>

                {/* Stepper */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                    ? 'bg-[#0F9D58] text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                            >
                                {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                            </div>
                            {s < 2 && (
                                <div
                                    className={`w-24 h-1 mx-2 transition-all ${step > s ? 'bg-[#0F9D58]' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Steps */}
                <Card className="border-2 border-[#0F9D58]/20">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">
                            {step === 1 && 'Datos del Negocio'}
                            {step === 2 && 'Servicios y Descripción'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Step 1: Datos del negocio */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                        Nombre del Negocio *
                                    </label>
                                    <Input
                                        placeholder="Ej: Autolavado Pro"
                                        value={formData.businessName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, businessName: e.target.value })
                                        }
                                        className={errors.businessName ? 'border-red-500' : ''}
                                    />
                                    {errors.businessName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                            RUT *
                                        </label>
                                        <Input
                                            placeholder="12.345.678-9"
                                            value={formData.businessRut}
                                            onChange={(e) =>
                                                setFormData({ ...formData, businessRut: e.target.value })
                                            }
                                            className={errors.businessRut ? 'border-red-500' : ''}
                                        />
                                        {errors.businessRut && (
                                            <p className="text-red-500 text-sm mt-1">{errors.businessRut}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                            Teléfono *
                                        </label>
                                        <Input
                                            placeholder="+56912345678"
                                            value={formData.businessPhone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, businessPhone: e.target.value })
                                            }
                                            className={errors.businessPhone ? 'border-red-500' : ''}
                                        />
                                        {errors.businessPhone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.businessPhone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                        Dirección *
                                    </label>
                                    <Input
                                        placeholder="Av. Principal 123"
                                        value={formData.businessAddress}
                                        onChange={(e) =>
                                            setFormData({ ...formData, businessAddress: e.target.value })
                                        }
                                        className={errors.businessAddress ? 'border-red-500' : ''}
                                    />
                                    {errors.businessAddress && (
                                        <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                            Ciudad *
                                        </label>
                                        <Input
                                            placeholder="Santiago"
                                            value={formData.businessCity}
                                            onChange={(e) =>
                                                setFormData({ ...formData, businessCity: e.target.value })
                                            }
                                            className={errors.businessCity ? 'border-red-500' : ''}
                                        />
                                        {errors.businessCity && (
                                            <p className="text-red-500 text-sm mt-1">{errors.businessCity}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                            Región *
                                        </label>
                                        <select
                                            value={formData.businessRegion}
                                            onChange={(e) =>
                                                setFormData({ ...formData, businessRegion: e.target.value })
                                            }
                                            className={`w-full px-4 py-2 border rounded-lg ${errors.businessRegion ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Selecciona región</option>
                                            {regions.map((region) => (
                                                <option key={region} value={region}>
                                                    {region}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.businessRegion && (
                                            <p className="text-red-500 text-sm mt-1">{errors.businessRegion}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleNext}
                                        className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] font-bold"
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Servicios */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-4">
                                        Tipos de Servicio *
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {serviceCategories.map((category) => (
                                            <div
                                                key={category.id}
                                                onClick={() => toggleService(category.id)}
                                                className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${formData.services.includes(category.id)
                                                    ? 'border-[#0F9D58] bg-[#0F9D58]/10'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#0F9D58]/50'
                                                    }`}
                                            >
                                                <category.icon className="h-8 w-8 text-[#0F9D58] mb-2" />
                                                <p className="font-semibold text-[#073642] dark:text-white">
                                                    {category.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.services && (
                                        <p className="text-red-500 text-sm mt-2">{errors.services}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#073642] dark:text-white mb-2">
                                        Descripción del Negocio *
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Describe tu autolavado, servicios especiales, horarios, etc."
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex items-start gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.acceptTerms}
                                        onChange={(e) =>
                                            setFormData({ ...formData, acceptTerms: e.target.checked })
                                        }
                                        className="mt-1"
                                    />
                                    <label className="text-sm text-[#073642]/70 dark:text-gray-300">
                                        Acepto los términos y condiciones de Alto Carwash. Mi cuenta será
                                        revisada y aprobada por el equipo.
                                    </label>
                                </div>
                                {errors.acceptTerms && (
                                    <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                                )}

                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-700 text-sm">{errors.submit}</p>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        className="border-2 border-[#0F9D58] text-[#0F9D58]"
                                    >
                                        Atrás
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-bold"
                                    >
                                        {isLoading ? 'Registrando...' : 'Completar Registro'}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
