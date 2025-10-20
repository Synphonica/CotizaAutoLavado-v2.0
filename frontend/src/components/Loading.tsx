'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
    message?: string;
    description?: string;
}

export function LoadingOverlay({ message = 'Cargando...', description }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-4"
            >
                <div className="flex flex-col items-center text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 className="h-12 w-12 text-blue-600" />
                    </motion.div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">{message}</h3>
                    {description && (
                        <p className="mt-2 text-sm text-gray-600">{description}</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={className}
        >
            <Loader2 className={`${sizes[size]} text-blue-600`} />
        </motion.div>
    );
}

interface LoadingDotsProps {
    className?: string;
}

export function LoadingDots({ className = '' }: LoadingDotsProps) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                    }}
                    className="h-2 w-2 bg-blue-600 rounded-full"
                />
            ))}
        </div>
    );
}
