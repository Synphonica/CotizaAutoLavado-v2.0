'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { usePriceAlertActions } from '@/hooks/usePriceAlerts';
import type { CreatePriceAlertData } from '@/types/price-alerts';

interface CreateAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    serviceId: string;
    serviceName: string;
    currentPrice: number;
    onSuccess?: () => void;
}

export default function CreateAlertModal({
    isOpen,
    onClose,
    serviceId,
    serviceName,
    currentPrice,
    onSuccess,
}: CreateAlertModalProps) {
    const { create, creating, error } = usePriceAlertActions();

    const [alertType, setAlertType] = useState<'target' | 'percentage'>('target');
    const [targetPrice, setTargetPrice] = useState<string>('');
    const [percentageOff, setPercentageOff] = useState<string>('10');
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyInApp, setNotifyInApp] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: CreatePriceAlertData = {
            serviceId,
            notifyEmail,
            notifyInApp,
        };

        if (alertType === 'target' && targetPrice) {
            data.targetPrice = parseFloat(targetPrice);
        } else if (alertType === 'percentage' && percentageOff) {
            data.percentageOff = parseInt(percentageOff);
        }

        const result = await create(data);

        if (result) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        🔔 Crear Alerta de Precio
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Service Info */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Servicio:</p>
                        <p className="font-semibold text-gray-900">{serviceName}</p>
                        <p className="text-sm text-gray-600 mt-2">
                            Precio actual: <span className="font-bold text-blue-600">${currentPrice.toLocaleString('es-CL')}</span>
                        </p>
                    </div>

                    {/* Alert Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tipo de alerta:
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="alertType"
                                    value="target"
                                    checked={alertType === 'target'}
                                    onChange={(e) => setAlertType(e.target.value as 'target')}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Precio objetivo</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Notificar cuando el precio alcance o baje de un monto específico
                                    </div>
                                    {alertType === 'target' && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(e.target.value)}
                                                placeholder="Ej: 8000"
                                                min="0"
                                                step="100"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Te notificaremos si el precio baja a ${targetPrice || '___'} o menos
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="alertType"
                                    value="percentage"
                                    checked={alertType === 'percentage'}
                                    onChange={(e) => setAlertType(e.target.value as 'percentage')}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">Descuento porcentual</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        Notificar cuando haya un descuento mínimo del X%
                                    </div>
                                    {alertType === 'percentage' && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                value={percentageOff}
                                                onChange={(e) => setPercentageOff(e.target.value)}
                                                placeholder="Ej: 10"
                                                min="1"
                                                max="100"
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Te notificaremos si el precio baja {percentageOff}% o más
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            ¿Cómo quieres recibir las notificaciones?
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={notifyEmail}
                                    onChange={(e) => setNotifyEmail(e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">📧 Email</div>
                                    <div className="text-xs text-gray-600">Recibir notificación por correo electrónico</div>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={notifyInApp}
                                    onChange={(e) => setNotifyInApp(e.target.checked)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">🔔 In-App</div>
                                    <div className="text-xs text-gray-600">Ver notificaciones en la plataforma</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creating || (!targetPrice && alertType === 'target') || (!notifyEmail && !notifyInApp)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? 'Creando...' : 'Crear Alerta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
