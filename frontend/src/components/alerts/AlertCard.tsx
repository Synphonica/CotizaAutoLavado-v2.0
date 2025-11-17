'use client';

import { useState } from 'react';
import { Bell, BellOff, Trash2, Edit2, MapPin } from 'lucide-react';
import { usePriceAlertActions } from '@/hooks/usePriceAlerts';
import type { PriceAlert } from '@/types/price-alerts';

interface AlertCardProps {
    alert: PriceAlert;
    onUpdate?: () => void;
    onDelete?: () => void;
}

export default function AlertCard({ alert, onUpdate, onDelete }: AlertCardProps) {
    const { update, remove, updating, deleting } = usePriceAlertActions();
    const [showConfirm, setShowConfirm] = useState(false);

    const currentPrice = alert.service.discountedPrice || alert.service.price;
    const hasDiscount = alert.service.discountedPrice !== null;

    const handleToggleActive = async () => {
        const result = await update(alert.id, { isActive: !alert.isActive });
        if (result) {
            onUpdate?.();
        }
    };

    const handleDelete = async () => {
        const result = await remove(alert.id);
        if (result) {
            onDelete?.();
            setShowConfirm(false);
        }
    };

    const getAlertCriteria = () => {
        if (alert.targetPrice) {
            return `Precio objetivo: $${alert.targetPrice.toLocaleString('es-CL')}`;
        }
        if (alert.percentageOff) {
            return `Descuento mínimo: ${alert.percentageOff}%`;
        }
        return 'Cualquier bajada de precio';
    };

    const isPriceBelow = () => {
        if (alert.targetPrice) {
            return currentPrice <= alert.targetPrice;
        }
        return false;
    };

    return (
        <div className={`bg-white border-2 rounded-lg p-5 transition-all hover:shadow-md ${!alert.isActive ? 'opacity-60 border-gray-200' : 'border-blue-200'
            }`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {alert.isActive ? (
                            <Bell className="w-5 h-5 text-blue-600" />
                        ) : (
                            <BellOff className="w-5 h-5 text-gray-400" />
                        )}
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {alert.service.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.service.provider.businessName}</span>
                        <span className="text-gray-400">•</span>
                        <span>{alert.service.provider.city}</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleToggleActive}
                        disabled={updating}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={alert.isActive ? 'Desactivar alerta' : 'Activar alerta'}
                    >
                        {alert.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar alerta"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div>
                    <p className="text-xs text-gray-600 mb-1">Precio actual</p>
                    <p className={`text-xl font-bold ${hasDiscount ? 'text-green-600' : 'text-gray-900'}`}>
                        ${currentPrice.toLocaleString('es-CL')}
                    </p>
                    {hasDiscount && alert.service.price && (
                        <p className="text-xs text-gray-500 line-through">
                            ${alert.service.price.toLocaleString('es-CL')}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-xs text-gray-600 mb-1">Criterio de alerta</p>
                    <p className="text-sm font-medium text-gray-900">
                        {getAlertCriteria()}
                    </p>
                </div>
            </div>

            {/* Alert Status */}
            {isPriceBelow() && alert.isActive && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                        ✅ ¡Precio objetivo alcanzado!
                    </p>
                </div>
            )}

            {/* Alert Info */}
            <div className="flex flex-wrap gap-2 mb-4">
                {alert.notifyEmail && (
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        📧 Email
                    </span>
                )}
                {alert.notifyInApp && (
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        🔔 In-App
                    </span>
                )}
                {alert.triggeredCount > 0 && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        Disparada {alert.triggeredCount}x
                    </span>
                )}
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                <span>Creada {new Date(alert.createdAt).toLocaleDateString('es-CL')}</span>
                {alert.lastNotifiedAt && (
                    <span>
                        Última notificación: {new Date(alert.lastNotifiedAt).toLocaleDateString('es-CL')}
                    </span>
                )}
            </div>

            {/* Delete Confirmation */}
            {showConfirm && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 mb-3">
                        ¿Estás seguro que quieres eliminar esta alerta?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
