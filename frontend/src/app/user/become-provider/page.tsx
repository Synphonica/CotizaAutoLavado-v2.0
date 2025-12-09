'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProviderRequest } from '@/hooks/useProviderRequest';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ModernNavbar } from '@/components/Navbar';

export default function BecomeProviderPage() {
    const router = useRouter();
    const {
        request,
        loading,
        error,
        fetchMyRequest,
        createRequest,
        hasPendingRequest,
        wasApproved,
        wasRejected,
        getStatusColor,
        getStatusText,
    } = useProviderRequest();

    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
        description: '',
        reason: '',
    });

    const [submitting, setSubmitting] = useState(false);

    // Cargar solicitud existente al montar
    useEffect(() => {
        fetchMyRequest();
    }, [fetchMyRequest]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!formData.businessName.trim()) {
            toast.error('El nombre del negocio es requerido');
            return;
        }
        if (!formData.businessType.trim()) {
            toast.error('El tipo de negocio es requerido');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('El email es requerido');
            return;
        }
        if (!formData.phone.trim()) {
            toast.error('El teléfono es requerido');
            return;
        }
        if (!formData.city.trim()) {
            toast.error('La ciudad es requerida');
            return;
        }
        if (!formData.region.trim()) {
            toast.error('La región es requerida');
            return;
        }

        setSubmitting(true);
        try {
            await createRequest(formData);
            toast.success('Solicitud enviada exitosamente');
            // Esperar un momento antes de redirigir
            setTimeout(() => {
                router.push('/user');
            }, 2000);
        } catch (err: any) {
            toast.error(err.message || 'Error al enviar la solicitud');
        } finally {
            setSubmitting(false);
        }
    };

    // Renderizar estado de solicitud existente
    const renderRequestStatus = () => {
        if (!request) return null;

        const statusConfig = {
            PENDING: {
                icon: <Clock className="w-12 h-12 text-yellow-500" />,
                title: 'Solicitud Pendiente',
                description: 'Tu solicitud está siendo revisada por nuestro equipo.',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
            },
            UNDER_REVIEW: {
                icon: <AlertCircle className="w-12 h-12 text-blue-500" />,
                title: 'En Revisión',
                description: 'Tu solicitud está actualmente en proceso de revisión.',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
            },
            APPROVED: {
                icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                title: '¡Solicitud Aprobada!',
                description: 'Tu solicitud ha sido aprobada. Ya puedes acceder al panel de proveedor.',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
            },
            REJECTED: {
                icon: <XCircle className="w-12 h-12 text-red-500" />,
                title: 'Solicitud Rechazada',
                description: request.rejectionReason || 'Tu solicitud no fue aprobada.',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
            },
        };

        const config = statusConfig[request.status];

        return (
            <div className="min-h-screen bg-gray-50">
                <ModernNavbar />
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/user')}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Panel
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-8 text-center`}
                    >
                        <div className="flex justify-center mb-4">{config.icon}</div>
                        <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
                        <p className="text-gray-600 mb-6">{config.description}</p>

                        <div className="bg-white rounded-lg p-6 text-left">
                            <h3 className="font-semibold mb-4">Detalles de la Solicitud</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium">Nombre del Negocio:</span>{' '}
                                    {request.businessName}
                                </div>
                                <div>
                                    <span className="font-medium">Tipo:</span> {request.businessType}
                                </div>
                                <div>
                                    <span className="font-medium">Email:</span> {request.email}
                                </div>
                                <div>
                                    <span className="font-medium">Teléfono:</span> {request.phone}
                                </div>
                                <div>
                                    <span className="font-medium">Ciudad:</span> {request.city},{' '}
                                    {request.region}
                                </div>
                                <div>
                                    <span className="font-medium">Fecha de Solicitud:</span>{' '}
                                    {new Date(request.createdAt).toLocaleDateString('es-CL')}
                                </div>
                                {request.reviewedAt && (
                                    <div>
                                        <span className="font-medium">Fecha de Revisión:</span>{' '}
                                        {new Date(request.reviewedAt).toLocaleDateString('es-CL')}
                                    </div>
                                )}
                                {request.adminNotes && (
                                    <div>
                                        <span className="font-medium">Notas del Administrador:</span>
                                        <p className="mt-1 text-gray-600">{request.adminNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {request.status === 'APPROVED' && (
                            <Button
                                onClick={() => router.push('/provider')}
                                className="mt-6"
                                size="lg"
                            >
                                Ir al Panel de Proveedor
                            </Button>
                        )}

                        {request.status === 'REJECTED' && (
                            <Button
                                onClick={() => {
                                    setFormData({
                                        businessName: request.businessName,
                                        businessType: request.businessType,
                                        email: request.email,
                                        phone: request.phone,
                                        address: request.address || '',
                                        city: request.city,
                                        region: request.region,
                                        description: request.description || '',
                                        reason: '',
                                    });
                                    // Aquí podrías agregar lógica para permitir reenviar
                                }}
                                className="mt-6"
                                size="lg"
                                variant="outline"
                            >
                                Nueva Solicitud
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    };

    // Si hay una solicitud activa (pendiente o en revisión), mostrar el estado
    if (hasPendingRequest() || wasApproved()) {
        return renderRequestStatus();
    }

    // Si fue rechazado, también mostrar el estado pero permitir crear nueva solicitud
    if (wasRejected() && request) {
        return renderRequestStatus();
    }

    // Formulario para nueva solicitud
    return (
        <div className="min-h-screen bg-gray-50">
            <ModernNavbar />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/user')}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Panel
                </Button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl">
                                Conviértete en Proveedor
                            </CardTitle>
                            <CardDescription>
                                Completa el formulario para enviar tu solicitud y unirte a
                                nuestra red de proveedores de autolavado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Información del Negocio */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Información del Negocio
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="businessName">
                                                Nombre del Negocio *
                                            </Label>
                                            <Input
                                                id="businessName"
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="Ej: AutoLavado Express"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="businessType">Tipo de Negocio *</Label>
                                            <Input
                                                id="businessType"
                                                name="businessType"
                                                value={formData.businessType}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Autolavado, Detailing"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Información de Contacto */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Mail className="w-5 h-5" />
                                        Información de Contacto
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="contacto@negocio.cl"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Teléfono *</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+56 9 1234 5678"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        Ubicación
                                    </h3>

                                    <div>
                                        <Label htmlFor="address">Dirección</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Calle Principal 123"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">Ciudad *</Label>
                                            <Input
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="Santiago"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="region">Región *</Label>
                                            <Input
                                                id="region"
                                                name="region"
                                                value={formData.region}
                                                onChange={handleInputChange}
                                                placeholder="Región Metropolitana"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Información Adicional
                                    </h3>

                                    <div>
                                        <Label htmlFor="description">
                                            Descripción del Negocio
                                        </Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe tu negocio, servicios que ofreces, años de experiencia, etc."
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="reason">
                                            ¿Por qué quieres ser parte de nuestra plataforma?
                                        </Label>
                                        <Textarea
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleInputChange}
                                            placeholder="Cuéntanos por qué te gustaría unirte a nuestra red de proveedores"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={submitting || loading}
                                        className="flex-1"
                                        size="lg"
                                    >
                                        {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.push('/user')}
                                        disabled={submitting}
                                        size="lg"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
