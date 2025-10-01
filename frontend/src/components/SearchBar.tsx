"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

export function SearchBar({ action = "/results", initialQuery = "" }: { action?: string; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  
  return (
    <motion.form 
      action={action} 
      className="flex gap-3 w-full max-w-2xl mx-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej: Lavado premium en Las Condes - Compara precios"
          className="pl-10 h-12 text-base border-2 focus:border-blue-500 transition-colors"
        />
      </div>
      <Button 
        type="submit" 
        size="lg"
        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </motion.form>
  );
}


