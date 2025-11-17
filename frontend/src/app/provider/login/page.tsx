'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Building2, Mail, Lock, Eye, EyeOff, AlertCircle,
    LogIn, ArrowRight, ShieldCheck, TrendingUp, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProviderLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [forgotEmail, setForgotEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleInputChange = (field: string, value: string) => {
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'Contraseña requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Aquí iría la llamada al API para autenticar
            // Por ahora simulamos la autenticación
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simular respuesta exitosa
            const mockResponse = {
                success: true,
                token: 'mock-jwt-token',
                provider: {
                    id: '1',
                    businessName: 'AutoClean Pro',
                    email: formData.email,
                }
            };

            if (mockResponse.success) {
                // Guardar token en localStorage (en producción usar cookies HttpOnly)
                localStorage.setItem('providerToken', mockResponse.token);
                localStorage.setItem('providerData', JSON.stringify(mockResponse.provider));

                // Redirigir al dashboard
                router.push('/provider');
            } else {
                setErrors({ submit: 'Credenciales inválidas' });
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setErrors({ submit: 'Error al iniciar sesión. Intenta nuevamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!forgotEmail.trim()) {
            setErrors({ forgotEmail: 'Email requerido' });
            return;
        }

        if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
            setErrors({ forgotEmail: 'Email inválido' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Aquí iría la llamada al API para enviar email de recuperación
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccessMessage('¡Email enviado! Revisa tu bandeja de entrada.');
            setTimeout(() => {
                setShowForgotPassword(false);
                setSuccessMessage('');
                setForgotEmail('');
            }, 3000);
        } catch (error) {
            console.error('Error al enviar email:', error);
            setErrors({ forgotEmail: 'Error al enviar email. Intenta nuevamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FBFDFF] via-emerald-50 to-cyan-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Lado izquierdo: Información */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <Building2 className="h-12 w-12" style={{ color: '#0F9D58' }} />
                            <div>
                                <h1 className="text-4xl font-bold" style={{ color: '#073642' }}>
                                    Portal de Proveedores
                                </h1>
                                <p className="text-gray-600">Gestiona tu negocio desde un solo lugar</p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md"
                            >
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-6 w-6" style={{ color: '#0F9D58' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Aumenta tus Ventas</h3>
                                    <p className="text-gray-600">
                                        Accede a miles de clientes potenciales que buscan servicios de autolavado en tu zona.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md"
                            >
                                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="h-6 w-6" style={{ color: '#2B8EAD' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Analytics en Tiempo Real</h3>
                                    <p className="text-gray-600">
                                        Visualiza tus métricas de negocio, ingresos, reservas y ratings al instante.
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-md"
                            >
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ShieldCheck className="h-6 w-6" style={{ color: '#FFD166' }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Plataforma Segura</h3>
                                    <p className="text-gray-600">
                                        Protegemos tus datos y transacciones con la mejor tecnología de seguridad.
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-lg border-2" style={{ borderColor: '#0F9D58' }}>
                            <h3 className="font-bold text-lg mb-2">¿Nuevo en la plataforma?</h3>
                            <p className="text-gray-700 mb-4">
                                Únete a nuestra red de proveedores y comienza a recibir reservas hoy mismo.
                            </p>
                            <Link href="/provider/register">
                                <Button className="w-full flex items-center justify-center gap-2" style={{ backgroundColor: '#FFD166', color: '#073642' }}>
                                    Registrar mi Negocio
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Lado derecho: Formulario de Login */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="border-2" style={{ borderColor: '#0F9D58' }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LogIn className="h-5 w-5" style={{ color: '#0F9D58' }} />
                                    {showForgotPassword ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                                </CardTitle>
                                <CardDescription>
                                    {showForgotPassword
                                        ? 'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña'
                                        : 'Accede a tu dashboard de proveedor'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!showForgotPassword ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    className="pl-10"
                                                    type="email"
                                                    placeholder="tu@email.cl"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Contraseña</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    className="pl-10 pr-10"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-2.5"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isLoading}
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

                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" className="rounded" />
                                                <span className="text-sm text-gray-600">Recordarme</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setShowForgotPassword(true)}
                                                className="text-sm hover:underline"
                                                style={{ color: '#0F9D58' }}
                                            >
                                                ¿Olvidaste tu contraseña?
                                            </button>
                                        </div>

                                        {errors.submit && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" /> {errors.submit}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full"
                                            style={{ backgroundColor: '#0F9D58', color: 'white' }}
                                        >
                                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                        </Button>

                                        <div className="text-center pt-4 border-t">
                                            <p className="text-sm text-gray-600">
                                                ¿No tienes cuenta?{' '}
                                                <Link
                                                    href="/provider/register"
                                                    className="font-semibold hover:underline"
                                                    style={{ color: '#0F9D58' }}
                                                >
                                                    Regístrate aquí
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    className="pl-10"
                                                    type="email"
                                                    placeholder="tu@email.cl"
                                                    value={forgotEmail}
                                                    onChange={(e) => {
                                                        setForgotEmail(e.target.value);
                                                        if (errors.forgotEmail) {
                                                            setErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.forgotEmail;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {errors.forgotEmail && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {errors.forgotEmail}
                                                </p>
                                            )}
                                        </div>

                                        {successMessage && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-sm text-green-600 flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4" /> {successMessage}
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full"
                                            style={{ backgroundColor: '#0F9D58', color: 'white' }}
                                        >
                                            {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setShowForgotPassword(false);
                                                setForgotEmail('');
                                                setErrors({});
                                                setSuccessMessage('');
                                            }}
                                            className="w-full"
                                        >
                                            Volver al Login
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>

                        {/* Estadísticas */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 grid grid-cols-3 gap-4"
                        >
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold" style={{ color: '#0F9D58' }}>500+</p>
                                <p className="text-xs text-gray-600">Proveedores</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold" style={{ color: '#2B8EAD' }}>10K+</p>
                                <p className="text-xs text-gray-600">Reservas/mes</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                <p className="text-2xl font-bold" style={{ color: '#FFD166' }}>4.8</p>
                                <p className="text-xs text-gray-600">Rating</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
