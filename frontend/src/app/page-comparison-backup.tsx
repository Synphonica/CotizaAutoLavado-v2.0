"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Shield, CheckCircle, Clock,
  Users, MapPin, Star, GitCompare,
  DollarSign, Sparkles, Calculator, Phone,
  ChevronDown, ArrowRight, Check, X
} from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeComparison, setActiveComparison] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveComparison((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const comparisonExamples = [
    {
      service: "Lavado Express",
      providers: [
        { name: "AutoClean Pro", price: "8.990", rating: 4.8, distance: "1.2 km" },
        { name: "Speed Wash", price: "12.500", rating: 4.6, distance: "2.1 km" },
        { name: "Quick Clean", price: "9.800", rating: 4.7, distance: "0.8 km" }
      ],
      savings: "3.510"
    },
    {
      service: "Lavado Premium",
      providers: [
        { name: "Premium Car Spa", price: "15.990", rating: 4.9, distance: "1.5 km" },
        { name: "Elite Wash", price: "19.990", rating: 4.7, distance: "3.2 km" },
        { name: "Pro Detailing", price: "17.500", rating: 4.8, distance: "2.0 km" }
      ],
      savings: "4.000"
    },
    {
      service: "Detailing Completo",
      providers: [
        { name: "Master Detail", price: "45.990", rating: 4.9, distance: "2.5 km" },
        { name: "Premium Detail", price: "59.990", rating: 4.8, distance: "4.1 km" },
        { name: "Expert Clean", price: "52.000", rating: 4.7, distance: "3.0 km" }
      ],
      savings: "14.000"
    }
  ];

  const stats = [
    { number: "150+", label: "Proveedores Activos", icon: Users },
    { number: "15,234", label: "Cotizaciones Realizadas", icon: Calculator },
    { number: "35", label: "Ciudades", icon: MapPin },
    { number: "$2.5M", label: "Ahorros Generados", icon: TrendingDown }
  ];

  const features = [
    {
      icon: Calculator,
      title: "Cotización Instantánea",
      description: "Obtén precios de múltiples proveedores en segundos",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: GitCompare,
      title: "Comparación Inteligente",
      description: "Compara precios, distancia, calificaciones y servicios incluidos",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: TrendingDown,
      title: "Ahorro Garantizado",
      description: "Encuentra automáticamente las mejores ofertas y promociones",
      color: "text-amber-600 bg-amber-50"
    },
    {
      icon: Shield,
      title: "Proveedores Verificados",
      description: "Todos nuestros proveedores están verificados y tienen reseñas reales",
      color: "text-purple-600 bg-purple-50"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Ejecutivo",
      city: "Las Condes",
      rating: 5,
      content: "Ahorré $4,500 comparando precios antes de elegir. La plataforma es súper fácil de usar y confiable.",
      savings: "4.500"
    },
    {
      name: "María González",
      role: "Doctora",
      city: "Providencia",
      rating: 5,
      content: "Perfecta para comparar opciones. Encontré un detailing premium 30% más barato que mi proveedor habitual.",
      savings: "15.000"
    },
    {
      name: "Roberto Silva",
      role: "Ingeniero",
      city: "Ñuñoa",
      rating: 5,
      content: "La mejor herramienta para cotizar servicios. Siempre encuentro ofertas que no conocía.",
      savings: "2.800"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      icon: Search,
      title: "Busca tu servicio",
      description: "Ingresa tu ubicación y el tipo de lavado que necesitas"
    },
    {
      step: "2",
      icon: GitCompare,
      title: "Compara opciones",
      description: "Ve precios, reseñas, distancias y servicios incluidos"
    },
    {
      step: "3",
      icon: Phone,
      title: "Contacta directamente",
      description: "Llama o envía mensaje al proveedor que más te convenga"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Focused on Price Comparison */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-white/20 text-white border-white/30 px-6 py-2 text-sm font-medium">
                💰 Ahorra hasta un 40% comparando precios
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="text-blue-200">Cotiza y compara</span><br />
              precios de lavado de autos
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 text-blue-100 font-light leading-relaxed max-w-3xl mx-auto"
            >
              La única plataforma que te permite <strong>cotizar precios de múltiples proveedores</strong> y encontrar automáticamente las mejores ofertas cerca de ti
            </motion.p>

            {/* Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20">
                <SearchBar />
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl"
                asChild
              >
                <Link href="/results">
                  <Calculator className="mr-2 h-5 w-5" />
                  Cotizar Ahora
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/compare">
                  <GitCompare className="mr-2 h-5 w-5" />
                  Ver Comparación
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-blue-200 text-sm"
            >
              ✨ Más de 15,000 cotizaciones realizadas este mes
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Comparison Example */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 px-4 py-2">
              Comparación en Tiempo Real
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Así <span className="text-green-600">ahorras dinero</span> con cada búsqueda
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ve cómo otros usuarios están ahorrando miles de pesos comparando precios
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-green-700">
                    📊 Comparación: {comparisonExamples[activeComparison].service}
                  </CardTitle>
                  <Badge className="bg-green-500 text-white">
                    Ahorro: ${comparisonExamples[activeComparison].savings}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {comparisonExamples[activeComparison].providers.map((provider, index) => (
                  <div key={provider.name} className={`p-6 border-b ${index === 0 ? 'bg-green-50' : 'bg-white'} ${index === comparisonExamples[activeComparison].providers.length - 1 ? 'border-b-0' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-gray-900">{provider.name}</div>
                          {index === 0 && (
                            <Badge className="bg-green-500 text-white text-xs">MEJOR PRECIO</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{provider.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{provider.distance}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">${provider.price}</div>
                        <Button
                          size="sm"
                          variant={index === 0 ? "default" : "outline"}
                          className={index === 0 ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comparison indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {comparisonExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveComparison(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === activeComparison ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 px-4 py-2">
              ¿Cómo Funciona?
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Encuentra las <span className="text-blue-600">mejores ofertas</span> en 3 pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {/* Step connector */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-200 z-0"
                    style={{ width: 'calc(100% - 2rem)', left: '2rem' }} />
                )}

                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 relative">
                    <step.icon className="h-8 w-8" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-amber-100 text-amber-700 px-4 py-2">
              Ventajas de Alto Carwash
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              La plataforma más <span className="text-amber-600">completa</span> del mercado
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 px-4 py-2">
              Testimonios de Ahorro
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Usuarios reales, <span className="text-green-600">ahorros reales</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Savings Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge className="bg-green-500 text-white">
                        Ahorró ${testimonial.savings}
                      </Badge>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-gray-500">{testimonial.city}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para <span className="text-blue-200">ahorrar dinero</span>?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a más de 15,000 usuarios que ya están ahorrando comparando precios.
            Es gratis y solo toma unos segundos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl"
              asChild
            >
              <Link href="/results">
                <Calculator className="mr-2 h-5 w-5" />
                Cotizar Gratis
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              asChild
            >
              <Link href="/compare">
                <Eye className="mr-2 h-5 w-5" />
                Ver Ejemplo
              </Link>
            </Button>
          </div>

          <div className="text-blue-200 text-sm">
            💡 Tip: Los usuarios ahorran en promedio $3,200 por servicio
          </div>
        </div>
      </section>
    </div>
  );
}