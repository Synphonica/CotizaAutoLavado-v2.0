'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, AlertCircle, CheckCircle, Car, Sparkles,
    BadgeCheck, Clock, DollarSign, Percent, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const serviceCategories = [
    { id: 'exterior', name: 'Lavado Exterior', icon: Car },
    { id: 'interior', name: 'Lavado Interior', icon: Sparkles },
    { id: 'complete', name: 'Lavado Completo', icon: BadgeCheck },
    { id: 'express', name: 'Lavado Rápido', icon: Clock },
];

interface Service {
    id?: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount: number;
    category: string;
    description: string;
    duration: number; // en minutos
    image?: File | string | null;
    status: 'active' | 'inactive';
}

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    service?: Service | null; // Si existe, es edición; si no, es creación
}

export default function ServiceModal({ isOpen, onClose, onSave, service }: ServiceModalProps) {
    const [formData, setFormData] = useState<Service>({
        name: '',
        price: 0,
        originalPrice: 0,
        discount: 0,
        category: '',
        description: '',
        duration: 30,
        image: null,
        status: 'active',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Cargar datos del servicio si está en modo edición
    useEffect(() => {
        if (service) {
            setFormData(service);
            if (typeof service.image === 'string') {
                setImagePreview(service.image);
            }
        } else {
            // Resetear formulario en modo creación
            setFormData({
                name: '',
                price: 0,
                originalPrice: 0,
                discount: 0,
                category: '',
                description: '',
                duration: 30,
                image: null,
                status: 'active',
            });
            setImagePreview(null);
        }
        setErrors({});
    }, [service, isOpen]);

    const handleInputChange = (field: keyof Service, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Calcular descuento automáticamente si cambia precio u originalPrice
            if (field === 'price' || field === 'originalPrice') {
                const price = field === 'price' ? value : prev.price;
                const originalPrice = field === 'originalPrice' ? value : prev.originalPrice;

                if (originalPrice && originalPrice > 0 && price > 0) {
                    const calculatedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);
                    newData.discount = calculatedDiscount > 0 ? calculatedDiscount : 0;
                } else {
                    newData.discount = 0;
                }
            }

            // Calcular precio si cambia descuento
            if (field === 'discount' && prev.originalPrice && prev.originalPrice > 0) {
                const discount = value as number;
                if (discount > 0 && discount <= 100) {
                    newData.price = Math.round(prev.originalPrice * (1 - discount / 100));
                }
            }

            return newData;
        });

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 5MB' }));
                return;
            }

            // Validar tipo
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'El archivo debe ser una imagen' }));
                return;
            }

            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setFormData(prev => ({ ...prev, image: file }));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.image;
                return newErrors;
            });
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Nombre del servicio requerido';
        if (!formData.category) newErrors.category = 'Categoría requerida';
        if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
        if (!formData.description.trim()) newErrors.description = 'Descripción requerida';
        if (formData.duration <= 0) newErrors.duration = 'Duración debe ser mayor a 0';

        if (formData.originalPrice && formData.originalPrice > 0) {
            if (formData.price > formData.originalPrice) {
                newErrors.price = 'El precio no puede ser mayor al precio original';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Aquí iría la llamada al API
            await new Promise(resolve => setTimeout(resolve, 1000));

            onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            setErrors({ submit: 'Error al guardar. Intenta nuevamente.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                        <h2 className="text-2xl font-bold" style={{ color: '#073642' }}>
                            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Nombre y Categoría */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del Servicio *</label>
                                <Input
                                    placeholder="Ej: Lavado Completo Premium"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría *</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {serviceCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.category}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Precios y Descuento */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio Final *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        placeholder="15000"
                                        value={formData.price || ''}
                                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                {errors.price && (
                                    <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {errors.price}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Precio Original (opcional)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        placeholder="20000"
                                        value={formData.originalPrice || ''}
                                        onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Descuento (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="number"
                                        className="pl-10"
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                        value={formData.discount || ''}
                                        onChange={(e) => handleInputChange('discount', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.discount > 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                                <Badge className="text-xs" style={{ backgroundColor: '#FFD166', color: '#073642' }}>
                                    -{formData.discount}% OFF
                                </Badge>
                                <span className="text-sm">
                                    Precio original: <span className="line-through">${formData.originalPrice?.toLocaleString()}</span> →
                                    Precio final: <span className="font-bold" style={{ color: '#0F9D58' }}>${formData.price.toLocaleString()}</span>
                                </span>
                            </div>
                        )}

                        {/* Duración */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duración (minutos) *</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    type="number"
                                    className="pl-10"
                                    placeholder="30"
                                    min="5"
                                    step="5"
                                    value={formData.duration || ''}
                                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            {errors.duration && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.duration}
                                </p>
                            )}
                        </div>

                        {/* Descripción */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descripción *</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                                placeholder="Describe en detalle qué incluye este servicio..."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                            />
                            {errors.description && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Imagen */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Imagen del Servicio (opcional)</label>
                            {!imagePreview ? (
                                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                    <input
                                        type="file"
                                        id="service-image"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <label htmlFor="service-image" className="cursor-pointer">
                                        <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-600">Click para subir imagen (max 5MB)</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border-2 border-emerald-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            {errors.image && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.image}
                                </p>
                            )}
                        </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estado del Servicio</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'active'}
                                        onChange={() => handleInputChange('status', 'active')}
                                    />
                                    <Badge style={{ backgroundColor: '#0F9D58', color: 'white' }}>
                                        Activo
                                    </Badge>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        checked={formData.status === 'inactive'}
                                        onChange={() => handleInputChange('status', 'inactive')}
                                    />
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                        Inactivo
                                    </Badge>
                                </label>
                            </div>
                        </div>

                        {errors.submit && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Botones */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                style={{ backgroundColor: '#0F9D58', color: 'white' }}
                            >
                                {isLoading ? 'Guardando...' : service ? 'Guardar Cambios' : 'Crear Servicio'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
