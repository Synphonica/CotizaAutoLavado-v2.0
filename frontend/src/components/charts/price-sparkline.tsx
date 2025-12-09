/**
 * Componente compacto de mini-gráfico de historial de precios
 * Para usar en cards de servicios
 */

'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { usePriceHistory } from '@/hooks/use-price-history';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceSparklineProps {
    serviceId: string;
    showTrend?: boolean;
    height?: number;
}

export function PriceSparkline({
    serviceId,
    showTrend = true,
    height = 40,
}: PriceSparklineProps) {
    const { history, isLoading, stats } = usePriceHistory(serviceId);

    if (isLoading || history.length < 2) {
        return null;
    }

    const chartData = history
        .slice()
        .reverse()
        .map((item) => ({
            price: Number(item.price),
        }));

    const getTrendIcon = () => {
        if (stats.change > 0)
            return <TrendingUp className="h-3 w-3 text-red-500" />;
        if (stats.change < 0)
            return <TrendingDown className="h-3 w-3 text-green-500" />;
        return <Minus className="h-3 w-3 text-gray-500" />;
    };

    const getTrendColor = () => {
        if (stats.change > 0) return '#ef4444';
        if (stats.change < 0) return '#10b981';
        return '#6b7280';
    };

    return (
        <div className="flex items-center gap-2">
            <ResponsiveContainer width={60} height={height}>
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke={getTrendColor()}
                        strokeWidth={1.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
            {showTrend && (
                <div className="flex items-center gap-1 text-xs">
                    {getTrendIcon()}
                    <span className={stats.change > 0 ? 'text-red-600' : stats.change < 0 ? 'text-green-600' : 'text-gray-600'}>
                        {stats.change > 0 ? '+' : ''}
                        {stats.changePercent.toFixed(1)}%
                    </span>
                </div>
            )}
        </div>
    );
}
