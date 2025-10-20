import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private supabase: SupabaseClient;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        this.bucketName = this.configService.get<string>('SUPABASE_STORAGE_BUCKET', 'alto-carwash-images');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials are not configured properly. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        this.logger.log('Supabase client initialized successfully');
    }

    /**
     * Sube un archivo a Supabase Storage
     * @param file - Archivo a subir
     * @param folder - Carpeta donde guardar (services, providers, avatars, etc.)
     * @returns URL pública y path del archivo
     */
    async uploadFile(
        file: Express.Multer.File,
        folder: string = 'uploads',
    ): Promise<{ url: string; path: string }> {
        try {
            // Generar nombre único para el archivo
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

            this.logger.debug(`Uploading file to: ${fileName}`);

            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (error) {
                this.logger.error(`Error uploading file: ${error.message}`, error);
                throw new Error(`Failed to upload file: ${error.message}`);
            }

            // Obtener URL pública
            const { data: { publicUrl } } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            this.logger.log(`File uploaded successfully: ${publicUrl}`);

            return {
                url: publicUrl,
                path: data.path,
            };
        } catch (error) {
            this.logger.error('Upload failed', error);
            throw error;
        }
    }

    /**
     * Sube múltiples archivos a Supabase Storage
     * @param files - Array de archivos
     * @param folder - Carpeta donde guardar
     * @returns Array de URLs y paths
     */
    async uploadMultipleFiles(
        files: Express.Multer.File[],
        folder: string = 'uploads',
    ): Promise<{ url: string; path: string }[]> {
        try {
            const uploadPromises = files.map(file => this.uploadFile(file, folder));
            return await Promise.all(uploadPromises);
        } catch (error) {
            this.logger.error('Multiple upload failed', error);
            throw error;
        }
    }

    /**
     * Elimina un archivo de Supabase Storage
     * @param filePath - Path del archivo a eliminar
     */
    async deleteFile(filePath: string): Promise<void> {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);

            if (error) {
                this.logger.error(`Error deleting file: ${error.message}`, error);
                throw new Error(`Failed to delete file: ${error.message}`);
            }

            this.logger.log(`File deleted successfully: ${filePath}`);
        } catch (error) {
            this.logger.error('Delete failed', error);
            throw error;
        }
    }

    /**
     * Elimina múltiples archivos
     * @param filePaths - Array de paths a eliminar
     */
    async deleteMultipleFiles(filePaths: string[]): Promise<void> {
        try {
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove(filePaths);

            if (error) {
                this.logger.error(`Error deleting multiple files: ${error.message}`, error);
                throw new Error(`Failed to delete files: ${error.message}`);
            }

            this.logger.log(`${filePaths.length} files deleted successfully`);
        } catch (error) {
            this.logger.error('Multiple delete failed', error);
            throw error;
        }
    }

    /**
     * Lista archivos en una carpeta
     * @param folder - Carpeta a listar
     * @param limit - Límite de archivos (default: 100)
     * @returns Lista de archivos
     */
    async listFiles(folder: string = '', limit: number = 100): Promise<any[]> {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .list(folder, {
                    limit,
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) {
                this.logger.error(`Error listing files: ${error.message}`, error);
                throw new Error(`Failed to list files: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            this.logger.error('List files failed', error);
            throw error;
        }
    }

    /**
     * Obtiene la URL pública de un archivo
     * @param filePath - Path del archivo
     * @returns URL pública
     */
    getPublicUrl(filePath: string): string {
        const { data } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * Extrae el path de un archivo desde su URL pública
     * @param fileUrl - URL pública del archivo
     * @returns Path del archivo
     */
    extractPathFromUrl(fileUrl: string): string {
        try {
            const url = new URL(fileUrl);
            const pathParts = url.pathname.split('/');
            const bucketIndex = pathParts.findIndex(part => part === this.bucketName);

            if (bucketIndex === -1) {
                throw new Error('Invalid Supabase Storage URL');
            }

            return pathParts.slice(bucketIndex + 1).join('/');
        } catch (error) {
            this.logger.error('Failed to extract path from URL', error);
            throw new Error('Invalid file URL');
        }
    }

    /**
     * Verifica si el bucket existe y está configurado correctamente
     * @returns Estado del bucket
     */
    async checkBucketHealth(): Promise<{ exists: boolean; isPublic: boolean }> {
        try {
            const { data, error } = await this.supabase.storage.listBuckets();

            if (error) {
                this.logger.error('Error checking buckets', error);
                return { exists: false, isPublic: false };
            }

            const bucket = data.find(b => b.name === this.bucketName);

            return {
                exists: !!bucket,
                isPublic: bucket?.public || false
            };
        } catch (error) {
            this.logger.error('Bucket health check failed', error);
            return { exists: false, isPublic: false };
        }
    }

    /**
     * Obtiene información de uso del storage
     * @returns Estadísticas de uso
     */
    async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
        try {
            // Lista todos los archivos para calcular estadísticas
            const files = await this.listFiles('', 1000);

            const totalFiles = files.length;
            const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

            return { totalFiles, totalSize };
        } catch (error) {
            this.logger.error('Failed to get storage stats', error);
            return { totalFiles: 0, totalSize: 0 };
        }
    }
}