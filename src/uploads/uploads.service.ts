import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { awsConfig } from '../shared/config';
import { AwsS3Service } from '../shared/services/aws-s3.service';
import {
  FILE_TYPE_CONFIG,
  UPLOAD_CATEGORIES,
  type UploadCategory,
} from './constants/upload.constants';
import {
  FileListResponseDto,
  FileUploadResponseDto,
  MultipleFilesUploadResponseDto,
  UploadQueryDto,
  UploadStatsResponseDto,
} from './dto';
import {
  FileDeletionFailedException,
  FileNotFoundException,
  FileNotProvidedException,
  FileTooLargeException,
  InvalidFileTypeException,
  UploadFailedException,
} from './exceptions/upload.exceptions';
import { FileUploadRepository } from './repositories/file-upload.repository';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /**
   * Upload a single file
   */
  async uploadSingle(
    file: Express.Multer.File,
    uploadedBy: number,
    category: UploadCategory = UPLOAD_CATEGORIES.GENERAL,
    description?: string,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new FileNotProvidedException();
    }

    this.logger.log(
      `Uploading single file: ${file.originalname} by user ${uploadedBy}`,
    );

    try {
      // Validate file against category rules
      this.validateFile(file, category);

      // Handle different file structures for S3 vs local storage
      const filename = awsConfig.useS3
        ? this.extractFilenameFromS3Key((file as any).key)
        : file.filename;
      const filePath = awsConfig.useS3 ? (file as any).key : file.path;
      const fileUrl = this.generateFileUrl(filename, category);

      // Create file record in database
      const fileRecord = await this.fileUploadRepository.create({
        id: uuidv4(),
        originalName: file.originalname,
        filename: filename,
        mimetype: file.mimetype,
        size: file.size,
        category,
        path: filePath,
        url: fileUrl,
        description: description || null,
        uploadedBy,
        thumbnail: null,
      });

      this.logger.log(`Successfully uploaded file: ${fileRecord.id}`);

      return this.mapToResponseDto(fileRecord);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);

      // Clean up the uploaded file if database insertion failed
      if (awsConfig.useS3 && (file as any).key) {
        try {
          const filename = this.extractFilenameFromS3Key((file as any).key);
          await this.awsS3Service.deleteFile(filename, category);
        } catch (cleanupError) {
          this.logger.warn(
            `Failed to clean up S3 file: ${cleanupError.message}`,
          );
        }
      } else if (file.path) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          this.logger.warn(
            `Failed to clean up local file: ${cleanupError.message}`,
          );
        }
      }

      throw new UploadFailedException(error.message);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: Express.Multer.File[],
    uploadedBy: number,
    category: UploadCategory = UPLOAD_CATEGORIES.GENERAL,
    description?: string,
  ): Promise<MultipleFilesUploadResponseDto> {
    if (!files || files.length === 0) {
      throw new FileNotProvidedException('No files provided for upload');
    }

    this.logger.log(`Uploading ${files.length} files by user ${uploadedBy}`);

    const uploadedFiles: FileUploadResponseDto[] = [];
    const failedFiles: Array<{ filename: string; error: string }> = [];
    let totalSize = 0;

    for (const file of files) {
      try {
        const uploadedFile = await this.uploadSingle(
          file,
          uploadedBy,
          category,
          description,
        );
        uploadedFiles.push(uploadedFile);
        totalSize += file.size;
      } catch (error) {
        this.logger.warn(
          `Failed to upload file ${file.originalname}: ${error.message}`,
        );
        failedFiles.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    const result: MultipleFilesUploadResponseDto = {
      success: uploadedFiles.length > 0,
      message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} files`,
      files: uploadedFiles,
      totalFiles: uploadedFiles.length,
      totalSize,
    };

    if (failedFiles.length > 0) {
      result.failedFiles = failedFiles;
    }

    this.logger.log(
      `Upload completed: ${uploadedFiles.length} successful, ${failedFiles.length} failed`,
    );

    return result;
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<FileUploadResponseDto> {
    const file = await this.fileUploadRepository.findUnique({ id: fileId });

    if (!file) {
      throw new FileNotFoundException(fileId);
    }

    return this.mapToResponseDto(file);
  }

  /**
   * Get user's files with pagination
   */
  async getUserFiles(
    userId: number,
    query: UploadQueryDto,
  ): Promise<FileListResponseDto> {
    const { page = 1, limit = 20, category } = query;

    const result = await this.fileUploadRepository.findByUser(userId, {
      category,
      page,
      limit,
    });

    return {
      files: result.data.map((file) => this.mapToResponseDto(file)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get upload statistics
   */
  async getUploadStats(userId?: number): Promise<UploadStatsResponseDto> {
    const stats = await this.fileUploadRepository.getUploadStats(userId);
    const recentUploads =
      await this.fileUploadRepository.findRecentUploads(userId);

    // Initialize category stats
    const filesByCategory = {} as Record<UploadCategory, number>;
    const sizeByCategory = {} as Record<UploadCategory, number>;

    Object.values(UPLOAD_CATEGORIES).forEach((category) => {
      filesByCategory[category] = 0;
      sizeByCategory[category] = 0;
    });

    // Populate category stats
    stats.filesByCategory.forEach((stat) => {
      const category = stat.category as UploadCategory;
      filesByCategory[category] = stat._count._all;
      sizeByCategory[category] = stat._sum.size || 0;
    });

    return {
      totalFiles: stats.totalFiles,
      totalSize: stats.totalSize,
      filesByCategory,
      sizeByCategory,
      recentUploads: recentUploads.map((file) => this.mapToResponseDto(file)),
    };
  }

  /**
   * Delete file
   */
  async deleteFile(
    fileId: string,
    userId?: number,
  ): Promise<{ message: string }> {
    const file = await this.fileUploadRepository.findUnique({ id: fileId });

    if (!file) {
      throw new FileNotFoundException(fileId);
    }

    // If userId is provided, check ownership
    if (userId && file.uploadedBy !== userId) {
      throw new FileDeletionFailedException(fileId, 'Access denied');
    }

    try {
      // Soft delete the record
      await this.fileUploadRepository.softDelete({ id: fileId });

      // Try to delete the physical file
      if (awsConfig.useS3) {
        try {
          const filename = this.extractFilenameFromS3Key(file.path);
          await this.awsS3Service.deleteFile(
            filename,
            file.category as UploadCategory,
          );
          this.logger.log(`S3 file deleted: ${file.path}`);
        } catch (fileError) {
          this.logger.warn(`Failed to delete S3 file: ${fileError.message}`);
          // Don't throw here, as the database record is already marked as deleted
        }
      } else {
        try {
          await fs.unlink(file.path);
          this.logger.log(`Physical file deleted: ${file.path}`);
        } catch (fileError) {
          this.logger.warn(
            `Failed to delete physical file: ${fileError.message}`,
          );
          // Don't throw here, as the database record is already marked as deleted
        }
      }

      this.logger.log(`File deleted: ${fileId}`);
      return { message: 'File deleted successfully' };
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${fileId}: ${error.message}`,
        error.stack,
      );
      throw new FileDeletionFailedException(fileId, error.message);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(
    fileIds: string[],
    userId?: number,
  ): Promise<{
    message: string;
    deletedCount: number;
    failedFiles?: string[];
  }> {
    const failedFiles: string[] = [];
    let deletedCount = 0;

    for (const fileId of fileIds) {
      try {
        await this.deleteFile(fileId, userId);
        deletedCount++;
      } catch (error) {
        this.logger.warn(`Failed to delete file ${fileId}: ${error.message}`);
        failedFiles.push(fileId);
      }
    }

    const result = {
      message: `Deleted ${deletedCount} of ${fileIds.length} files`,
      deletedCount,
    };

    if (failedFiles.length > 0) {
      (result as any).failedFiles = failedFiles;
    }

    return result;
  }

  /**
   * Validate file against category rules
   */
  private validateFile(
    file: Express.Multer.File,
    category: UploadCategory,
  ): void {
    const categoryConfig = FILE_TYPE_CONFIG[category];

    // Check file extension
    if (!file.originalname.match(categoryConfig.allowedTypes)) {
      const allowedExts = categoryConfig.allowedTypes.source
        .replace(/.*\((.+)\)\$/, '$1')
        .split('|');
      throw new InvalidFileTypeException(
        allowedExts,
        extname(file.originalname),
      );
    }

    // Check MIME type
    if (
      !(categoryConfig.allowedMimes as readonly string[]).includes(
        file.mimetype,
      )
    ) {
      throw new InvalidFileTypeException(
        [...categoryConfig.allowedMimes],
        file.mimetype,
      );
    }

    // Check file size
    if (file.size > categoryConfig.maxSize) {
      throw new FileTooLargeException(categoryConfig.maxSize, file.size);
    }
  }

  /**
   * Generate file URL for serving
   */
  private generateFileUrl(filename: string, category: UploadCategory): string {
    if (awsConfig.useS3) {
      return this.awsS3Service.getFileUrl(filename, category);
    } else {
      const categoryPath = category === 'general' ? 'general' : category;
      return `/uploads/${categoryPath}/${filename}`;
    }
  }

  /**
   * Extract filename from S3 key
   */
  private extractFilenameFromS3Key(s3Key: string): string {
    // S3 key format: uploads/category/filename
    const parts = s3Key.split('/');
    return parts[parts.length - 1];
  }

  /**
   * Map database entity to response DTO
   */
  private mapToResponseDto(file: any): FileUploadResponseDto {
    return {
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      category: file.category as UploadCategory,
      path: file.path,
      url: file.url,
      description: file.description,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.createdAt,
      thumbnail: file.thumbnail,
    };
  }
}
