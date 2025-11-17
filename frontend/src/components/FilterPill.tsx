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
        className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-[#FFD166] text-[#073642] border-[#FFD166] shadow-lg shadow-[#FFD166]/30"
            : "bg-white text-[#073642] border-emerald-200 hover:border-[#0F9D58] hover:text-[#0F9D58] hover:bg-emerald-50"
          }`}
      >
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    </motion.button>
  );
}


