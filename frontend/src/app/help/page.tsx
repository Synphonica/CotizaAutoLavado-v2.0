"use client";

import { ModernNavbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
    HelpCircle,
    Search,
    MessageSquare,
    Mail,
    Phone,
    Book,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            category: "Cuenta y Perfil",
            questions: [
                {
                    q: "¿Cómo creo una cuenta?",
                    a: "Haz clic en 'Crear Cuenta' en la esquina superior derecha, completa tus datos y verifica tu email.",
                },
                {
                    q: "¿Cómo edito mi perfil?",
                    a: "Ve a Mi Perfil desde el menú de usuario y edita tu información personal.",
                },
                {
                    q: "¿Cómo cambio mi contraseña?",
                    a: "En Configuración > Seguridad puedes cambiar tu contraseña.",
                },
            ],
        },
        {
            category: "Reservas",
            questions: [
                {
                    q: "¿Cómo hago una reserva?",
                    a: "Busca el servicio deseado, selecciona fecha y hora, y confirma tu reserva.",
                },
                {
                    q: "¿Puedo cancelar una reserva?",
                    a: "Sí, desde Mis Reservas puedes cancelar hasta 24 horas antes sin cargo.",
                },
                {
                    q: "¿Cómo reprogramo una cita?",
                    a: "Cancela la reserva actual y crea una nueva con la fecha deseada.",
                },
            ],
        },
        {
            category: "Pagos y Precios",
            questions: [
                {
                    q: "¿Cómo funcionan las alertas de precio?",
                    a: "Configura un precio objetivo y te notificaremos cuando el servicio alcance ese precio.",
                },
                {
                    q: "¿Los precios incluyen IVA?",
                    a: "Sí, todos los precios mostrados incluyen IVA.",
                },
                {
                    q: "¿Hay garantía de mejor precio?",
                    a: "Comparamos precios de múltiples proveedores para mostrarte las mejores opciones.",
                },
            ],
        },
        {
            category: "Favoritos y Comparación",
            questions: [
                {
                    q: "¿Cómo guardo favoritos?",
                    a: "Haz clic en el ícono de corazón en cualquier servicio para agregarlo a favoritos.",
                },
                {
                    q: "¿Cuántos servicios puedo comparar?",
                    a: "Puedes comparar hasta 4 servicios simultáneamente.",
                },
                {
                    q: "¿Los favoritos expiran?",
                    a: "No, tus favoritos se mantienen indefinidamente hasta que los elimines.",
                },
            ],
        },
    ];

    const contactOptions = [
        {
            icon: Mail,
            title: "Email",
            description: "soporte@altocarwash.cl",
            action: "Enviar Email",
            color: "blue",
        },
        {
            icon: Phone,
            title: "Teléfono",
            description: "+56 9 1234 5678",
            action: "Llamar",
            color: "green",
        },
        {
            icon: MessageSquare,
            title: "Chat en Vivo",
            description: "Respuesta inmediata",
            action: "Iniciar Chat",
            color: "purple",
        },
    ];

    return (
        <>
            <ModernNavbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 lg:ml-72 sidebar-collapsed:lg:ml-20 transition-all duration-300">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <HelpCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Centro de Ayuda</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            ¿En qué podemos ayudarte?
                        </p>

                        {/* Search */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Busca en preguntas frecuentes..."
                                className="pl-12 h-14 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </motion.div>

                    {/* Contact Options */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                    >
                        {contactOptions.map((option, index) => {
                            const Icon = option.icon;
                            return (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 text-center">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 bg-${option.color}-100 rounded-full mb-4`}>
                                            <Icon className={`h-6 w-6 text-${option.color}-600`} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{option.description}</p>
                                        <Button variant="outline" size="sm" className="w-full">
                                            {option.action}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </motion.div>

                    {/* FAQs */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="space-y-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Preguntas Frecuentes</h2>
                            <p className="text-gray-600">Encuentra respuestas rápidas a tus dudas</p>
                        </div>

                        {faqs.map((section, sectionIndex) => (
                            <Card key={sectionIndex}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Book className="h-5 w-5 text-blue-600" />
                                        {section.category}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {section.questions.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                                        {item.q}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 ml-6">{item.a}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>

                    {/* Additional Help */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-12"
                    >
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-8 text-center">
                                <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    ¿No encontraste lo que buscabas?
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Nuestro equipo de soporte está disponible para ayudarte
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button>
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Contactar Soporte
                                    </Button>
                                    <Button variant="outline">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Enviar Consulta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
