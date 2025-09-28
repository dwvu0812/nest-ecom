// File upload categories
export const UPLOAD_CATEGORIES = {
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  GENERAL: 'general',
} as const;

// File type configurations for different categories
export const FILE_TYPE_CONFIG = {
  [UPLOAD_CATEGORIES.IMAGES]: {
    allowedTypes: /\/(jpg|jpeg|png|gif|webp|bmp|svg)$/,
    allowedMimes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml',
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    path: './uploads/images',
  },
  [UPLOAD_CATEGORIES.DOCUMENTS]: {
    allowedTypes: /\/(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/,
    allowedMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/rtf',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    path: './uploads/documents',
  },
  [UPLOAD_CATEGORIES.VIDEOS]: {
    allowedTypes: /\/(mp4|avi|mkv|mov|wmv|flv|webm)$/,
    allowedMimes: [
      'video/mp4',
      'video/avi',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/webm',
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    path: './uploads/videos',
  },
  [UPLOAD_CATEGORIES.AUDIO]: {
    allowedTypes: /\/(mp3|wav|flac|aac|ogg|wma)$/,
    allowedMimes: [
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/aac',
      'audio/ogg',
      'audio/x-ms-wma',
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    path: './uploads/audio',
  },
  [UPLOAD_CATEGORIES.GENERAL]: {
    allowedTypes: /\/(zip|rar|7z|tar|gz)$/,
    allowedMimes: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
    path: './uploads/general',
  },
} as const;

// Default upload configuration
export const DEFAULT_UPLOAD_CONFIG = {
  maxFiles: 10, // Maximum number of files in a single upload
  defaultCategory: UPLOAD_CATEGORIES.GENERAL,
  preserveOriginalName: false, // Whether to preserve original filename
  generateThumbnails: true, // For images
} as const;

// Upload resource names for exceptions
export const UPLOAD_RESOURCE_NAMES = {
  FILE_NOT_PROVIDED: 'FILE_NOT_PROVIDED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  TOO_MANY_FILES: 'TOO_MANY_FILES',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  DELETION_FAILED: 'DELETION_FAILED',
} as const;

export type UploadCategory = keyof typeof FILE_TYPE_CONFIG;
export type FileTypeConfig = (typeof FILE_TYPE_CONFIG)[UploadCategory];
