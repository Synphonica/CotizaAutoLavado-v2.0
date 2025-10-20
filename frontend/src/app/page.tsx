"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Shield, CheckCircle, Clock,
  MapPin, Star, GitCompare,
  DollarSign, Sparkles, Calculator, Phone,
  ChevronDown, ArrowRight
} from "lucide-react";

export default function NetplanStyleHome() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Netplan Style */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white"></div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Main Headline - Netplan Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                Compara Precios.
                <br />
                <span className="text-blue-600">Ahorra Dinero.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                La forma más simple de <strong>comparar precios</strong> de lavado de autos en Chile.
                Encuentra las mejores ofertas cerca de ti — en segundos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/results">
                    Comenzar Ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-6 text-lg font-semibold rounded-xl"
                  asChild
                >
                  <Link href="#how-it-works">
                    Ver Cómo Funciona
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                ✨ 15,234 cotizaciones realizadas este mes
              </p>
            </motion.div>

            {/* Hero Image/Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-2xl overflow-hidden border border-gray-300">
                <div className="p-8">
                  {/* Mock Dashboard */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Comparación: Lavado Premium</h3>
                        <p className="text-sm text-gray-500">3 proveedores cerca de ti</p>
                      </div>
                      <Badge className="bg-green-500 text-white px-4 py-2">
                        Ahorro: $4,500
                      </Badge>
                    </div>

                    {/* Mock Results */}
                    <div className="space-y-3">
                      {[
                        { name: "AutoClean Pro", price: "15,990", rating: 4.9, badge: "MEJOR PRECIO" },
                        { name: "Premium Wash", price: "19,990", rating: 4.7, badge: null },
                        { name: "Elite Detail", price: "20,490", rating: 4.8, badge: null },
                      ].map((provider, i) => (
                        <div key={i} className={`p-4 rounded-xl border-2 ${i === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{provider.name}</span>
                                {provider.badge && (
                                  <Badge className="bg-green-600 text-white text-xs">{provider.badge}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">{provider.rating}</span>
                                <span className="text-xs text-gray-400">• 1.2 km</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">${provider.price}</div>
                              <Button size="sm" className={i === 0 ? "bg-green-600 hover:bg-green-700" : ""}>
                                Contactar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Numbered Steps like Netplan */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comienza en 30 segundos
              </h2>
              <p className="text-xl text-gray-600">
                Sin registro. Sin complicaciones. Solo resultados inmediatos.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                {
                  number: "1",
                  title: "Ingresa tu Ubicación",
                  description: "Literalmente toma 10 segundos ingresar tu dirección o comuna.",
                  icon: MapPin
                },
                {
                  number: "2",
                  title: "Elige tu Servicio",
                  description: "Selecciona el tipo de lavado: básico, premium, detailing, encerado y más.",
                  icon: Search
                },
                {
                  number: "3",
                  title: "Compara Precios",
                  description: "Ve múltiples cotizaciones con precios, reseñas y distancias.",
                  icon: GitCompare
                },
                {
                  number: "4",
                  title: "Contacta y Ahorra",
                  description: "Elige el mejor precio y contacta directamente al proveedor.",
                  icon: Phone
                }
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex gap-6">
                    {/* Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <step.icon className="h-6 w-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section - Netplan Style */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ¿Cansado de pagar de más?
              </h2>
              <p className="text-xl text-gray-600">
                Si estás buscando precios en Google, llamando proveedores uno por uno,
                o simplemente yendo al lugar más cercano — hay una forma mejor.
              </p>
            </div>

            {/* Pain Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: "❌",
                  title: "Llamar 5 lugares diferentes para comparar",
                  color: "bg-red-50"
                },
                {
                  icon: "❌",
                  title: "No saber si estás pagando un precio justo",
                  color: "bg-red-50"
                },
                {
                  icon: "❌",
                  title: "Perder tiempo buscando opciones manualmente",
                  color: "bg-red-50"
                }
              ].map((pain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${pain.color} rounded-2xl p-6 text-center border-2 border-red-100`}
                >
                  <div className="text-4xl mb-4">{pain.icon}</div>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {pain.title}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Solution */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Alto Carwash hace el trabajo por ti
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Obtienes múltiples cotizaciones en un solo lugar, con precios reales,
                    reseñas verificadas y la ubicación de cada proveedor. Todo en menos de 30 segundos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Different Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ¿Por qué Alto Carwash es diferente?
              </h2>
              <p className="text-xl text-gray-600">
                No somos un directorio más. Somos una plataforma de comparación
                que te ahorra tiempo y dinero real.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Calculator,
                  title: "Comparación Instantánea",
                  description: "Ve precios de múltiples proveedores en segundos. Sin tener que llamar a nadie.",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: Shield,
                  title: "Proveedores Verificados",
                  description: "Todos los proveedores están verificados con reseñas reales de usuarios.",
                  color: "bg-green-50 text-green-600"
                },
                {
                  icon: DollarSign,
                  title: "Precios Transparentes",
                  description: "Sin tarifas ocultas. Los precios que ves son los precios que pagas.",
                  color: "bg-amber-50 text-amber-600"
                },
                {
                  icon: MapPin,
                  title: "Ubicación Precisa",
                  description: "Encuentra proveedores cerca de ti con distancia exacta y mapa interactivo.",
                  color: "bg-purple-50 text-purple-600"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Netplan Style */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-xl text-gray-600">
                Alto Carwash fue creado para resolver problemas reales.
                Aquí hay testimonios de usuarios felices.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "Esto es exactamente lo que necesitaba. Dejé de perder tiempo llamando y nunca más volví atrás.",
                  author: "Carlos M.",
                  source: "Via Email",
                  avatar: "CM"
                },
                {
                  quote: "La app perfecta para cualquiera que quiera comparar precios sin estar rogando por cotizaciones.",
                  author: "María G.",
                  source: "Via Instagram",
                  avatar: "MG"
                },
                {
                  quote: "Solía olvidarme de pedir precios por semanas. Ahora obtengo todo en un solo lugar.",
                  author: "Roberto S.",
                  source: "Via Facebook",
                  avatar: "RS"
                },
                {
                  quote: "Ahorré $4,500 en mi último lavado premium. Los insights son brillantes.",
                  author: "Patricia L.",
                  source: "Via Email",
                  avatar: "PL"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-sm"
                >
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.source}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Netplan Style */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-xl text-gray-600">
                Bueno... llegaste hasta aquí pero aún necesitas más información?
                Lee nuestro FAQ y decide si Alto Carwash es para ti.
              </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {[
                {
                  question: "¿Es realmente gratis?",
                  answer: "Sí, completamente gratis para usuarios. Los proveedores pagan una pequeña comisión solo cuando consiguen un cliente a través de nuestra plataforma."
                },
                {
                  question: "¿Los precios son reales?",
                  answer: "Absolutamente. Trabajamos directamente con los proveedores para asegurar que los precios sean actuales y precisos. Si encuentras una discrepancia, repórtala y la corregimos de inmediato."
                },
                {
                  question: "¿Cómo ganan dinero?",
                  answer: "Cobramos una pequeña comisión a los proveedores cuando consiguen clientes. Los usuarios nunca pagan nada."
                },
                {
                  question: "¿Necesito crear una cuenta?",
                  answer: "No es necesario para comparar precios. Solo necesitas una cuenta si quieres guardar favoritos o ver tu historial de cotizaciones."
                },
                {
                  question: "¿Puedo confiar en las reseñas?",
                  answer: "Sí. Todas las reseñas son de usuarios verificados que han usado el servicio. No permitimos reseñas falsas."
                },
                {
                  question: "¿Qué ciudades cubren?",
                  answer: "Actualmente cubrimos 35 ciudades en Chile, principalmente en la Región Metropolitana, Valparaíso y Concepción. Estamos expandiéndonos constantemente."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="border-2 border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 text-lg pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${openFaq === index ? 'transform rotate-180' : ''
                        }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Netplan Style */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Crea tu cotización GRATIS
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Comparar precios de lavado de autos no debería ser estresante o confuso.
              Con Alto Carwash, es simple, rápido, y realmente satisfactorio.
              Ya sea que estés buscando ahorrar, encontrar calidad, o simplemente
              quieres sentirte más organizado — Alto Carwash es la herramienta para lograrlo.
            </p>

            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-xl shadow-2xl hover:shadow-3xl transition-all"
              asChild
            >
              <Link href="/results">
                Comenzar Ahora
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>

            <div className="mt-8 flex items-center justify-center gap-8 text-blue-200 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Sin registro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Resultados instantáneos</span>
              </div>
            </div>

            {/* Mock Icons - Goodbye/Hello */}
            <div className="mt-16 pt-16 border-t border-blue-500/30">
              <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm text-blue-200">Adiós llamadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm text-blue-200">Adiós búsquedas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm text-blue-200">Adiós confusión</div>
                </div>
              </div>
              <div className="mt-8 text-3xl">✨</div>
              <div className="mt-2 text-xl font-semibold">Hola Alto Carwash</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
