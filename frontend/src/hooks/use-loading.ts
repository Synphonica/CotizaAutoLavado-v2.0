import { useState, useCallback } from 'react';

/**
 * Hook para manejar estados de carga de manera consistente
 */
export const useLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState);

    const startLoading = useCallback(() => {
        setIsLoading(true);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const withLoading = useCallback(
        async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
            try {
                startLoading();
                const result = await asyncFn();
                return result;
            } finally {
                stopLoading();
            }
        },
        [startLoading, stopLoading]
    );

    return {
        isLoading,
        startLoading,
        stopLoading,
        withLoading,
    };
};

/**
 * Hook para manejar múltiples estados de carga
 */
export const useLoadingStates = <T extends string>(
    keys: readonly T[]
): {
    loadingStates: Record<T, boolean>;
    startLoading: (key: T) => void;
    stopLoading: (key: T) => void;
    isAnyLoading: boolean;
} => {
    const [loadingStates, setLoadingStates] = useState<Record<T, boolean>>(
        keys.reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<T, boolean>)
    );

    const startLoading = useCallback((key: T) => {
        setLoadingStates((prev) => ({ ...prev, [key]: true }));
    }, []);

    const stopLoading = useCallback((key: T) => {
        setLoadingStates((prev) => ({ ...prev, [key]: false }));
    }, []);

    const isAnyLoading = Object.values(loadingStates).some((state) => state === true);

    return {
        loadingStates,
        startLoading,
        stopLoading,
        isAnyLoading,
    };
};

/**
 * Hook para debounce de valores con estado de loading
 */
export const useDebounceLoading = <T,>(value: T, delay: number = 500) => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const [isDebouncing, setIsDebouncing] = useState(false);

    useState(() => {
        setIsDebouncing(true);
        const handler = setTimeout(() => {
            setDebouncedValue(value);
            setIsDebouncing(false);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    });

    return { debouncedValue, isDebouncing };
};
