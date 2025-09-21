import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, headers } = request;
    const ip = request.ip;
    const userAgent = headers['user-agent'] || '';

    const now = Date.now();

    this.logger.log(`${method} ${url} - ${ip} - ${userAgent} - Start`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        const statusCode = response.statusCode;
        this.logger.log(
          `${method} ${url} - ${ip} - ${userAgent} - ${statusCode} - ${responseTime}ms - SUCCESS`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        const statusCode = error.status || 500;

        this.logger.error(
          `${method} ${url} - ${ip} - ${userAgent} - ${statusCode} - ${responseTime}ms - ERROR: ${error.message}`,
          {
            error: error.stack || error,
            requestBody: request.body,
            requestQuery: request.query,
            requestParams: request.params,
            timestamp: new Date().toISOString(),
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
