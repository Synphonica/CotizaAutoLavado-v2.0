import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    Query,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    Inject
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { SupabaseUploadService } from '../services/supabase-upload.service';
import {
    UploadFileDto,
    UploadResponseDto,
    MultipleUploadResponseDto,
    DeleteFileResponseDto,
    FileListQueryDto,
    FileListResponseDto
} from '../dto/upload.dto';

@ApiTags('Supabase Storage')
@Controller('api/supabase/upload')
export class SupabaseUploadController {
    constructor(
        @Inject('UPLOAD_SERVICE')
        private readonly uploadService: SupabaseUploadService
    ) { }

    @Post('single')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir un archivo a Supabase Storage' })
    @ApiBody({
        description: 'Archivo y metadatos',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                fileType: {
                    type: 'string',
                    enum: ['image', 'document', 'avatar', 'provider_logo', 'service_image', 'provider_image']
                },
                providerId: { type: 'string', format: 'uuid' },
                serviceId: { type: 'string', format: 'uuid' },
                userId: { type: 'string', format: 'uuid' },
                description: { type: 'string' },
                isMain: { type: 'boolean' },
                displayOrder: { type: 'number' }
            },
            required: ['file', 'fileType']
        }
    })
    @ApiResponse({ status: 201, description: 'Archivo subido exitosamente', type: UploadResponseDto })
    @ApiResponse({ status: 400, description: 'Error de validación' })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadData: UploadFileDto
    ): Promise<UploadResponseDto> {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        return await this.uploadService.uploadFile(file, uploadData);
    }

    @Post('multiple')
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir múltiples archivos a Supabase Storage' })
    @ApiBody({
        description: 'Múltiples archivos y metadatos',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                fileType: { type: 'string' },
                providerId: { type: 'string' },
                serviceId: { type: 'string' },
                description: { type: 'string' }
            },
            required: ['files', 'fileType']
        }
    })
    @ApiResponse({ status: 201, description: 'Archivos procesados', type: MultipleUploadResponseDto })
    async uploadMultipleFiles(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() uploadData: UploadFileDto
    ): Promise<MultipleUploadResponseDto> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No se proporcionaron archivos');
        }

        return await this.uploadService.uploadMultipleFiles(files, uploadData);
    }

    @Delete(':fileId')
    @ApiOperation({ summary: 'Eliminar un archivo de Supabase Storage' })
    @ApiResponse({ status: 200, description: 'Archivo eliminado', type: DeleteFileResponseDto })
    @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
    async deleteFile(
        @Param('fileId') fileId: string
    ): Promise<DeleteFileResponseDto> {
        return await this.uploadService.deleteFile(fileId);
    }

    @Get('list')
    @ApiOperation({ summary: 'Listar archivos de Supabase Storage' })
    @ApiResponse({ status: 200, description: 'Lista de archivos', type: FileListResponseDto })
    async listFiles(
        @Query() query: FileListQueryDto
    ): Promise<FileListResponseDto> {
        return await this.uploadService.listFiles(query);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas de Supabase Storage' })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas del almacenamiento',
        schema: {
            type: 'object',
            properties: {
                totalFiles: { type: 'number' },
                totalSize: { type: 'number' },
                bucketHealth: {
                    type: 'object',
                    properties: {
                        exists: { type: 'boolean' },
                        isPublic: { type: 'boolean' }
                    }
                }
            }
        }
    })
    async getStorageStats() {
        return await this.uploadService.getStorageStats();
    }

    @Post('test-connection')
    @ApiOperation({ summary: 'Probar conexión con Supabase Storage' })
    @ApiResponse({
        status: 200,
        description: 'Estado de la conexión',
        schema: {
            type: 'object',
            properties: {
                connected: { type: 'boolean' },
                bucketExists: { type: 'boolean' },
                bucketPublic: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    })
    async testConnection() {
        try {
            const stats = await this.uploadService.getStorageStats();
            return {
                connected: true,
                bucketExists: stats.bucketHealth.exists,
                bucketPublic: stats.bucketHealth.isPublic,
                message: 'Conexión a Supabase Storage exitosa',
                stats
            };
        } catch (error) {
            return {
                connected: false,
                bucketExists: false,
                bucketPublic: false,
                message: `Error de conexión: ${error.message}`,
                error: error.message
            };
        }
    }
}