import { BusinessException, ResourceException } from '../../shared/exceptions';
import { HttpStatus } from '@nestjs/common';

export class ProfileExceptions {
  static profileNotFound() {
    return ResourceException.notFound('User profile');
  }

  static emailAlreadyExists(email?: string) {
    return ResourceException.alreadyExists(email ? `Email ${email}` : 'Email');
  }

  static invalidCurrentPassword() {
    return new BusinessException(
      'Current password is incorrect',
      'INVALID_CURRENT_PASSWORD',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static passwordMismatch() {
    return new BusinessException(
      'New password and confirmation password do not match',
      'PASSWORD_MISMATCH',
      HttpStatus.BAD_REQUEST,
    );
  }

  static noPasswordSet() {
    return new BusinessException(
      'User does not have a password set. Please use social login or contact support.',
      'NO_PASSWORD_SET',
      HttpStatus.BAD_REQUEST,
    );
  }

  static invalidFileType() {
    return new BusinessException(
      'Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.',
      'INVALID_FILE_TYPE',
      HttpStatus.BAD_REQUEST,
    );
  }

  static fileSizeExceeded() {
    return new BusinessException(
      'File size exceeds the maximum allowed limit of 2MB.',
      'FILE_SIZE_EXCEEDED',
      HttpStatus.BAD_REQUEST,
    );
  }

  static noFileUploaded() {
    return new BusinessException(
      'No file was uploaded. Please select a file to upload.',
      'NO_FILE_UPLOADED',
      HttpStatus.BAD_REQUEST,
    );
  }

  static translationAlreadyExists(languageCode?: string) {
    return ResourceException.alreadyExists(
      languageCode
        ? `Profile translation for language ${languageCode}`
        : 'Profile translation for this language',
    );
  }

  static translationNotFound() {
    return ResourceException.notFound('Profile translation');
  }

  static languageNotFound() {
    return ResourceException.notFound('Language');
  }

  static unauthorizedTranslationAccess() {
    return new BusinessException(
      'You are not authorized to access this translation',
      'UNAUTHORIZED_TRANSLATION_ACCESS',
      HttpStatus.FORBIDDEN,
    );
  }
}
