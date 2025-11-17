"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Shield, CheckCircle, Clock,
  MapPin, Star, GitCompare,
  DollarSign, Sparkles, Calculator, Phone,
  ChevronDown, ArrowRight, Droplets, Zap, Award
} from "lucide-react";
import Image from "next/image";
import { ModernNavbar } from "@/components/Navbar";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-white dark:bg-gray-900 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
        {/* Hero Section - Energetic Style */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
          {/* Gradient Glow Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#0F9D58]/20 to-[#2B8EAD]/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#FFD166]/15 to-[#0F9D58]/15 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Logo/Brand */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-2xl flex items-center justify-center shadow-lg">
                    <Droplets className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[#073642] dark:text-white tracking-wider">ALTO CARWASH</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl font-black text-[#073642] dark:text-white mb-6 leading-tight">
                  Encuentra el
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD]">
                    mejor precio
                  </span>
                  <br />
                  para tu auto
                </h1>

                <p className="text-xl md:text-2xl text-[#073642]/80 dark:text-gray-300 mb-12 leading-relaxed">
                  Compara cientos de autolavados cerca de ti
                  y ahorra hasta <strong className="text-[#0F9D58]">$5,000</strong> en cada servicio
                </p>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] px-16 py-8 text-2xl font-bold rounded-full shadow-2xl shadow-[#FFD166]/50 hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/results">
                    COMPARAR AHORA
                  </Link>
                </Button>
              </motion.div>

              {/* Right: Phone Mockup with Glow */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative lg:flex hidden justify-center items-center"
              >
                <div className="relative max-w-sm w-full">
                  {/* Glow Effect */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-[#0F9D58]/30 via-[#2B8EAD]/30 to-[#FFD166]/30 rounded-[4rem] blur-3xl"></div>

                  {/* Phone Frame */}
                  <div className="relative bg-[#1F2937] rounded-[3.5rem] p-4 shadow-2xl border-[10px] border-[#1F2937]">
                    <div className="bg-white rounded-[2.8rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                      {/* Mock App Screen */}
                      <div className="relative h-full bg-gradient-to-br from-emerald-50 to-cyan-50">
                        {/* Status Bar */}
                        <div className="px-6 pt-3 pb-2 flex justify-between items-center text-xs text-gray-600">
                          <span className="font-semibold">9:41</span>
                          <div className="flex gap-1 items-center">
                            <div className="w-4 h-3 border border-gray-600 rounded-sm"></div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-4 space-y-3">
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-black text-[#073642]">Resultados cerca de ti</h3>
                            <p className="text-xs text-[#073642]/60 mt-1">3 autolavados encontrados</p>
                          </div>

                          {/* Mock Service Cards */}
                          {[
                            { name: "AutoLavado Pro", price: 17000, rating: "4.9", distance: "1.2 km", best: true },
                            { name: "Lavado Express", price: 19000, rating: "4.8", distance: "1.5 km", best: false },
                            { name: "Clean Car Plus", price: 21000, rating: "4.7", distance: "2.1 km", best: false }
                          ].map((item, i) => (
                            <div
                              key={i}
                              className={`bg-white rounded-2xl p-4 shadow-md border-2 transition-all ${item.best ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
                                }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <div className="font-bold text-[#073642] text-sm mb-1">{item.name}</div>
                                  <div className="flex items-center gap-1 text-xs text-[#073642]/60">
                                    <Star className="h-3 w-3 fill-[#FFD166] text-[#FFD166]" />
                                    <span>{item.rating}</span>
                                    <span>•</span>
                                    <MapPin className="h-3 w-3" />
                                    <span>{item.distance}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-black text-green-600">${item.price.toLocaleString()}</div>
                                  {item.best && (
                                    <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5 mt-1">
                                      MEJOR PRECIO
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notch */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1F2937] rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* About Section - Light with Image */}
        <section className="relative py-32 overflow-hidden bg-white dark:bg-gray-900">
          {/* Background Image Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1920')] bg-cover bg-center opacity-10 dark:opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-gray-900 dark:via-transparent dark:to-gray-900"></div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black mb-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD]">
                  Acerca de
                  <br />
                  Alto Carwash
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-[#073642]/80 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                La primera plataforma de Chile que te permite <strong className="text-[#0F9D58]">comparar precios</strong> de
                autolavados en tiempo real. Encuentra el mejor servicio cerca de ti, con precios transparentes,
                reseñas verificadas y ahorro garantizado. Todo en <strong className="text-[#2B8EAD]">menos de 30 segundos</strong>.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Key Features - Circles with Icons */}
        <section className="py-32 bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F9C74F] mb-4">
                Características Clave
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  icon: Calculator,
                  title: "Comparación Instantánea",
                  description: "Ve precios de múltiples autolavados en segundos. Sin llamadas, sin esperas.",
                  gradient: "from-[#0F9D58] to-[#2B8EAD]"
                },
                {
                  icon: Shield,
                  title: "Proveedores Verificados",
                  description: "Todos los autolavados están verificados con reseñas reales y calificaciones auténticas.",
                  gradient: "from-[#2B8EAD] to-[#0F9D58]"
                },
                {
                  icon: Zap,
                  title: "Ahorro Garantizado",
                  description: "Ahorra hasta $5,000 por servicio comparando precios en tiempo real.",
                  gradient: "from-[#FFD166] to-[#0F9D58]"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  {/* Circle Icon */}
                  <div className="relative inline-block mb-8">
                    <div className={`w-48 h-48 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-24 w-24 text-white" strokeWidth={1.5} />
                    </div>
                    {/* Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                  </div>

                  {/* Content Box */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-bold text-[#073642] dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-[#073642]/70 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Full Width Image Background */}
        <section className="relative py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1920')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F9D58]/95 to-[#2B8EAD]/95"></div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-black mb-8">
                <span className="text-white">
                  Cómo Funciona
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-16 leading-relaxed">
                En 3 pasos simples encontrarás el mejor precio para el lavado de tu auto.
                Sin complicaciones, sin pérdida de tiempo. Solo resultados reales.
              </p>

              <Button
                size="lg"
                className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] px-16 py-8 text-2xl font-bold rounded-full shadow-2xl shadow-[#FFD166]/50 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/results">
                  EMPEZAR AHORA
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Benefits - Split with Image */}
        <section className="relative py-32 overflow-hidden bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Image */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100"></div>
                  {/* Placeholder for car wash image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-32 w-32 text-[#0F9D58]/50" />
                  </div>
                </div>
              </motion.div>

              {/* Right: Content Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 border-2 border-[#0F9D58]/20 dark:border-[#0F9D58]/40 rounded-3xl p-12 shadow-2xl">
                  <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD] mb-8">
                    Ahorra Tiempo
                    y Dinero
                  </h2>

                  <p className="text-xl text-[#073642] dark:text-gray-200 mb-8 leading-relaxed">
                    Deja de perder tiempo llamando a diferentes autolavados o buscando en Google.
                    Con Alto Carwash obtienes todas las opciones en un solo lugar, con precios actualizados
                    y la garantía de encontrar la mejor oferta.
                  </p>

                  <Button
                    size="lg"
                    className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] px-12 py-6 text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                    asChild
                  >
                    <Link href="/results">
                      VER OPCIONES
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Reviews - Light Cards */}
        <section className="py-32 bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F9C74F] mb-4">
                Opiniones
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "Ahorré $4,500 en mi último lavado premium. La plataforma es increíblemente fácil de usar.",
                  author: "Carlos Muñoz",
                  role: "Usuario Verificado"
                },
                {
                  quote: "Ya no pierdo tiempo llamando. Encuentro el mejor precio en segundos y listo.",
                  author: "María González",
                  role: "Cliente Frecuente"
                },
                {
                  quote: "Transparencia total en precios. Sin sorpresas ni cargos ocultos. Excelente servicio.",
                  author: "Roberto Silva",
                  role: "Nuevo Usuario"
                }
              ].map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 h-full">
                    <p className="text-[#073642] dark:text-gray-200 text-lg mb-8 leading-relaxed">
                      "{review.quote}"
                    </p>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-[#0F9D58] font-bold text-lg">{review.author}</p>
                      <p className="text-[#073642]/60 dark:text-gray-400">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Gradient Glow */}
        <section className="relative py-32 overflow-hidden bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F9D58]/10 via-[#2B8EAD]/10 to-[#FFD166]/10 dark:from-[#0F9D58]/20 dark:via-[#2B8EAD]/20 dark:to-[#FFD166]/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#0F9D58]/20 to-[#2B8EAD]/20 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#FFD166]/20 to-[#0F9D58]/20 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-8xl font-black text-[#073642] dark:text-white mb-8">
                ¿Listo para ahorrar?
              </h2>

              <p className="text-2xl md:text-3xl text-[#073642]/80 dark:text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
                Únete a miles de usuarios que ya están ahorrando dinero
                en cada lavado de auto
              </p>

              <Button
                size="lg"
                className="bg-[#FFD166] hover:bg-[#FFD166]/90 text-[#073642] px-20 py-10 text-3xl font-black rounded-full shadow-2xl shadow-[#FFD166]/50 hover:scale-110 transition-all duration-300"
                asChild
              >
                <Link href="/results">
                  COMENZAR GRATIS
                </Link>
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
                {[
                  { value: "15K+", label: "Usuarios" },
                  { value: "200+", label: "Autolavados" },
                  { value: "$5K", label: "Ahorro Promedio" },
                  { value: "4.9★", label: "Calificación" }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-300 text-sm uppercase tracking-wider dark:text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
