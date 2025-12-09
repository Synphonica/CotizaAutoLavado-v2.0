"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Sparkles } from "lucide-react";

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
        {
            role: "assistant",
            content: "¡Hola! Soy tu asistente de Alto Carwash. ¿En qué puedo ayudarte hoy?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            // TODO: Implement actual AI chat API call
            // Simulación de respuesta
            setTimeout(() => {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Estoy aquí para ayudarte a encontrar el mejor servicio de lavado para tu auto. ¿Qué tipo de servicio buscas?",
                    },
                ]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Lo siento, hubo un error. Por favor intenta nuevamente.",
                },
            ]);
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            size="lg"
                            className="h-14 w-14 rounded-full bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        >
                            <Bot className="h-6 w-6 text-white" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
                    >
                        <Card className="shadow-2xl border-2 border-[#0F9D58]/20">
                            <CardHeader className="bg-gradient-to-r from-[#0F9D58] to-[#2B8EAD] text-white p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        <CardTitle className="text-lg">Asistente IA</CardTitle>
                                    </div>
                                    <Button
                                        onClick={() => setIsOpen(false)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* Messages */}
                                <div className="h-96 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
                                                        ? "bg-[#0F9D58] text-white"
                                                        : "bg-gray-100 text-gray-900"
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 rounded-lg p-3">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.2s" }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: "0.4s" }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Input */}
                                <div className="border-t p-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                            placeholder="Escribe tu pregunta..."
                                            className="flex-1"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="bg-[#0F9D58] hover:bg-[#0F9D58]/90"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
