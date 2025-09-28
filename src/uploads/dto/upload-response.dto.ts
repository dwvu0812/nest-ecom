import type { UploadCategory } from '../constants/upload.constants';

export class FileUploadResponseDto {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  category: UploadCategory;
  path: string;
  url: string;
  description?: string;
  uploadedBy: number;
  uploadedAt: Date;
  thumbnail?: string;
}

export class MultipleFilesUploadResponseDto {
  success: boolean;
  message: string;
  files: FileUploadResponseDto[];
  totalFiles: number;
  totalSize: number;
  failedFiles?: Array<{
    filename: string;
    error: string;
  }>;
}

export class UploadStatsResponseDto {
  totalFiles: number;
  totalSize: number;
  filesByCategory: Record<UploadCategory, number>;
  sizeByCategory: Record<UploadCategory, number>;
  recentUploads: FileUploadResponseDto[];
}

export class FileListResponseDto {
  files: FileUploadResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
