import { Injectable, StreamableFile } from '@nestjs/common';
import * as PDFKit from 'pdfkit';
import { Readable } from 'stream';

// Importar PDFDocument correctamente
const PDFDocument = (PDFKit as any).default || PDFKit;

interface ComparisonData {
    services: any[];
    savingsAnalysis?: {
        minPrice: number;
        maxPrice: number;
        avgPrice: number;
        medianPrice: number;
        potentialSavings: number;
        savingsPercentage: number;
        bestValue: any;
        cheapest: any;
        recommendation: string;
    };
}

@Injectable()
export class PdfExportService {
    /**
     * Genera un PDF con la comparación de servicios
     */
    async generateComparisonPdf(data: ComparisonData): Promise<StreamableFile> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: 'Comparación de Servicios - Alto Carwash',
                        Author: 'Alto Carwash',
                        Subject: 'Comparación de precios y servicios',
                        CreationDate: new Date(),
                    },
                });

                const chunks: Buffer[] = [];

                doc.on('data', (chunk: Buffer) => chunks.push(chunk));
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    const stream = Readable.from(pdfBuffer);
                    resolve(
                        new StreamableFile(stream, {
                            type: 'application/pdf',
                            disposition: `attachment; filename="comparacion-servicios-${Date.now()}.pdf"`,
                        }),
                    );
                });
                doc.on('error', reject);

                // Header
                this.addHeader(doc);

                // Metadata
                this.addMetadata(doc, data);

                // Tabla de comparación
                this.addComparisonTable(doc, data.services);

                // Análisis de ahorros
                if (data.savingsAnalysis) {
                    this.addSavingsAnalysis(doc, data.savingsAnalysis);
                }

                // Footer
                this.addFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private addHeader(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(24)
            .fillColor('#2563eb')
            .text('Alto Carwash', { align: 'center' })
            .fontSize(16)
            .fillColor('#6b7280')
            .text('Comparación de Servicios', { align: 'center' })
            .moveDown(2);
    }

    private addMetadata(doc: PDFKit.PDFDocument, data: ComparisonData) {
        const now = new Date();
        doc
            .fontSize(10)
            .fillColor('#374151')
            .text(`Fecha: ${now.toLocaleDateString('es-CL')}`, { align: 'left' })
            .text(`Hora: ${now.toLocaleTimeString('es-CL')}`, { align: 'left' })
            .text(`Servicios comparados: ${data.services.length}`, { align: 'left' })
            .moveDown(1.5);
    }

    private addComparisonTable(
        doc: PDFKit.PDFDocument,
        services: ComparisonData['services'],
    ) {
        doc
            .fontSize(14)
            .fillColor('#111827')
            .text('Servicios Comparados', { underline: true })
            .moveDown(0.5);

        // Table headers
        const tableTop = doc.y;
        const colWidths = {
            service: 150,
            provider: 120,
            price: 80,
            distance: 60,
            rating: 50,
            score: 50,
        };

        let currentY = tableTop;

        // Headers
        doc
            .fontSize(9)
            .fillColor('#ffffff')
            .rect(50, currentY, 495, 20)
            .fill('#2563eb');

        doc
            .fillColor('#ffffff')
            .text('Servicio', 55, currentY + 5, {
                width: colWidths.service,
                align: 'left',
            })
            .text('Proveedor', 205, currentY + 5, {
                width: colWidths.provider,
                align: 'left',
            })
            .text('Precio', 325, currentY + 5, { width: colWidths.price, align: 'right' })
            .text('Distancia', 405, currentY + 5, {
                width: colWidths.distance,
                align: 'right',
            })
            .text('Rating', 465, currentY + 5, { width: colWidths.rating, align: 'right' })
            .text('Score', 515, currentY + 5, { width: colWidths.score, align: 'right' });

        currentY += 25;

        // Rows
        services.forEach((service, index) => {
            const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
            doc.rect(50, currentY, 495, 25).fill(bgColor);

            const finalPrice = service.discountedPrice || service.price;

            doc
                .fontSize(8)
                .fillColor('#111827')
                .text(service.name.substring(0, 30), 55, currentY + 8, {
                    width: colWidths.service - 10,
                    align: 'left',
                })
                .text(service.providers.businessName.substring(0, 20), 205, currentY + 8, {
                    width: colWidths.provider - 10,
                    align: 'left',
                })
                .text(`$${finalPrice.toLocaleString('es-CL')}`, 325, currentY + 8, {
                    width: colWidths.price,
                    align: 'right',
                })
                .text(
                    service.distance ? `${service.distance.toFixed(1)} km` : 'N/A',
                    405,
                    currentY + 8,
                    { width: colWidths.distance, align: 'right' },
                )
                .text(
                    service.rating ? `${service.rating.toFixed(1)} ⭐` : 'N/A',
                    465,
                    currentY + 8,
                    { width: colWidths.rating, align: 'right' },
                )
                .text(`${(service.score * 100).toFixed(0)}%`, 515, currentY + 8, {
                    width: colWidths.score,
                    align: 'right',
                });

            currentY += 25;

            // New page if needed
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }
        });

        doc.moveDown(2);
    }

    private addSavingsAnalysis(
        doc: PDFKit.PDFDocument,
        analysis: ComparisonData['savingsAnalysis'],
    ) {
        if (!analysis) return; // Guard para análisis undefined

        if (doc.y > 650) {
            doc.addPage();
        }

        doc
            .fontSize(14)
            .fillColor('#111827')
            .text('Análisis de Ahorros', { underline: true })
            .moveDown(0.5);

        // Stats box
        const boxY = doc.y;
        doc.rect(50, boxY, 495, 120).fillAndStroke('#f0f9ff', '#2563eb');

        doc
            .fontSize(10)
            .fillColor('#1e40af')
            .text(`Precio más bajo: $${analysis.minPrice.toLocaleString('es-CL')}`, 60, boxY + 10)
            .text(`Precio más alto: $${analysis.maxPrice.toLocaleString('es-CL')}`, 60, boxY + 30)
            .text(`Precio promedio: $${analysis.avgPrice.toLocaleString('es-CL')}`, 60, boxY + 50)
            .text(`Precio mediano: $${analysis.medianPrice.toLocaleString('es-CL')}`, 60, boxY + 70)
            .fontSize(12)
            .fillColor('#dc2626')
            .text(
                `💰 Ahorro potencial: $${analysis.potentialSavings.toLocaleString('es-CL')} (${analysis.savingsPercentage.toFixed(1)}%)`,
                60,
                boxY + 95,
            );

        doc.moveDown(8);

        // Best value
        doc
            .fontSize(12)
            .fillColor('#059669')
            .text('✨ Mejor Relación Calidad-Precio:', { underline: true })
            .fontSize(10)
            .fillColor('#374151')
            .text(
                `${analysis.bestValue.name} - ${analysis.bestValue.provider} ($${analysis.bestValue.price.toLocaleString('es-CL')})`,
            )
            .text(`Score: ${(analysis.bestValue.score * 100).toFixed(0)}%`)
            .moveDown(0.5);

        // Cheapest
        doc
            .fontSize(12)
            .fillColor('#dc2626')
            .text('💵 Opción más económica:', { underline: true })
            .fontSize(10)
            .fillColor('#374151')
            .text(
                `${analysis.cheapest.name} - ${analysis.cheapest.provider} ($${analysis.cheapest.price.toLocaleString('es-CL')})`,
            )
            .moveDown(0.5);

        // Recommendation
        doc
            .fontSize(12)
            .fillColor('#2563eb')
            .text('💡 Recomendación:', { underline: true })
            .fontSize(10)
            .fillColor('#374151')
            .text(analysis.recommendation, { width: 495, align: 'justify' });
    }

    private addFooter(doc: PDFKit.PDFDocument) {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
            doc.switchToPage(i);

            doc
                .fontSize(8)
                .fillColor('#9ca3af')
                .text(
                    `Generado por Alto Carwash - ${new Date().toLocaleDateString('es-CL')} | Página ${i + 1} de ${pages.count}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center', width: 495 },
                );
        }
    }
}
