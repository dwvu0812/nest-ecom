import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UPLOAD_RESOURCE_NAMES } from '../constants/upload.constants';

export class FileNotProvidedException extends BadRequestException {
  constructor(message = 'No file provided for upload') {
    super({
      code: UPLOAD_RESOURCE_NAMES.FILE_NOT_PROVIDED,
      message,
    });
  }
}

export class InvalidFileTypeException extends BadRequestException {
  constructor(
    allowedTypes: string[],
    receivedType: string,
    message = 'Invalid file type',
  ) {
    super({
      code: UPLOAD_RESOURCE_NAMES.INVALID_FILE_TYPE,
      message: `${message}. Allowed types: ${allowedTypes.join(', ')}. Received: ${receivedType}`,
    });
  }
}

export class FileTooLargeException extends BadRequestException {
  constructor(maxSize: number, receivedSize: number) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const receivedSizeMB = (receivedSize / (1024 * 1024)).toFixed(2);

    super({
      code: UPLOAD_RESOURCE_NAMES.FILE_TOO_LARGE,
      message: `File size exceeds limit. Maximum: ${maxSizeMB}MB, received: ${receivedSizeMB}MB`,
    });
  }
}

export class TooManyFilesException extends BadRequestException {
  constructor(maxFiles: number, receivedFiles: number) {
    super({
      code: UPLOAD_RESOURCE_NAMES.TOO_MANY_FILES,
      message: `Too many files uploaded. Maximum: ${maxFiles}, received: ${receivedFiles}`,
    });
  }
}

export class InvalidCategoryException extends BadRequestException {
  constructor(validCategories: string[], receivedCategory: string) {
    super({
      code: UPLOAD_RESOURCE_NAMES.INVALID_CATEGORY,
      message: `Invalid upload category. Valid categories: ${validCategories.join(', ')}. Received: ${receivedCategory}`,
    });
  }
}

export class UploadFailedException extends BadRequestException {
  constructor(message = 'File upload failed') {
    super({
      code: UPLOAD_RESOURCE_NAMES.UPLOAD_FAILED,
      message,
    });
  }
}

export class FileNotFoundException extends NotFoundException {
  constructor(fileId: string, message = 'File not found') {
    super({
      code: UPLOAD_RESOURCE_NAMES.FILE_NOT_FOUND,
      message: `${message}. File ID: ${fileId}`,
    });
  }
}

export class FileDeletionFailedException extends BadRequestException {
  constructor(fileId: string, message = 'Failed to delete file') {
    super({
      code: UPLOAD_RESOURCE_NAMES.DELETION_FAILED,
      message: `${message}. File ID: ${fileId}`,
    });
  }
}
