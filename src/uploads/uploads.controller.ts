import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  ParseArrayPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { UploadsService } from './uploads.service';
import {
  UploadFileDto,
  MultipleUploadDto,
  UploadQueryDto,
  FileUploadResponseDto,
  MultipleFilesUploadResponseDto,
  FileListResponseDto,
  UploadStatsResponseDto,
} from './dto';
import { createUploadConfig } from './config/upload.config';
import {
  UPLOAD_CATEGORIES,
  type UploadCategory,
} from './constants/upload.constants';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // =============================================================================
  // Single File Upload
  // =============================================================================

  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', createUploadConfig('general', { maxFiles: 1 })),
  )
  async uploadSingle(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const { category = 'general', description } = uploadData;

    return this.uploadsService.uploadSingle(
      file,
      user.id,
      category as UploadCategory,
      description,
    );
  }

  // =============================================================================
  // Single File Upload by Category
  // =============================================================================

  @Post('single/images')
  @UseInterceptors(
    FileInterceptor('file', createUploadConfig('images', { maxFiles: 1 })),
  )
  async uploadImage(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    return this.uploadsService.uploadSingle(
      file,
      user.id,
      UPLOAD_CATEGORIES.IMAGES,
      uploadData.description,
    );
  }

  @Post('single/documents')
  @UseInterceptors(
    FileInterceptor('file', createUploadConfig('documents', { maxFiles: 1 })),
  )
  async uploadDocument(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No document file uploaded');
    }

    return this.uploadsService.uploadSingle(
      file,
      user.id,
      UPLOAD_CATEGORIES.DOCUMENTS,
      uploadData.description,
    );
  }

  @Post('single/videos')
  @UseInterceptors(
    FileInterceptor('file', createUploadConfig('videos', { maxFiles: 1 })),
  )
  async uploadVideo(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No video file uploaded');
    }

    return this.uploadsService.uploadSingle(
      file,
      user.id,
      UPLOAD_CATEGORIES.VIDEOS,
      uploadData.description,
    );
  }

  @Post('single/audio')
  @UseInterceptors(
    FileInterceptor('file', createUploadConfig('audio', { maxFiles: 1 })),
  )
  async uploadAudio(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadFileDto,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    return this.uploadsService.uploadSingle(
      file,
      user.id,
      UPLOAD_CATEGORIES.AUDIO,
      uploadData.description,
    );
  }

  // =============================================================================
  // Multiple Files Upload
  // =============================================================================

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      10,
      createUploadConfig('general', { maxFiles: 10 }),
    ),
  )
  async uploadMultiple(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: MultipleUploadDto,
  ): Promise<MultipleFilesUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const { category = 'general', description } = uploadData;

    return this.uploadsService.uploadMultiple(
      files,
      user.id,
      category as UploadCategory,
      description,
    );
  }

  // =============================================================================
  // Multiple Files Upload by Category
  // =============================================================================

  @Post('multiple/images')
  @UseInterceptors(
    FilesInterceptor('files', 5, createUploadConfig('images', { maxFiles: 5 })),
  )
  async uploadMultipleImages(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: MultipleUploadDto,
  ): Promise<MultipleFilesUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files uploaded');
    }

    return this.uploadsService.uploadMultiple(
      files,
      user.id,
      UPLOAD_CATEGORIES.IMAGES,
      uploadData.description,
    );
  }

  @Post('multiple/documents')
  @UseInterceptors(
    FilesInterceptor(
      'files',
      10,
      createUploadConfig('documents', { maxFiles: 10 }),
    ),
  )
  async uploadMultipleDocuments(
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadData: MultipleUploadDto,
  ): Promise<MultipleFilesUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No document files uploaded');
    }

    return this.uploadsService.uploadMultiple(
      files,
      user.id,
      UPLOAD_CATEGORIES.DOCUMENTS,
      uploadData.description,
    );
  }

  // =============================================================================
  // File Management
  // =============================================================================

  @Get('my-files')
  async getMyFiles(
    @CurrentUser() user: User,
    @Query() query: UploadQueryDto,
  ): Promise<FileListResponseDto> {
    return this.uploadsService.getUserFiles(user.id, query);
  }

  @Get('stats')
  async getMyStats(@CurrentUser() user: User): Promise<UploadStatsResponseDto> {
    return this.uploadsService.getUploadStats(user.id);
  }

  @Get(':id')
  async getFile(
    @CurrentUser() user: User,
    @Param('id') fileId: string,
  ): Promise<FileUploadResponseDto> {
    return this.uploadsService.getFile(fileId);
  }

  @Delete(':id')
  async deleteFile(
    @CurrentUser() user: User,
    @Param('id') fileId: string,
  ): Promise<{ message: string }> {
    return this.uploadsService.deleteFile(fileId, user.id);
  }

  @Delete('bulk')
  async deleteFiles(
    @CurrentUser() user: User,
    @Body('fileIds', ParseArrayPipe) fileIds: string[],
  ): Promise<{
    message: string;
    deletedCount: number;
    failedFiles?: string[];
  }> {
    return this.uploadsService.deleteFiles(fileIds, user.id);
  }

  // =============================================================================
  // Admin Endpoints (Optional - for admin users)
  // =============================================================================

  @Get('admin/stats')
  async getGlobalStats(): Promise<UploadStatsResponseDto> {
    // TODO: Add admin role guard here
    return this.uploadsService.getUploadStats();
  }

  @Delete('admin/:id')
  async adminDeleteFile(
    @Param('id') fileId: string,
  ): Promise<{ message: string }> {
    // TODO: Add admin role guard here
    return this.uploadsService.deleteFile(fileId);
  }
}
