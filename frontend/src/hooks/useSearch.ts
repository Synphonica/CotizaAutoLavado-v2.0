// ============================================
// USE SEARCH - Hook para manejar búsquedas
// ============================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '@/lib/api/search';
import { queryKeys } from '@/lib/providers/react-query-provider';
import type { SearchQuery, SearchResponse, SearchSuggestion } from '@/types/api.types';

/**
 * Hook para realizar búsqueda principal
 */
export function useSearch(query: SearchQuery, enabled: boolean = true) {
    return useQuery({
        queryKey: queryKeys.search.results(query),
        queryFn: () => searchApi.search(query),
        enabled: enabled && (!!query.query || !!query.category),
        staleTime: 2 * 60 * 1000, // 2 minutos
    });
}

/**
 * Hook para búsqueda rápida
 */
export function useQuickSearch(q: string, params?: Partial<SearchQuery>) {
    return useQuery({
        queryKey: queryKeys.search.results({ q, ...params }),
        queryFn: () => searchApi.quickSearch(q, params),
        enabled: !!q && q.length >= 2,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook para obtener sugerencias de búsqueda
 */
export function useSearchSuggestions(query: string, limit: number = 5) {
    return useQuery({
        queryKey: queryKeys.search.suggestions(query),
        queryFn: () => searchApi.getSuggestions(query, limit),
        enabled: !!query && query.length >= 2,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para búsqueda cercana
 */
export function useNearbySearch(
    latitude: number,
    longitude: number,
    params?: Partial<SearchQuery>,
    enabled: boolean = true
) {
    return useQuery({
        queryKey: queryKeys.search.results({ latitude, longitude, ...params }),
        queryFn: () => searchApi.searchNearby(latitude, longitude, params),
        enabled: enabled && !!latitude && !!longitude,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook para búsqueda por categoría
 */
export function useSearchByCategory(category: string, params?: Partial<SearchQuery>) {
    return useQuery({
        queryKey: queryKeys.search.results({ category, ...params }),
        queryFn: () => searchApi.searchByCategory(category, params),
        enabled: !!category,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook para obtener historial de búsqueda
 */
export function useSearchHistory(limit: number = 10) {
    return useQuery({
        queryKey: queryKeys.search.history(),
        queryFn: () => searchApi.getSearchHistory(limit),
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
}

/**
 * Hook para guardar en historial de búsqueda
 */
export function useSaveSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (query: string) => searchApi.saveSearchHistory(query),
        onSuccess: () => {
            // Invalidar historial
            queryClient.invalidateQueries({ queryKey: queryKeys.search.history() });
        },
    });
}
