'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ConnectionToast {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export function BackendConnectionToast() {
    const [toast, setToast] = useState<ConnectionToast>({
        show: false,
        message: '',
        type: 'success',
    });
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
                    method: 'GET',
                    cache: 'no-store',
                });

                const newStatus = response.ok;

                // Solo mostrar toast si el estado cambió
                if (isConnected !== null && isConnected !== newStatus) {
                    setToast({
                        show: true,
                        message: newStatus
                            ? '✓ Conexión con el backend restablecida'
                            : '✗ Se perdió la conexión con el backend',
                        type: newStatus ? 'success' : 'error',
                    });

                    // Auto-ocultar después de 5 segundos
                    setTimeout(() => {
                        setToast(prev => ({ ...prev, show: false }));
                    }, 5000);
                }

                setIsConnected(newStatus);
            } catch (error) {
                const newStatus = false;
                if (isConnected !== null && isConnected !== newStatus) {
                    setToast({
                        show: true,
                        message: '✗ No se puede conectar con el backend',
                        type: 'error',
                    });

                    setTimeout(() => {
                        setToast(prev => ({ ...prev, show: false }));
                    }, 5000);
                }
                setIsConnected(false);
            }
        };

        // Verificar inmediatamente
        checkConnection();

        // Verificar cada 30 segundos
        const interval = setInterval(checkConnection, 30000);

        return () => clearInterval(interval);
    }, [isConnected]);

    return (
        <AnimatePresence>
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="fixed top-4 left-1/2 z-[9999] max-w-md"
                >
                    <div
                        className={`flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl border-2 ${toast.type === 'success'
                                ? 'bg-emerald-50 border-[#0F9D58] text-emerald-900'
                                : 'bg-red-50 border-red-500 text-red-900'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5" style={{ color: '#0F9D58' }} />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <p className="font-medium">{toast.message}</p>
                        <button
                            onClick={() => setToast(prev => ({ ...prev, show: false }))}
                            className="ml-2 p-1 hover:bg-white/50 rounded transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
