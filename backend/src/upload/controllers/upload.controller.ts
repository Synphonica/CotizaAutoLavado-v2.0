import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
import {
  UploadFileDto,
  UploadResponseDto,
  MultipleUploadResponseDto,
  DeleteFileResponseDto,
  FileListQueryDto,
  FileListResponseDto
} from '../dto/upload.dto';

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo individual' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Archivo subido exitosamente', type: UploadResponseDto as any })
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.uploadService.uploadFile(file, uploadData);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  @ApiOperation({ summary: 'Subir múltiples archivos' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Archivos procesados', type: MultipleUploadResponseDto as any })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: UploadFileDto
  ): Promise<MultipleUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }
    return this.uploadService.uploadMultipleFiles(files, uploadData);
  }

  @Get()
  @ApiOperation({ summary: 'Listar archivos subidos' })
  @ApiOkResponse({ description: 'Lista de archivos', type: FileListResponseDto as any })
  @ApiQuery({ name: 'fileType', required: false, description: 'Tipo de archivo' })
  @ApiQuery({ name: 'providerId', required: false, description: 'ID del proveedor' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'ID del servicio' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, description: 'Página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página' })
  async listFiles(@Query() query: FileListQueryDto): Promise<FileListResponseDto> {
    return this.uploadService.listFiles(query);
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  @ApiOkResponse({ description: 'Archivo eliminado exitosamente', type: DeleteFileResponseDto as any })
  async deleteFile(@Param('fileId') fileId: string): Promise<DeleteFileResponseDto> {
    return this.uploadService.deleteFile(fileId);
  }
}
