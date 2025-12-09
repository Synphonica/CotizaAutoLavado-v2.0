/**
 * Hook para exportar comparaciones a PDF
 */

'use client';

import { useState } from 'react';
import { useToast, toastMessages } from '@/hooks/use-toast';

interface ExportPdfOptions {
    search?: string;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    maxDistanceKm?: number;
}

export function useExportPdf() {
    const [isExporting, setIsExporting] = useState(false);
    const toast = useToast();

    const exportToPdf = async (options: ExportPdfOptions = {}) => {
        try {
            setIsExporting(true);

            const params = new URLSearchParams();
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });

            const loadingToast = toast.loading('Generando PDF...');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/comparison/export-pdf?${params.toString()}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/pdf',
                    },
                }
            );

            toast.dismiss(loadingToast);

            if (!response.ok) {
                throw new Error('Error al generar el PDF');
            }

            // Obtener el blob del PDF
            const blob = await response.blob();

            // Crear URL temporal
            const url = window.URL.createObjectURL(blob);

            // Crear elemento <a> temporal para descarga
            const link = document.createElement('a');
            link.href = url;
            link.download = `comparacion-servicios-${Date.now()}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF descargado exitosamente', {
                description: 'Revisa tu carpeta de descargas',
            });
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Error al exportar PDF. Intenta nuevamente.'
            );
        } finally {
            setIsExporting(false);
        }
    };

    return {
        exportToPdf,
        isExporting,
    };
}
