import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import {
  Observable,
  throwError,
  TimeoutError,
  catchError,
  timeout,
} from 'rxjs';
import { serverConfig } from '../config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly timeoutMs = serverConfig.timeoutMs;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err as Error);
      }),
    );
  }
}
