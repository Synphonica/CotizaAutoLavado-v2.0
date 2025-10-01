"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, Star, MapPin, Clock, Shield, Users, 
  ArrowRight, CheckCircle, Zap, Trophy, Heart
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Zap,
      title: "Súper rápido",
      description: "Encuentra servicios en segundos, no en horas"
    },
    {
      icon: Trophy,
      title: "Mejor precio",
      description: "Comparamos para que siempre pagues menos"
    },
    {
      icon: Shield,
      title: "100% confiable",
      description: "Todos los proveedores están verificados"
    },
    {
      icon: Heart,
      title: "Fácil de usar",
      description: "Diseñado para que cualquiera pueda usarlo"
    }
  ];

  const stats = [
    { number: "15K+", label: "Usuarios felices", icon: Users },
    { number: "800+", label: "Servicios activos", icon: Car },
    { number: "25", label: "Ciudades cubiertas", icon: MapPin },
    { number: "4.9", label: "Calificación promedio", icon: Star }
  ];

  const popularServices = [
    { 
      name: "Lavado Express", 
      price: "8.990", 
      originalPrice: "12.990",
      rating: 4.8, 
      reviews: 342,
      badge: "Más popular"
    },
    { 
      name: "Lavado Premium", 
      price: "15.990", 
      originalPrice: "19.990",
      rating: 4.9, 
      reviews: 156,
      badge: "Mejor calidad"
    },
    { 
      name: "Lavado + Encerado", 
      price: "24.990", 
      originalPrice: "29.990",
      rating: 4.7, 
      reviews: 89,
      badge: "Más completo"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Alto Carwash</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Servicios
              </Link>
              <Link href="/map" className="text-gray-600 hover:text-blue-600 transition-colors">
                Mapa
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                Nosotros
              </Link>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/results">Buscar ahora</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          {/* Floating elements */}
          <div className="absolute top-20 right-10 w-20 h-20 bg-blue-100 rounded-full opacity-60 animate-pulse" />
          <div className="absolute bottom-20 left-10 w-16 h-16 bg-indigo-100 rounded-full opacity-40 animate-bounce" />
          
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
              >
                <CheckCircle className="w-4 h-4" />
                La plataforma #1 de autolavados en Chile
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Encuentra el{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    mejor lavado
                  </span>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  />
                </span>{" "}
                para tu auto
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
              >
                Compara precios, lee reseñas reales y reserva el servicio perfecto. 
                Todo en un solo lugar, <strong className="text-gray-900">súper fácil</strong>.
              </motion.p>

              {/* Search Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="max-w-2xl mx-auto mb-12"
              >
                <SearchBar />
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              >
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all" 
                  asChild
                >
                  <Link href="/results" className="flex items-center gap-2">
                    Explorar servicios
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-medium transition-all" 
                  asChild
                >
                  <Link href="/map" className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Ver en mapa
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                ¿Por qué usar Alto Carwash?
              </motion.h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Hicimos que encontrar el autolavado perfecto sea increíblemente fácil
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Servicios más solicitados
              </h2>
              <p className="text-xl text-gray-600">
                Los favoritos de nuestros usuarios con los mejores precios
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {popularServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                    <CardContent className="p-8">
                      {/* Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {service.badge}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-700">{service.rating}</span>
                          <span className="text-gray-500 text-sm">({service.reviews})</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.name}</h3>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl font-bold text-blue-600">${service.price}</span>
                        <span className="text-lg text-gray-400 line-through">${service.originalPrice}</span>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg transition-all" asChild>
                        <Link href="/results" className="flex items-center justify-center gap-2">
                          Ver ofertas
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Listo para el mejor lavado de tu auto?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Únete a miles de usuarios que ya encontraron su autolavado ideal
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all" 
                  asChild
                >
                  <Link href="/results" className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Encontrar mi lavado
                  </Link>
                </Button>
              </div>
              
              <p className="text-blue-200 text-sm mt-6 font-medium">
                ✨ Gratis • Sin registro • Más de 800 servicios
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
          >
            <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <SearchBar />
            </Card>
          </motion.div>
          
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button variant="outline" asChild>
              <Link href="/results">Ver todos los servicios</Link>
            </Button>
            <Button asChild>
              <Link href="/results">Buscar ahora</Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          className="py-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir Alto Carwash?</h2>
            <p className="text-gray-600 text-lg">Todo lo que necesitas para cuidar tu auto</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-16 text-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Card className="max-w-4xl mx-auto p-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-2xl">
            <CardContent className="text-center">
              <Car className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">¿Listo para encontrar tu autolavado ideal?</h2>
              <p className="text-blue-100 text-lg mb-8">
                Únete a miles de usuarios que ya encontraron el mejor servicio para su auto
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/results">Comenzar búsqueda</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}
