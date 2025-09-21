import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => {
        // Handle cases where data already has a message (like auth responses)
        let message: string | undefined;
        let responseData: T = data;

        if (data && typeof data === 'object' && 'message' in data) {
          message = (data as any).message;
          // If the response only contains a message, keep the whole object as data
          // Otherwise, extract the data portion
          if (Object.keys(data).length === 1 && 'message' in data) {
            responseData = data;
          } else if ('data' in data) {
            responseData = (data as any).data;
          }
        }

        return {
          success: true,
          data: responseData,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
