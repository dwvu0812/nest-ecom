import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { FileUploadRepository } from './repositories/file-upload.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { fileConfig } from '../shared/config';

@Module({
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: fileConfig.uploadPath,
        limits: {
          fileSize: fileConfig.maxFileSize,
        },
      }),
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, FileUploadRepository],
  exports: [UploadsService, FileUploadRepository],
})
export class UploadsModule {}
