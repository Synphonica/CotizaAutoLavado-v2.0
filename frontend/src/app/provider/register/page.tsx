'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building2, Mail, Phone, MapPin, User, Lock, Upload,
    Eye, EyeOff, CheckCircle, AlertCircle, Clock, Car,
    Sparkles, ShieldCheck, BadgeCheck
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

export default function ProviderRegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        // Paso 1: Datos del negocio
        businessName: '',
        businessRut: '',
        businessEmail: '',
        businessPhone: '',
        businessAddress: '',
        businessCity: '',
        businessRegion: '',

        // Paso 2: Representante legal
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        password: '',
        confirmPassword: '',

        // Paso 3: Servicios y categorías
        selectedCategories: [] as string[],
        logo: null as File | null,
        description: '',

        // Términos
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpiar error cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(categoryId)
                ? prev.selectedCategories.filter(id => id !== categoryId)
                : [...prev.selectedCategories, categoryId]
        }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, logo: 'El logo debe ser menor a 5MB' }));
                return;
            }
            // Validar tipo
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, logo: 'El archivo debe ser una imagen' }));
                return;
            }
            setFormData(prev => ({ ...prev, logo: file }));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.logo;
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.businessName.trim()) newErrors.businessName = 'Nombre del negocio requerido';
        if (!formData.businessRut.trim()) newErrors.businessRut = 'RUT del negocio requerido';
        if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Email requerido';
        else if (!/\S+@\S+\.\S+/.test(formData.businessEmail)) newErrors.businessEmail = 'Email inválido';
        if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Teléfono requerido';
        if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Dirección requerida';
        if (!formData.businessCity.trim()) newErrors.businessCity = 'Ciudad requerida';
        if (!formData.businessRegion) newErrors.businessRegion = 'Región requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.ownerName.trim()) newErrors.ownerName = 'Nombre completo requerido';
        if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Email requerido';
        else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) newErrors.ownerEmail = 'Email inválido';
        if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Teléfono requerido';
        if (!formData.password) newErrors.password = 'Contraseña requerida';
        else if (formData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirmar contraseña';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};

        if (formData.selectedCategories.length === 0) {
            newErrors.selectedCategories = 'Selecciona al menos una categoría';
        }
        if (!formData.description.trim()) newErrors.description = 'Descripción requerida';
        if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        let isValid = false;

        if (step === 1) isValid = validateStep1();
        else if (step === 2) isValid = validateStep2();
        else if (step === 3) isValid = validateStep3();

        if (isValid && step < 3) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep3()) return;

        setIsLoading(true);

        try {
            // Aquí iría la llamada al API para registrar el proveedor
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'selectedCategories') {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (key === 'logo' && value) {
                    formDataToSend.append(key, value as File);
                } else if (typeof value === 'boolean') {
                    formDataToSend.append(key, value.toString());
                } else {
                    formDataToSend.append(key, value as string);
                }
            });

            // Simulación de registro
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Redirigir al dashboard del proveedor
            router.push('/provider');
        } catch (error) {
            console.error('Error al registrar:', error);
            setErrors({ submit: 'Error al registrar. Intenta nuevamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FBFDFF] via-emerald-50 to-cyan-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Building2 className="h-10 w-10" style={{ color: '#0F9D58' }} />
                        <h1 className="text-4xl font-bold" style={{ color: '#073642' }}>
                            Registro de Proveedor
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Únete a nuestra red de autolavados y aumenta tus ventas
                    </p>
                </motion.div>

                {/* Stepper */}
                <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-center gap-4 mb-8"
                >
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= num
                                        ? 'text-white'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                style={step >= num ? { backgroundColor: '#0F9D58' } : {}}
                            >
                                {step > num ? <CheckCircle className="h-6 w-6" /> : num}
                            </div>
                            {num < 3 && (
                                <div
                                    className={`w-16 h-1 rounded ${step > num ? '' : 'bg-gray-200'
                                        }`}
                                    style={step > num ? { backgroundColor: '#0F9D58' } : {}}
                                />
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2" style={{ borderColor: '#0F9D58' }}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {step === 1 && <><Building2 className="h-5 w-5" /> Datos del Negocio</>}
                                {step === 2 && <><User className="h-5 w-5" /> Representante Legal</>}
                                {step === 3 && <><BadgeCheck className="h-5 w-5" /> Servicios y Verificación</>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Paso 1: Datos del Negocio */}
                                {step === 1 && (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Nombre del Negocio *</label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        placeholder="Ej: AutoClean Pro"
                                                        value={formData.businessName}
                                                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                                                    />
                                                </div>
                                                {errors.businessName && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">RUT del Negocio *</label>
                                                <Input
                                                    placeholder="12.345.678-9"
                                                    value={formData.businessRut}
                                                    onChange={(e) => handleInputChange('businessRut', e.target.value)}
                                                />
                                                {errors.businessRut && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessRut}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email del Negocio *</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        type="email"
                                                        placeholder="contacto@autolavado.cl"
                                                        value={formData.businessEmail}
                                                        onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                                                    />
                                                </div>
                                                {errors.businessEmail && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessEmail}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Teléfono *</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        type="tel"
                                                        placeholder="+56 9 1234 5678"
                                                        value={formData.businessPhone}
                                                        onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                                                    />
                                                </div>
                                                {errors.businessPhone && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessPhone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium">Dirección *</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        placeholder="Av. Libertador 1234"
                                                        value={formData.businessAddress}
                                                        onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                                                    />
                                                </div>
                                                {errors.businessAddress && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessAddress}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Ciudad/Comuna *</label>
                                                <Input
                                                    placeholder="Ej: Santiago"
                                                    value={formData.businessCity}
                                                    onChange={(e) => handleInputChange('businessCity', e.target.value)}
                                                />
                                                {errors.businessCity && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessCity}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Región *</label>
                                                <select
                                                    className="w-full px-3 py-2 border rounded-md"
                                                    value={formData.businessRegion}
                                                    onChange={(e) => handleInputChange('businessRegion', e.target.value)}
                                                >
                                                    <option value="">Selecciona una región</option>
                                                    {regions.map(region => (
                                                        <option key={region} value={region}>{region}</option>
                                                    ))}
                                                </select>
                                                {errors.businessRegion && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.businessRegion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Paso 2: Representante Legal */}
                                {step === 2 && (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium">Nombre Completo *</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        placeholder="Juan Pérez González"
                                                        value={formData.ownerName}
                                                        onChange={(e) => handleInputChange('ownerName', e.target.value)}
                                                    />
                                                </div>
                                                {errors.ownerName && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.ownerName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Email Personal *</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        type="email"
                                                        placeholder="juan@ejemplo.cl"
                                                        value={formData.ownerEmail}
                                                        onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                                                    />
                                                </div>
                                                {errors.ownerEmail && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.ownerEmail}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Teléfono Personal *</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10"
                                                        type="tel"
                                                        placeholder="+56 9 8765 4321"
                                                        value={formData.ownerPhone}
                                                        onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                                                    />
                                                </div>
                                                {errors.ownerPhone && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.ownerPhone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Contraseña *</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10 pr-10"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Mínimo 8 caracteres"
                                                        value={formData.password}
                                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-2.5"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.password}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Confirmar Contraseña *</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <Input
                                                        className="pl-10 pr-10"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Repite tu contraseña"
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-3 top-2.5"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-5 w-5 text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-5 w-5 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && (
                                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Paso 3: Servicios y Verificación */}
                                {step === 3 && (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Logo Upload */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Logo del Negocio (opcional)</label>
                                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                <input
                                                    type="file"
                                                    id="logo-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                />
                                                <label htmlFor="logo-upload" className="cursor-pointer">
                                                    <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-600">
                                                        {formData.logo ? formData.logo.name : 'Click para subir logo (max 5MB)'}
                                                    </p>
                                                </label>
                                            </div>
                                            {errors.logo && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.logo}
                                                </p>
                                            )}
                                        </div>

                                        {/* Categorías de Servicio */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Categorías de Servicio *</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {serviceCategories.map((category) => (
                                                    <motion.div
                                                        key={category.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.selectedCategories.includes(category.id)
                                                                ? 'border-[#0F9D58] bg-emerald-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => toggleCategory(category.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <category.icon
                                                                className="h-6 w-6"
                                                                style={{ color: formData.selectedCategories.includes(category.id) ? '#0F9D58' : '#9CA3AF' }}
                                                            />
                                                            <span className="font-medium">{category.name}</span>
                                                        </div>
                                                        {formData.selectedCategories.includes(category.id) && (
                                                            <CheckCircle className="h-5 w-5 absolute top-2 right-2" style={{ color: '#0F9D58' }} />
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                            {errors.selectedCategories && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.selectedCategories}
                                                </p>
                                            )}
                                        </div>

                                        {/* Descripción */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Descripción del Negocio *</label>
                                            <textarea
                                                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                                                placeholder="Cuéntanos sobre tu autolavado..."
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                            />
                                            {errors.description && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Términos y Condiciones */}
                                        <div className="space-y-2">
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.acceptTerms}
                                                    onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                                                    className="mt-1"
                                                />
                                                <span className="text-sm text-gray-600">
                                                    Acepto los{' '}
                                                    <a href="#" className="text-[#0F9D58] hover:underline">
                                                        términos y condiciones
                                                    </a>{' '}
                                                    y la{' '}
                                                    <a href="#" className="text-[#0F9D58] hover:underline">
                                                        política de privacidad
                                                    </a>
                                                </span>
                                            </label>
                                            {errors.acceptTerms && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.acceptTerms}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Navegación */}
                                <div className="flex items-center justify-between pt-6 border-t">
                                    {step > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(step - 1)}
                                        >
                                            Anterior
                                        </Button>
                                    )}

                                    {step < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="ml-auto"
                                            style={{ backgroundColor: '#0F9D58', color: 'white' }}
                                        >
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="ml-auto"
                                            style={{ backgroundColor: '#FFD166', color: '#073642' }}
                                        >
                                            {isLoading ? 'Registrando...' : 'Completar Registro'}
                                        </Button>
                                    )}
                                </div>

                                {errors.submit && (
                                    <p className="text-sm text-red-600 text-center flex items-center justify-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> {errors.submit}
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Beneficios */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <Card className="text-center p-6">
                        <ShieldCheck className="h-12 w-12 mx-auto mb-4" style={{ color: '#0F9D58' }} />
                        <h3 className="font-semibold mb-2">Plataforma Segura</h3>
                        <p className="text-sm text-gray-600">
                            Protegemos tus datos con encriptación de última generación
                        </p>
                    </Card>

                    <Card className="text-center p-6">
                        <BadgeCheck className="h-12 w-12 mx-auto mb-4" style={{ color: '#2B8EAD' }} />
                        <h3 className="font-semibold mb-2">Verificación Rápida</h3>
                        <p className="text-sm text-gray-600">
                            Proceso de verificación en menos de 24 horas
                        </p>
                    </Card>

                    <Card className="text-center p-6">
                        <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: '#FFD166' }} />
                        <h3 className="font-semibold mb-2">Aumenta tus Ventas</h3>
                        <p className="text-sm text-gray-600">
                            Accede a miles de clientes potenciales en tu zona
                        </p>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
