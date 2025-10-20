import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { CarWashData } from '../types';

export class DataExporter {
    /**
     * Exportar a JSON
     */
    static exportToJSON(data: CarWashData[], filename: string = 'carwashes.json'): void {
        const outputPath = path.join(process.cwd(), 'output', filename);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Datos exportados a: ${outputPath}`);
        console.log(`📊 Total de registros: ${data.length}`);
    }

    /**
     * Exportar a Excel
     */
    static exportToExcel(data: CarWashData[], filename: string = 'carwashes.xlsx'): void {
        const outputPath = path.join(process.cwd(), 'output', filename);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Aplanar los datos para Excel
        const flatData = data.map(carwash => ({
            Nombre: carwash.name,
            Dirección: carwash.address,
            Comuna: carwash.comuna,
            Región: carwash.region,
            Teléfono: carwash.phone || '',
            Email: carwash.email || '',
            'Sitio Web': carwash.website || '',
            Descripción: carwash.description || '',
            Servicios: carwash.services.join(', '),
            Rating: carwash.rating || '',
            'Cantidad Reseñas': carwash.reviewCount || '',
            Latitud: carwash.latitude || '',
            Longitud: carwash.longitude || '',
            Fuente: carwash.source,
            URL: carwash.sourceUrl,
            'Fecha Scraping': carwash.scrapedAt.toISOString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Autolavados');

        XLSX.writeFile(workbook, outputPath);
        console.log(`✅ Datos exportados a: ${outputPath}`);
        console.log(`📊 Total de registros: ${data.length}`);
    }

    /**
     * Exportar a CSV
     */
    static exportToCSV(data: CarWashData[], filename: string = 'carwashes.csv'): void {
        const outputPath = path.join(process.cwd(), 'output', filename);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Convertir a CSV
        const headers = [
            'Nombre', 'Dirección', 'Comuna', 'Región', 'Teléfono', 'Email',
            'Sitio Web', 'Descripción', 'Servicios', 'Rating', 'Reseñas',
            'Latitud', 'Longitud', 'Fuente', 'URL', 'Fecha'
        ];

        const csvRows = [headers.join(',')];

        for (const carwash of data) {
            const row = [
                this.escapeCSV(carwash.name),
                this.escapeCSV(carwash.address),
                this.escapeCSV(carwash.comuna),
                this.escapeCSV(carwash.region),
                this.escapeCSV(carwash.phone || ''),
                this.escapeCSV(carwash.email || ''),
                this.escapeCSV(carwash.website || ''),
                this.escapeCSV(carwash.description || ''),
                this.escapeCSV(carwash.services.join('; ')),
                carwash.rating || '',
                carwash.reviewCount || '',
                carwash.latitude || '',
                carwash.longitude || '',
                carwash.source,
                this.escapeCSV(carwash.sourceUrl),
                carwash.scrapedAt.toISOString(),
            ];

            csvRows.push(row.join(','));
        }

        fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf-8');
        console.log(`✅ Datos exportados a: ${outputPath}`);
        console.log(`📊 Total de registros: ${data.length}`);
    }

    /**
     * Exportar SQL para insertar en la base de datos
     */
    static exportToSQL(data: CarWashData[], filename: string = 'insert_carwashes.sql'): void {
        const outputPath = path.join(process.cwd(), 'output', filename);
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const sqlStatements: string[] = [];

        for (const carwash of data) {
            const sql = `
INSERT INTO providers (name, description, address, phone, email, website, rating, review_count, latitude, longitude, source_url, created_at)
VALUES (
  '${this.escapeSQL(carwash.name)}',
  '${this.escapeSQL(carwash.description || '')}',
  '${this.escapeSQL(carwash.address)}',
  '${this.escapeSQL(carwash.phone || '')}',
  '${this.escapeSQL(carwash.email || '')}',
  '${this.escapeSQL(carwash.website || '')}',
  ${carwash.rating || 'NULL'},
  ${carwash.reviewCount || 'NULL'},
  ${carwash.latitude || 'NULL'},
  ${carwash.longitude || 'NULL'},
  '${this.escapeSQL(carwash.sourceUrl)}',
  NOW()
);
`;
            sqlStatements.push(sql);
        }

        fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');
        console.log(`✅ SQL exportado a: ${outputPath}`);
        console.log(`📊 Total de registros: ${data.length}`);
    }

    private static escapeCSV(str: string): string {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    private static escapeSQL(str: string): string {
        return str.replace(/'/g, "''");
    }
}