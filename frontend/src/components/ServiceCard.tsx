"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Heart } from "lucide-react";

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  provider: { id: string; businessName: string; city?: string };
  rating?: number;
  isFavorite?: boolean;
  discount?: number;
};

export function ServiceCard({ item, index = 0 }: { item: ServiceItem; index?: number }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="h-3 w-3" />
                <span>{item.provider.businessName}</span>
                {item.provider.city && <span>· {item.provider.city}</span>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            {item.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{item.rating}</span>
              </div>
            )}
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              30 min
            </Badge>
            {item.discount && (
              <Badge variant="destructive" className="text-xs">
                -{item.discount}%
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">${item.price.toLocaleString()}</span>
              {item.discount && (
                <span className="text-sm text-gray-500 line-through">
                  ${Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 mt-auto">
          <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Link href={`/services/${item.id}`}>
              Ver detalle
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}


