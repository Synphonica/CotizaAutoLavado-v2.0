"use client";

import { useEffect, useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export function AIStatusIndicator() {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        // Simular verificación de estado de IA
        const checkAIStatus = async () => {
            try {
                // En producción, esto haría un ping al endpoint /ai/health
                await new Promise(resolve => setTimeout(resolve, 1000));
                setStatus('online');
            } catch (error) {
                setStatus('offline');
            }
        };

        checkAIStatus();
    }, []);

    if (status === 'checking') {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <span>Verificando IA...</span>
            </div>
        );
    }

    if (status === 'offline') {
        return (
            <div className="flex items-center gap-2 text-xs text-orange-500 dark:text-orange-400">
                <AlertCircle className="w-3 h-3" />
                <span>IA no disponible</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">IA Activa</span>
        </div>
    );
}
