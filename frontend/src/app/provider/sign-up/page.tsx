'use client';

import { SignUp } from '@clerk/nextjs';
import { Building2 } from 'lucide-react';

export default function ProviderSignUpPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-2xl flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-[#073642] dark:text-white">
                            Registro de Proveedor
                        </h1>
                    </div>
                    <p className="text-[#073642]/70 dark:text-gray-300">
                        Crea tu cuenta y luego completa los datos de tu negocio
                    </p>
                </div>

                {/* Clerk SignUp Component */}
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: 'mx-auto',
                            card: 'shadow-xl border-2 border-[#0F9D58]/20',
                            headerTitle: 'hidden',
                            headerSubtitle: 'hidden',
                            socialButtonsBlockButton: 'border-2 border-[#0F9D58]/20 hover:bg-[#0F9D58]/10',
                            formButtonPrimary: 'bg-[#0F9D58] hover:bg-[#0F9D58]/90',
                            footerActionLink: 'text-[#0F9D58] hover:text-[#0F9D58]/80',
                        },
                    }}
                    redirectUrl="/provider/onboarding"
                    signInUrl="/provider/sign-in"
                />

                {/* Info adicional */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[#073642]/60 dark:text-gray-400">
                        Al registrarte, aceptas nuestros{' '}
                        <a href="/terms" className="text-[#0F9D58] hover:underline">
                            Términos y Condiciones
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
