"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Percent, Heart } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FavoritesAPI, formatPrice, calculateDiscountedPrice, getImageUrl } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import Image from "next/image";

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    provider: {
        id: string;
        businessName: string;
        city?: string;
        region?: string;
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    rating?: number;
    discount?: number;
    duration?: number;
    description?: string;
    images?: string[];
    category?: string;
}

interface ServiceCardProps {
    item: ServiceItem;
    index?: number;
}

export function ServiceCard({ item, index = 0 }: ServiceCardProps) {
    const { isAuthenticated } = useAuth();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            checkIfFavorite();
        }
    }, [isAuthenticated, item.id]);

    const checkIfFavorite = async () => {
        try {
            const result = await FavoritesAPI.isFavorite(item.id);
            setIsFavorite(result);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // TODO: Mostrar modal de login o redireccionar
            return;
        }

        setIsLoadingFavorite(true);
        try {
            if (isFavorite) {
                await FavoritesAPI.removeFavorite(item.id);
                setIsFavorite(false);
            } else {
                await FavoritesAPI.addFavorite(item.id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoadingFavorite(false);
        }
    };

    const discountedPrice = calculateDiscountedPrice(item.price, item.discount);
    const mainImage = item.images?.[0] || null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group"
        >
            <Card className="h-full overflow-hidden border-2 border-emerald-100 shadow-lg hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
                {/* Imagen del servicio */}
                {mainImage && (
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                        <Image
                            src={getImageUrl(mainImage)}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {item.discount && (
                            <div className="absolute top-3 left-3">
                                <Badge className="bg-[#FFD166] text-[#073642] hover:bg-[#FFD166]/90 font-semibold shadow-lg">
                                    <Percent className="h-3 w-3 mr-1" />
                                    -{item.discount}%
                                </Badge>
                            </div>
                        )}
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white"
                                onClick={toggleFavorite}
                                disabled={isLoadingFavorite}
                            >
                                <Heart
                                    className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                        }`}
                                />
                            </Button>
                        )}
                    </div>
                )}

                <CardContent className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[#073642] group-hover:text-[#0F9D58] transition-colors line-clamp-2">
                                {item.name}
                            </h3>
                            {item.category && (
                                <Badge variant="secondary" className="mt-1 bg-emerald-100 text-[#0F9D58] border-emerald-200">
                                    {item.category}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {item.description && (
                        <p className="text-sm text-[#073642]/70 mb-3 line-clamp-2">
                            {item.description}
                        </p>
                    )}

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#073642]/80">
                            <MapPin className="h-4 w-4 text-[#0F9D58]" />
                            <span className="font-medium">{item.provider.businessName}</span>
                        </div>

                        {(item.provider.city || item.provider.region) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 ml-6">
                                {item.provider.city && (
                                    <span>{item.provider.city}</span>
                                )}
                                {item.provider.city && item.provider.region && (
                                    <span>•</span>
                                )}
                                {item.provider.region && (
                                    <span>{item.provider.region}</span>
                                )}
                            </div>
                        )}

                        {item.rating && (
                            <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-[#FFD166] text-[#FFD166]" />
                                    <span className="font-medium">{item.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        )}

                        {item.duration && (
                            <div className="flex items-center gap-2 text-sm text-[#073642]/80">
                                <Clock className="h-4 w-4 text-[#2B8EAD]" />
                                <span>{item.duration} min</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-col">
                            {item.discount ? (
                                <>
                                    <span className="text-sm text-[#073642]/50 line-through">
                                        {formatPrice(item.price)}
                                    </span>
                                    <span className="text-xl font-bold text-[#0F9D58]">
                                        {formatPrice(discountedPrice)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-[#073642]">
                                    {formatPrice(item.price)}
                                </span>
                            )}
                        </div>
                        <Link href={`/services/${item.id}`}>
                            <Button className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] font-semibold shadow-lg shadow-[#FFD166]/30 transition-all">
                                Ver detalles
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}