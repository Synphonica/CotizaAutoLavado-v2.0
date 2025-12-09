/**
 * Componente de gráfico de historial de precios usando Recharts
 */

'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/hooks/use-loading';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceHistoryData {
    id: string;
    serviceId: string;
    price: number;
    oldPrice: number | null;
    changeType: 'increase' | 'decrease' | 'no_change';
    recordedAt: string;
}

interface PriceHistoryChartProps {
    serviceId: string;
    serviceName?: string;
    variant?: 'line' | 'area';
    showStats?: boolean;
    height?: number;
}

export function PriceHistoryChart({
    serviceId,
    serviceName = 'Servicio',
    variant = 'line',
    showStats = true,
    height = 300,
}: PriceHistoryChartProps) {
    const [historyData, setHistoryData] = useState<PriceHistoryData[]>([]);
    const { isLoading, withLoading } = useLoading();
    const toast = useToast();

    useEffect(() => {
        loadPriceHistory();
    }, [serviceId]);

    const loadPriceHistory = async () => {
        try {
            await withLoading(async () => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/price-alerts/service/${serviceId}/history`
                );

                if (!response.ok) {
                    throw new Error('Error al cargar historial de precios');
                }

                const data = await response.json();
                setHistoryData(data);
            });
        } catch (error) {
            toast.error('No se pudo cargar el historial de precios');
            setHistoryData([]);
        }
    };

    // Formatear datos para el gráfico
    const chartData = historyData
        .slice()
        .reverse()
        .map((item) => ({
            date: new Date(item.recordedAt).toLocaleDateString('es-CL', {
                day: '2-digit',
                month: 'short',
            }),
            precio: Number(item.price),
            timestamp: new Date(item.recordedAt).getTime(),
        }));

    // Calcular estadísticas
    const prices = historyData.map((item) => Number(item.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const currentPrice = prices.length > 0 ? prices[0] : 0;
    const oldestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
    const priceChange = currentPrice - oldestPrice;
    const priceChangePercent =
        oldestPrice > 0 ? ((priceChange / oldestPrice) * 100).toFixed(1) : '0.0';

    const getTrendIcon = () => {
        if (priceChange > 0) return <TrendingUp className="h-5 w-5 text-red-500" />;
        if (priceChange < 0) return <TrendingDown className="h-5 w-5 text-green-500" />;
        return <Minus className="h-5 w-5 text-gray-500" />;
    };

    const getTrendColor = () => {
        if (priceChange > 0) return 'text-red-600';
        if (priceChange < 0) return 'text-green-600';
        return 'text-gray-600';
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[300px]" />
                </CardContent>
            </Card>
        );
    }

    if (historyData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Precios</CardTitle>
                    <CardDescription>No hay datos de historial disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        <p>No se ha registrado historial de precios para este servicio</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Precios</CardTitle>
                <CardDescription>{serviceName}</CardDescription>
            </CardHeader>
            <CardContent>
                {showStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Precio Actual</p>
                            <p className="text-2xl font-bold">${currentPrice.toLocaleString('es-CL')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Tendencia</p>
                            <div className="flex items-center gap-2">
                                {getTrendIcon()}
                                <span className={`text-lg font-semibold ${getTrendColor()}`}>
                                    {priceChange > 0 ? '+' : ''}
                                    {priceChangePercent}%
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Precio Mín.</p>
                            <p className="text-lg font-semibold text-green-600">
                                ${minPrice.toLocaleString('es-CL')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Precio Máx.</p>
                            <p className="text-lg font-semibold text-red-600">
                                ${maxPrice.toLocaleString('es-CL')}
                            </p>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height={height}>
                    {variant === 'area' ? (
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Precio']}
                            />
                            <Area
                                type="monotone"
                                dataKey="precio"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    ) : (
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString('es-CL')}`, 'Precio']}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="precio"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Precio"
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>

                <div className="mt-4 text-xs text-muted-foreground">
                    <p>
                        Mostrando historial de los últimos {historyData.length} registros •{' '}
                        Actualizado:{' '}
                        {new Date(historyData[0].recordedAt).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
