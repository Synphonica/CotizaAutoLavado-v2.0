/**
 * Componente de botón para exportar comparaciones a PDF
 */

'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExportPdf } from '@/hooks/use-export-pdf';

interface ExportPdfButtonProps {
    search?: string;
    type?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    latitude?: number;
    longitude?: number;
    maxDistanceKm?: number;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function ExportPdfButton({
    search,
    type,
    category,
    minPrice,
    maxPrice,
    latitude,
    longitude,
    maxDistanceKm,
    variant = 'outline',
    size = 'default',
    className,
}: ExportPdfButtonProps) {
    const { exportToPdf, isExporting } = useExportPdf();

    const handleExport = () => {
        exportToPdf({
            search,
            type,
            category,
            minPrice,
            maxPrice,
            latitude,
            longitude,
            maxDistanceKm,
        });
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant={variant}
            size={size}
            className={className}
        >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Generando PDF...' : 'Exportar PDF'}
        </Button>
    );
}
