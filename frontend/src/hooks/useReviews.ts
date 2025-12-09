'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ReviewImage {
    id: string;
    url: string;
    filename?: string;
    order: number;
}

interface ReviewUser {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface Review {
    id: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
    serviceQuality?: number;
    cleanliness?: number;
    valueForMoney?: number;
    staffFriendliness?: number;
    createdAt: string;
    publishedAt?: string;
    providerResponse?: string;
    providerResponseAt?: string;
    helpfulCount: number;
    notHelpfulCount: number;
    reportCount: number;
    isHidden: boolean;
    user?: ReviewUser;
    images?: ReviewImage[];
    currentUserVote?: { isHelpful: boolean } | null;
}

interface ReviewsResponse {
    data: Review[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface RatingStats {
    average: number;
    total: number;
    distribution: { rating: number; count: number }[];
}

interface UseReviewsOptions {
    providerId: string;
    serviceId?: string;
    initialPage?: number;
    limit?: number;
}

interface CreateReviewData {
    providerId: string;
    serviceId?: string;
    rating: number;
    title?: string;
    comment?: string;
    serviceQuality?: number;
    cleanliness?: number;
    valueForMoney?: number;
    staffFriendliness?: number;
    images?: string[];
}

export function useReviews({ providerId, serviceId, initialPage = 1, limit = 10 }: UseReviewsOptions) {
    const { getToken } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingStats, setRatingStats] = useState<RatingStats>({
        average: 0,
        total: 0,
        distribution: [],
    });
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filters, setFilters] = useState<{ ratings?: number[] }>({});

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        const token = await getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return response.json();
    }, [getToken]);

    const fetchReviews = useCallback(async (resetPage = false) => {
        setIsLoading(true);
        setError(null);

        try {
            const currentPage = resetPage ? 1 : page;
            if (resetPage) setPage(1);

            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: limit.toString(),
                sortBy,
                sortOrder,
            });

            if (serviceId) {
                params.append('serviceId', serviceId);
            }

            if (filters.ratings && filters.ratings.length > 0) {
                params.append('ratings', filters.ratings.join(','));
            }

            const data: ReviewsResponse = await fetchWithAuth(
                `${API_URL}/api/reviews/provider/${providerId}?${params}`
            );

            if (resetPage) {
                setReviews(data.data);
            } else {
                setReviews(prev => currentPage === 1 ? data.data : [...prev, ...data.data]);
            }

            setTotalPages(data.meta.totalPages);
            setTotalReviews(data.meta.total);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cargar reseñas';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [providerId, serviceId, page, limit, sortBy, sortOrder, filters, fetchWithAuth]);

    const fetchRatingStats = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (serviceId) {
                params.append('serviceId', serviceId);
            }

            const data = await fetchWithAuth(
                `${API_URL}/api/reviews/provider/${providerId}/stats?${params}`
            );

            setRatingStats({
                average: data.average || 0,
                total: data.total || 0,
                distribution: data.distribution || [],
            });
        } catch (err) {
            console.error('Error fetching rating stats:', err);
        }
    }, [providerId, serviceId, fetchWithAuth]);

    const loadMore = useCallback(() => {
        if (page < totalPages && !isLoading) {
            setPage(prev => prev + 1);
        }
    }, [page, totalPages, isLoading]);

    const createReview = useCallback(async (data: CreateReviewData) => {
        try {
            const newReview = await fetchWithAuth(`${API_URL}/api/reviews`, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            // Add images if provided
            if (data.images && data.images.length > 0) {
                await fetchWithAuth(`${API_URL}/api/reviews/${newReview.id}/images/bulk`, {
                    method: 'POST',
                    body: JSON.stringify({ images: data.images }),
                });
            }

            toast.success('Reseña creada exitosamente');

            // Refresh reviews
            await fetchReviews(true);
            await fetchRatingStats();

            return newReview;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al crear la reseña';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth, fetchReviews, fetchRatingStats]);

    const voteReview = useCallback(async (reviewId: string, isHelpful: boolean) => {
        try {
            await fetchWithAuth(`${API_URL}/api/reviews/${reviewId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ isHelpful }),
            });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    const hadVote = review.currentUserVote !== null;
                    const wasHelpful = review.currentUserVote?.isHelpful;

                    let helpfulDelta = 0;
                    let notHelpfulDelta = 0;

                    if (!hadVote) {
                        // New vote
                        if (isHelpful) helpfulDelta = 1;
                        else notHelpfulDelta = 1;
                    } else if (wasHelpful !== isHelpful) {
                        // Changed vote
                        if (isHelpful) {
                            helpfulDelta = 1;
                            notHelpfulDelta = -1;
                        } else {
                            helpfulDelta = -1;
                            notHelpfulDelta = 1;
                        }
                    }
                    // If same vote, toggle off - just refresh instead

                    return {
                        ...review,
                        helpfulCount: review.helpfulCount + helpfulDelta,
                        notHelpfulCount: review.notHelpfulCount + notHelpfulDelta,
                        currentUserVote: { isHelpful },
                    };
                }
                return review;
            }));

            toast.success(isHelpful ? 'Marcado como útil' : 'Marcado como no útil');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al votar';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth]);

    const reportReview = useCallback(async (reviewId: string, reason: string, details?: string) => {
        try {
            await fetchWithAuth(`${API_URL}/api/reviews/${reviewId}/report`, {
                method: 'POST',
                body: JSON.stringify({ reason, details }),
            });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        reportCount: review.reportCount + 1,
                    };
                }
                return review;
            }));

            toast.success('Reseña reportada. La revisaremos pronto.');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al reportar';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth]);

    const addProviderResponse = useCallback(async (reviewId: string, response: string) => {
        try {
            await fetchWithAuth(`${API_URL}/api/reviews/${reviewId}/provider-response`, {
                method: 'POST',
                body: JSON.stringify({ response }),
            });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        providerResponse: response,
                        providerResponseAt: new Date().toISOString(),
                    };
                }
                return review;
            }));

            toast.success('Respuesta agregada exitosamente');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al agregar respuesta';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth]);

    const updateProviderResponse = useCallback(async (reviewId: string, response: string) => {
        try {
            await fetchWithAuth(`${API_URL}/api/reviews/${reviewId}/provider-response`, {
                method: 'PATCH',
                body: JSON.stringify({ response }),
            });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        providerResponse: response,
                    };
                }
                return review;
            }));

            toast.success('Respuesta actualizada exitosamente');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al actualizar respuesta';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth]);

    const deleteProviderResponse = useCallback(async (reviewId: string) => {
        try {
            await fetchWithAuth(`${API_URL}/api/reviews/${reviewId}/provider-response`, {
                method: 'DELETE',
            });

            // Update local state
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    return {
                        ...review,
                        providerResponse: undefined,
                        providerResponseAt: undefined,
                    };
                }
                return review;
            }));

            toast.success('Respuesta eliminada exitosamente');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar respuesta';
            toast.error(message);
            throw err;
        }
    }, [fetchWithAuth]);

    const changeSortBy = useCallback((newSortBy: string, newSortOrder: string) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    }, []);

    const changeFilters = useCallback((newFilters: { ratings?: number[] }) => {
        setFilters(newFilters);
    }, []);

    return {
        // Data
        reviews,
        isLoading,
        error,
        page,
        totalPages,
        totalReviews,
        hasMore: page < totalPages,
        ratingStats,
        sortBy,
        sortOrder,
        filters,

        // Actions
        fetchReviews,
        fetchRatingStats,
        loadMore,
        createReview,
        voteReview,
        reportReview,
        addProviderResponse,
        updateProviderResponse,
        deleteProviderResponse,
        changeSortBy,
        changeFilters,
    };
}
