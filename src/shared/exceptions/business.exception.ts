import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception cho business logic errors
 * Sử dụng khi có lỗi logic nghiệp vụ cụ thể
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

/**
 * Exception cho các lỗi liên quan đến user
 */
export class UserException extends BusinessException {
  static emailAlreadyExists(email: string) {
    return new UserException(
      `Email ${email} đã được sử dụng`,
      'EMAIL_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
    );
  }

  static userNotFound(identifier: string) {
    return new UserException(
      `Không tìm thấy người dùng: ${identifier}`,
      'USER_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }

  static emailNotVerified() {
    return new UserException(
      'Email chưa được xác minh',
      'EMAIL_NOT_VERIFIED',
      HttpStatus.FORBIDDEN,
    );
  }

  static invalidCredentials() {
    return new UserException(
      'Email hoặc mật khẩu không chính xác',
      'INVALID_CREDENTIALS',
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Exception cho các lỗi liên quan đến authentication
 */
export class AuthException extends BusinessException {
  static invalidToken() {
    return new AuthException(
      'Token không hợp lệ',
      'INVALID_TOKEN',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static tokenExpired() {
    return new AuthException(
      'Token đã hết hạn',
      'TOKEN_EXPIRED',
      HttpStatus.UNAUTHORIZED,
    );
  }

  static insufficientPermissions() {
    return new AuthException(
      'Bạn không có quyền thực hiện thao tác này',
      'INSUFFICIENT_PERMISSIONS',
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Exception cho các lỗi liên quan đến validation
 */
export class ValidationException extends BusinessException {
  static invalidInput(field: string, reason: string) {
    return new ValidationException(
      `Trường ${field} không hợp lệ: ${reason}`,
      'INVALID_INPUT',
      HttpStatus.BAD_REQUEST,
    );
  }

  static missingRequiredField(field: string) {
    return new ValidationException(
      `Trường ${field} là bắt buộc`,
      'MISSING_REQUIRED_FIELD',
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Exception cho các lỗi liên quan đến resources
 */
export class ResourceException extends BusinessException {
  static notFound(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} với ID ${identifier} không tồn tại`
      : `${resource} không tồn tại`;

    return new ResourceException(
      message,
      'RESOURCE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }

  static alreadyExists(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} với ID ${identifier} đã tồn tại`
      : `${resource} đã tồn tại`;

    return new ResourceException(
      message,
      'RESOURCE_ALREADY_EXISTS',
      HttpStatus.CONFLICT,
    );
  }

  static cannotDelete(resource: string, reason: string) {
    return new ResourceException(
      `Không thể xóa ${resource}: ${reason}`,
      'CANNOT_DELETE_RESOURCE',
      HttpStatus.BAD_REQUEST,
    );
  }
}
