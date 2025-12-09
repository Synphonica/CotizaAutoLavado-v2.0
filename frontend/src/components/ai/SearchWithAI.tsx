"use client";

import { useState } from 'react';
import { Search, Sparkles, Loader2, MapPin, Calendar, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { apiPost } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface SearchQuery {
    location?: string;
    serviceType?: string;
    date?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    additionalPreferences?: string[];
}

interface SearchResponse {
    structuredQuery: SearchQuery;
    explanation: string;
    confidence: number;
}

export function SearchWithAI() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { getToken } = useClerkAuth();
    const router = useRouter();

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();

            const response = await apiPost<SearchResponse>(
                '/ai/search/semantic',
                { query },
                { token }
            );

            setResult(response);

            // Construir URL con filtros
            const params = new URLSearchParams();

            if (response.structuredQuery.location) {
                params.set('location', response.structuredQuery.location);
            }
            if (response.structuredQuery.serviceType) {
                params.set('service', response.structuredQuery.serviceType);
            }
            if (response.structuredQuery.priceRange) {
                params.set('minPrice', response.structuredQuery.priceRange.min.toString());
                params.set('maxPrice', response.structuredQuery.priceRange.max.toString());
            }
            if (response.structuredQuery.rating) {
                params.set('rating', response.structuredQuery.rating.toString());
            }

            // Navegar a resultados con filtros
            router.push(`/results?${params.toString()}`);

        } catch (err: any) {
            console.error('Error en búsqueda con IA:', err);
            setError(err.message || 'Error al procesar la búsqueda');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Ej: lavado completo cerca de providencia mañana"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-24 py-6 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-[#2F80ED] dark:focus:border-[#2F80ED] rounded-xl"
                    disabled={isLoading}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                <Button
                    onClick={handleSearch}
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#2F80ED] to-[#1E90FF] hover:from-[#2F80ED]/90 hover:to-[#1E90FF]/90 text-white rounded-lg px-4 py-2 shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Buscar con IA
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                        <Sparkles className="h-5 w-5" />
                        <span>Búsqueda interpretada por IA</span>
                        <span className="ml-auto text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                            {Math.round(result.confidence * 100)}% confianza
                        </span>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                        {result.explanation}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {result.structuredQuery.location && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">{result.structuredQuery.location}</span>
                            </div>
                        )}

                        {result.structuredQuery.serviceType && (
                            <div className="flex items-center gap-2 text-sm">
                                <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">{result.structuredQuery.serviceType}</span>
                            </div>
                        )}

                        {result.structuredQuery.date && (
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">{result.structuredQuery.date}</span>
                            </div>
                        )}

                        {result.structuredQuery.priceRange && (
                            <div className="flex items-center gap-2 text-sm">
                                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    ${result.structuredQuery.priceRange.min.toLocaleString()} - ${result.structuredQuery.priceRange.max.toLocaleString()}
                                </span>
                            </div>
                        )}

                        {result.structuredQuery.rating && (
                            <div className="flex items-center gap-2 text-sm">
                                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-gray-700 dark:text-gray-300">{result.structuredQuery.rating}+ estrellas</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">💡 Ejemplos de búsqueda:</p>
                <div className="flex flex-wrap gap-2">
                    {[
                        "lavado completo cerca de providencia",
                        "encerado económico para mañana",
                        "lavado express bajo $15000",
                        "mejor lavado premium cerca de mí"
                    ].map((example) => (
                        <button
                            key={example}
                            onClick={() => setQuery(example)}
                            className="text-xs bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 transition-colors"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
