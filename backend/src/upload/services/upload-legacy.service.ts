import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    UploadFileDto,
    UploadResponseDto,
    MultipleUploadResponseDto,
    DeleteFileResponseDto,
    FileListQueryDto,
    FileListResponseDto,
} from '../dto/upload.dto';

/**
 * Servicio de upload legacy - DEPRECADO
 * Use SupabaseUploadService para nuevas implementaciones
 */
@Injectable()
export class UploadService {
    private readonly logger = new Logger(UploadService.name);

    constructor(private readonly prisma: PrismaService) {
        this.logger.warn('UploadService is deprecated. Please use SupabaseUploadService instead.');
    }

    async uploadFile(file: Express.Multer.File, uploadData: UploadFileDto): Promise<UploadResponseDto> {
        throw new BadRequestException('Este servicio está deprecado. Use /api/supabase/upload endpoints para subir archivos a Supabase Storage.');
    }

    async uploadMultipleFiles(files: Express.Multer.File[], uploadData: UploadFileDto): Promise<MultipleUploadResponseDto> {
        throw new BadRequestException('Este servicio está deprecado. Use /api/supabase/upload endpoints para subir archivos a Supabase Storage.');
    }

    async deleteFile(fileId: string): Promise<DeleteFileResponseDto> {
        throw new BadRequestException('Este servicio está deprecado. Use /api/supabase/upload endpoints para eliminar archivos de Supabase Storage.');
    }

    async listFiles(query: FileListQueryDto): Promise<FileListResponseDto> {
        throw new BadRequestException('Este servicio está deprecado. Use /api/supabase/upload endpoints para listar archivos de Supabase Storage.');
    }
}