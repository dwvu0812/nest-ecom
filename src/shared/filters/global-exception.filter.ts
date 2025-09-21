import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string | string[];
    timestamp: string;
    path: string;
    statusCode: number;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || 'Unknown error';
      }

      code = this.getErrorCode(exception);
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name || 'ERROR';
    }

    // Sanitize error message for production
    if (
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = 'Internal server error';
    }

    // Log error với context detail
    this.logger.error(
      `Exception caught: ${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      {
        exception: exception instanceof Error ? exception.stack : exception,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body,
          query: request.query,
          params: request.params,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        },
        timestamp: new Date().toISOString(),
      },
    );

    // Consistent error response format
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

  private getErrorCode(exception: HttpException): string {
    const status = exception.getStatus();
    const exceptionName = exception.constructor.name;

    if (status === 400) {
      return 'BAD_REQUEST';
    } else if (status === 401) {
      return 'UNAUTHORIZED';
    } else if (status === 403) {
      return 'FORBIDDEN';
    } else if (status === 404) {
      return 'NOT_FOUND';
    } else if (status === 409) {
      return 'CONFLICT';
    } else if (status === 422) {
      return 'VALIDATION_ERROR';
    } else if (status === 429) {
      return 'RATE_LIMIT_EXCEEDED';
    } else if (status === 500) {
      return 'INTERNAL_ERROR';
    } else {
      return exceptionName.replace('Exception', '').toUpperCase();
    }
  }
}
