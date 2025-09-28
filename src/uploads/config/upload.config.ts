import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import {
  FILE_TYPE_CONFIG,
  DEFAULT_UPLOAD_CONFIG,
  UploadCategory,
} from '../constants/upload.constants';
import { fileConfig } from '../../shared/config';

// Ensure upload directories exist
const ensureUploadDir = (path: string): void => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
};

// Initialize upload directories
Object.values(FILE_TYPE_CONFIG).forEach((config) => {
  ensureUploadDir(config.path);
});

// Create multer configuration for different upload types
export const createUploadConfig = (
  category: UploadCategory,
  options: {
    maxFiles?: number;
    preserveOriginalName?: boolean;
    useMemoryStorage?: boolean;
  } = {},
) => {
  const categoryConfig = FILE_TYPE_CONFIG[category];
  const {
    maxFiles = DEFAULT_UPLOAD_CONFIG.maxFiles,
    preserveOriginalName = DEFAULT_UPLOAD_CONFIG.preserveOriginalName,
    useMemoryStorage = false,
  } = options;

  const storage = useMemoryStorage
    ? memoryStorage()
    : diskStorage({
        destination: categoryConfig.path,
        filename: (req: any, file: Express.Multer.File, cb) => {
          const userId = req.user?.id || 'anonymous';
          const timestamp = Date.now();
          const ext = extname(file.originalname);
          const baseName = preserveOriginalName
            ? file.originalname.replace(ext, '')
            : `file-${userId}-${timestamp}`;
          const fileName = `${baseName}${ext}`;
          cb(null, fileName);
        },
      });

  return {
    storage,
    limits: {
      fileSize: Math.min(categoryConfig.maxSize, fileConfig.maxFileSize),
      files: maxFiles,
    },
    fileFilter: (
      req: any,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      // Check file extension
      if (!file.originalname.match(categoryConfig.allowedTypes)) {
        return cb(
          new BadRequestException(
            `Invalid file type. Only ${category} files are allowed.`,
          ),
          false,
        );
      }

      // Check MIME type
      if (
        !(categoryConfig.allowedMimes as readonly string[]).includes(
          file.mimetype,
        )
      ) {
        return cb(
          new BadRequestException(
            `Invalid MIME type detected: ${file.mimetype}`,
          ),
          false,
        );
      }

      cb(null, true);
    },
  };
};

// Pre-configured upload configs for common use cases
export const imageUploadConfig = createUploadConfig('images');
export const documentUploadConfig = createUploadConfig('documents');
export const videoUploadConfig = createUploadConfig('videos');
export const audioUploadConfig = createUploadConfig('audio');
export const generalUploadConfig = createUploadConfig('general');

// Multiple files upload configs
export const multipleImagesConfig = createUploadConfig('images', {
  maxFiles: 5,
});
export const multipleDocumentsConfig = createUploadConfig('documents', {
  maxFiles: 10,
});

// Memory storage configs (for processing before saving)
export const memoryImageConfig = createUploadConfig('images', {
  useMemoryStorage: true,
  maxFiles: 1,
});

// Dynamic config creator for custom requirements
export const createCustomUploadConfig = (
  category: UploadCategory,
  maxFiles: number,
  maxSizeOverride?: number,
) => {
  const categoryConfig = FILE_TYPE_CONFIG[category];

  return createUploadConfig(category, {
    maxFiles,
  });
};
