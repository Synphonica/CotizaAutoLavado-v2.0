import { Module } from '@nestjs/common';
import { UploadService } from './services/upload.service';
import { SupabaseUploadService } from './services/supabase-upload.service';
import { UploadController } from './controllers/upload.controller';
import { SupabaseUploadController } from './controllers/supabase-upload.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [
    UploadController, // Controlador original
    SupabaseUploadController // Nuevo controlador para Supabase
  ],
  providers: [
    UploadService, // Servicio original (mantenido por compatibilidad)
    SupabaseUploadService, // Nuevo servicio con Supabase
    {
      provide: 'UPLOAD_SERVICE',
      useClass: SupabaseUploadService // Usar Supabase como default
    }
  ],
  exports: [SupabaseUploadService, 'UPLOAD_SERVICE']
})
export class UploadModule { }
