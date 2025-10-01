"use client";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car, Search, MapPin, TrendingUp, User, Building } from "lucide-react";

export function Navbar() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  
  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-8"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors">
            <Car className="h-6 w-6" />
            Alto Carwash
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/results" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <Search className="h-4 w-4" />
              Buscar
            </Link>
            <Link href="/map" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Mapa
            </Link>
            <Link href="/compare" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Comparar
            </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link href="/provider" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  Proveedor
                </Link>
          </nav>
        </motion.div>
        
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {hasClerk ? (
            <>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" asChild>
                    <Link href="/sign-in">Ingresar</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sign-up">Crear cuenta</Link>
                  </Button>
                </div>
              </SignedOut>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Ingresar</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Crear cuenta</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
}


