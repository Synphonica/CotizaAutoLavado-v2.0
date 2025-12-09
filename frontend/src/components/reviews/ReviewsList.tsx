'use client';

import { useState } from 'react';
import { Star, Filter, SortAsc, SortDesc, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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

interface ReviewsListProps {
    providerId: string;
    serviceId?: string;
    reviews: Review[];
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
    currentUserId?: string;
    isProvider?: boolean;
    canCreateReview?: boolean;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onVote?: (reviewId: string, isHelpful: boolean) => Promise<void>;
    onReport?: (reviewId: string, reason: string, details?: string) => Promise<void>;
    onProviderResponse?: (reviewId: string, response: string) => Promise<void>;
    onUpdateProviderResponse?: (reviewId: string, response: string) => Promise<void>;
    onDeleteProviderResponse?: (reviewId: string) => Promise<void>;
    onCreateReview?: (data: any) => Promise<void>;
    onSortChange?: (sortBy: string, sortOrder: string) => void;
    onFilterChange?: (filters: any) => void;
}

export function ReviewsList({
    providerId,
    serviceId,
    reviews,
    totalReviews,
    averageRating,
    ratingDistribution,
    currentUserId,
    isProvider = false,
    canCreateReview = false,
    isLoading = false,
    hasMore = false,
    onLoadMore,
    onVote,
    onReport,
    onProviderResponse,
    onUpdateProviderResponse,
    onDeleteProviderResponse,
    onCreateReview,
    onSortChange,
    onFilterChange,
}: ReviewsListProps) {
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterRatings, setFilterRatings] = useState<number[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        onSortChange?.(newSortBy, sortOrder);
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
        setSortOrder(newOrder);
        onSortChange?.(sortBy, newOrder);
    };

    const toggleRatingFilter = (rating: number) => {
        const newFilters = filterRatings.includes(rating)
            ? filterRatings.filter(r => r !== rating)
            : [...filterRatings, rating];
        setFilterRatings(newFilters);
        onFilterChange?.({ ratings: newFilters });
    };

    const handleCreateReview = async (data: any) => {
        setIsSubmitting(true);
        try {
            await onCreateReview?.(data);
            setShowCreateDialog(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        const sizeClass = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${star <= Math.round(rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const maxCount = Math.max(...ratingDistribution.map(r => r.count), 1);

    return (
        <div className="space-y-6">
            {/* Summary Section */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Average Rating */}
                    <div className="flex flex-col items-center justify-center text-center min-w-[150px]">
                        <div className="text-5xl font-bold text-gray-900">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="mt-2">
                            {renderStars(averageRating, 'lg')}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                            {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const distribution = ratingDistribution.find(r => r.rating === rating);
                            const count = distribution?.count || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <button
                                    key={rating}
                                    onClick={() => toggleRatingFilter(rating)}
                                    className={`flex items-center gap-2 w-full group transition-colors ${filterRatings.includes(rating) ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <span className="w-8 text-sm text-gray-600">{rating} ★</span>
                                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${filterRatings.includes(rating) ? 'bg-yellow-500' : 'bg-yellow-400'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-12 text-sm text-gray-500 text-right">{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Create Review Button */}
                {canCreateReview && (
                    <div className="mt-6 pt-6 border-t">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-full md:w-auto">
                                    Escribir una reseña
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Escribir reseña</DialogTitle>
                                </DialogHeader>
                                <ReviewForm
                                    providerId={providerId}
                                    serviceId={serviceId}
                                    onSubmit={handleCreateReview}
                                    onCancel={() => setShowCreateDialog(false)}
                                    isLoading={isSubmitting}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {/* Rating Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filtrar
                                {filterRatings.length > 0 && (
                                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                        {filterRatings.length}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <DropdownMenuCheckboxItem
                                    key={rating}
                                    checked={filterRatings.includes(rating)}
                                    onCheckedChange={() => toggleRatingFilter(rating)}
                                >
                                    {rating} estrellas
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear filters */}
                    {filterRatings.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterRatings([]);
                                onFilterChange?.({ ratings: [] });
                            }}
                        >
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Sort By */}
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Más recientes</SelectItem>
                            <SelectItem value="rating">Calificación</SelectItem>
                            <SelectItem value="helpfulCount">Más útiles</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort Order */}
                    <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                        {sortOrder === 'desc' ? (
                            <SortDesc className="h-4 w-4" />
                        ) : (
                            <SortAsc className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {isLoading && reviews.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No hay reseñas todavía.</p>
                        {canCreateReview && (
                            <p className="mt-2">¡Sé el primero en dejar una reseña!</p>
                        )}
                    </div>
                ) : (
                    <>
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                currentUserId={currentUserId}
                                isProvider={isProvider}
                                providerId={providerId}
                                onVote={onVote}
                                onReport={onReport}
                                onProviderResponse={onProviderResponse}
                                onUpdateProviderResponse={onUpdateProviderResponse}
                                onDeleteProviderResponse={onDeleteProviderResponse}
                            />
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={onLoadMore}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Cargando...
                                        </>
                                    ) : (
                                        'Cargar más reseñas'
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
