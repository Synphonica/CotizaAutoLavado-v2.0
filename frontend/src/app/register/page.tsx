"use client";

import Link from "next/link";
import { User, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBFDFF] via-white to-[#F0F9FF] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-[#073642] mb-4">
            Únete a Alto Carwash
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Elige cómo deseas registrarte en nuestra plataforma
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Customer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/sign-up?role=USER"
              className="block h-full group"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full border-2 border-transparent hover:border-[#0F9D58] relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F9D58]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-[#073642] mb-3">
                  Soy Cliente
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Busca, compara y reserva servicios de lavado de autos en toda tu región
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#0F9D58] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Compara precios y servicios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#0F9D58] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Reserva online en segundos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#0F9D58] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Lee reseñas de otros usuarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#0F9D58] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Alertas de precios personalizadas</span>
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="flex items-center justify-between text-[#0F9D58] font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Registrarme como cliente</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Provider Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/provider/register"
              className="block h-full group"
            >
              <div className="bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 h-full relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                {/* Icon */}
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/30">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>

                {/* Badge */}
                <div className="inline-block bg-[#FFD166] text-[#073642] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  RECOMENDADO
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-3">
                  Soy Proveedor
                </h2>
                
                <p className="text-white/90 mb-6">
                  Registra tu negocio y llega a miles de clientes potenciales en tu zona
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#FFD166] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">Dashboard completo de gestión</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#FFD166] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">Recibe reservas automáticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#FFD166] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">Analíticas y reportes en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-[#FFD166] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90">Aumenta tu visibilidad online</span>
                  </li>
                </ul>

                {/* CTA Button */}
                <div className="flex items-center justify-between bg-white text-[#0F9D58] px-6 py-3 rounded-xl font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Registrar mi negocio</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/sign-in"
              className="text-[#0F9D58] font-semibold hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
