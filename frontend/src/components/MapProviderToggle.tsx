"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export function MapProviderToggle() {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-lg border">
        <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <span className="text-sm">Google Maps</span>
      </div>
      
      <Badge variant="secondary" className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Google Maps
      </Badge>
    </motion.div>
  );
}
