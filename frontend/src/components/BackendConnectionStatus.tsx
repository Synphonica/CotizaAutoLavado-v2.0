'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function BackendConnectionStatus() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkBackendConnection = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
                    method: 'GET',
                    cache: 'no-store',
                });

                setIsConnected(response.ok);
            } catch (error) {
                setIsConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkBackendConnection();

        // Verificar cada 30 segundos
        const interval = setInterval(checkBackendConnection, 30000);

        return () => clearInterval(interval);
    }, []);

    if (isChecking) {
        return (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                Verificando conexión...
            </Badge>
        );
    }

    if (isConnected === null) return null;

    return (
        <Badge
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center gap-1 text-xs"
            style={isConnected ? { backgroundColor: '#0F9D58', color: 'white' } : {}}
        >
            {isConnected ? (
                <>
                    <CheckCircle className="h-3 w-3" />
                    Backend Conectado
                </>
            ) : (
                <>
                    <AlertCircle className="h-3 w-3" />
                    Backend Desconectado
                </>
            )}
        </Badge>
    );
}
