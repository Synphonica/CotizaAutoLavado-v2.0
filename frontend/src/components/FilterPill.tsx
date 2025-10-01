"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function FilterPill({ label, active, icon: Icon }: { label: string; active?: boolean; icon?: React.ComponentType<{ className?: string }> }) {
  const [isActive, setIsActive] = useState(Boolean(active));
  
  return (
    <motion.button
      type="button"
      onClick={() => setIsActive((v) => !v)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="transition-all duration-200"
    >
      <Badge 
        variant={isActive ? "default" : "outline"}
        className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isActive 
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg" 
            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-600"
        }`}
      >
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    </motion.button>
  );
}


