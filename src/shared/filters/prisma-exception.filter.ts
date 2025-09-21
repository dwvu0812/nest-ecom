import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { ErrorResponse } from './global-exception.filter';

@Catch(PrismaClientKnownRequestError, PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: PrismaClientKnownRequestError | PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let code = 'DATABASE_ERROR';

    if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, message, code } = this.handleKnownRequestError(exception));
    } else if (exception instanceof PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      code = 'VALIDATION_ERROR';
    }

    // Log error với chi tiết
    this.logger.error(
      `Prisma Exception: ${request.method} ${request.url} - Code: ${exception instanceof PrismaClientKnownRequestError ? exception.code : 'VALIDATION'} - Message: ${message}`,
      {
        exception: exception.stack,
        prismaCode:
          exception instanceof PrismaClientKnownRequestError
            ? exception.code
            : 'VALIDATION',
        meta:
          exception instanceof PrismaClientKnownRequestError
            ? exception.meta
            : undefined,
        request: {
          method: request.method,
          url: request.url,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        },
        timestamp: new Date().toISOString(),
      },
    );

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
        statusCode: status,
      },
    };

    response.status(status).json(errorResponse);
  }

  private handleKnownRequestError(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    code: string;
  } {
    const prismaCode = exception.code;
    const meta = exception.meta;

    switch (prismaCode) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Giá trị quá dài cho trường dữ liệu',
          code: 'VALUE_TOO_LONG',
        };

      case 'P2001':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Bản ghi không tồn tại',
          code: 'RECORD_NOT_FOUND',
        };

      case 'P2002': {
        const target = meta?.target as string[] | undefined;
        const field = target ? target[0] : 'field';
        return {
          status: HttpStatus.CONFLICT,
          message: `${this.getFieldDisplayName(field)} đã tồn tại`,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
        };
      }

      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Dữ liệu tham chiếu không hợp lệ',
          code: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
        };

      case 'P2004':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Ràng buộc dữ liệu bị vi phạm',
          code: 'CONSTRAINT_VIOLATION',
        };

      case 'P2005':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Giá trị không hợp lệ cho trường dữ liệu',
          code: 'INVALID_VALUE',
        };

      case 'P2006':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Giá trị không hợp lệ',
          code: 'INVALID_VALUE',
        };

      case 'P2007':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Lỗi xác thực dữ liệu',
          code: 'DATA_VALIDATION_ERROR',
        };

      case 'P2008':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Lỗi phân tích truy vấn',
          code: 'QUERY_PARSE_ERROR',
        };

      case 'P2009':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Lỗi xác thực truy vấn',
          code: 'QUERY_VALIDATION_ERROR',
        };

      case 'P2010':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi thực thi truy vấn',
          code: 'QUERY_EXECUTION_ERROR',
        };

      case 'P2011':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Ràng buộc null bị vi phạm',
          code: 'NULL_CONSTRAINT_VIOLATION',
        };

      case 'P2012':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Thiếu giá trị bắt buộc',
          code: 'MISSING_REQUIRED_VALUE',
        };

      case 'P2013':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Thiếu giá trị bắt buộc cho trường',
          code: 'MISSING_REQUIRED_ARGUMENT',
        };

      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Thay đổi dữ liệu vi phạm quan hệ bắt buộc',
          code: 'REQUIRED_RELATION_VIOLATION',
        };

      case 'P2015':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Bản ghi liên quan không tìm thấy',
          code: 'RELATED_RECORD_NOT_FOUND',
        };

      case 'P2016':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Lỗi giải thích truy vấn',
          code: 'QUERY_INTERPRETATION_ERROR',
        };

      case 'P2017':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Quan hệ không được kết nối',
          code: 'RECORDS_NOT_CONNECTED',
        };

      case 'P2018':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Các bản ghi kết nối bắt buộc không tìm thấy',
          code: 'REQUIRED_CONNECTED_RECORDS_NOT_FOUND',
        };

      case 'P2019':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Lỗi đầu vào',
          code: 'INPUT_ERROR',
        };

      case 'P2020':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Giá trị nằm ngoài phạm vi',
          code: 'VALUE_OUT_OF_RANGE',
        };

      case 'P2021':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Bảng không tồn tại trong cơ sở dữ liệu',
          code: 'TABLE_NOT_FOUND',
        };

      case 'P2022':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Cột không tồn tại trong cơ sở dữ liệu',
          code: 'COLUMN_NOT_FOUND',
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Không tìm thấy bản ghi để thực hiện thao tác',
          code: 'RECORD_NOT_FOUND_FOR_OPERATION',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi cơ sở dữ liệu không xác định',
          code: 'UNKNOWN_DATABASE_ERROR',
        };
    }
  }

  private getFieldDisplayName(field: string): string {
    const fieldMap: Record<string, string> = {
      email: 'Email',
      username: 'Tên người dùng',
      phone: 'Số điện thoại',
      phoneNumber: 'Số điện thoại',
      name: 'Tên',
      title: 'Tiêu đề',
      code: 'Mã',
      slug: 'Đường dẫn',
    };

    return fieldMap[field] || 'Trường dữ liệu';
  }
}
