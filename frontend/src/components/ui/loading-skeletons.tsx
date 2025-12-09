import { Skeleton } from '@/components/ui/skeleton';

/**
 * Componentes de Skeleton predefinidos para diferentes secciones
 */

export const ServiceCardSkeleton = () => {
    return (
        <div className="rounded-lg border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-6 space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4 bg-emerald-100" />
                    <Skeleton className="h-4 w-1/2 bg-emerald-50" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full bg-emerald-100" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-emerald-50" />
                <Skeleton className="h-4 w-5/6 bg-emerald-50" />
            </div>

            <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-emerald-50" />
                    <Skeleton className="h-6 w-24 bg-emerald-100" />
                </div>
                <Skeleton className="h-10 w-28 bg-[#FFD166]/50 rounded-md" />
            </div>
        </div>
    );
};

export const ServiceDetailSkeleton = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Skeleton className="h-4 w-20" />
                    <span>/</span>
                    <Skeleton className="h-4 w-32" />
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column - Image and details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image gallery */}
                        <div className="rounded-xl overflow-hidden">
                            <Skeleton className="aspect-[16/10] w-full" />
                            <div className="flex gap-2 mt-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-24 rounded-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Service info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-8 w-3/4" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>

                            {/* Features */}
                            <div className="space-y-3 pt-4">
                                <Skeleton className="h-6 w-40" />
                                <div className="grid grid-cols-2 gap-2">
                                    {[...Array(6)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Reviews section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="border-b pb-4 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-24" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right column - Booking card */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <div className="space-y-2 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5 rounded" />
                                    <Skeleton className="h-4 w-44" />
                                </div>
                            </div>
                        </div>

                        {/* Provider info */}
                        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                            <Skeleton className="h-6 w-28" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-lg" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar services */}
                <div className="mt-12 space-y-6">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <ServiceCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ProviderCardSkeleton = () => {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
};

export const BookingCardSkeleton = () => {
    return (
        <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-28" />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
            </div>
        </div>
    );
};

export const SearchResultsSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
            ))}
        </div>
    );
};

export const ComparisonTableSkeleton = () => {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="rounded-lg border">
                <div className="grid grid-cols-4 gap-4 p-4 border-b">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-6 w-full" />
                    ))}
                </div>
                {Array.from({ length: 5 }).map((_, row) => (
                    <div key={row} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                        {Array.from({ length: 4 }).map((_, col) => (
                            <Skeleton key={col} className="h-5 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MapSkeleton = () => {
    return (
        <div className="relative w-full h-full min-h-[400px] bg-muted rounded-lg overflow-hidden">
            <Skeleton className="absolute inset-0" />
            <div className="absolute top-4 left-4 right-4 space-y-2">
                <Skeleton className="h-12 w-full bg-background/50" />
            </div>
            <div className="absolute bottom-4 left-4 space-y-2">
                <Skeleton className="h-32 w-64 bg-background/50" />
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-64" />
                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
    return (
        <div className="rounded-lg border">
            <div className="grid gap-4 p-4 border-b" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, row) => (
                <div key={row} className="grid gap-4 p-4 border-b last:border-0" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, col) => (
                        <Skeleton key={col} className="h-5 w-full" />
                    ))}
                </div>
            ))}
        </div>
    );
};
