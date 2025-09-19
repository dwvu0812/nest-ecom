import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
} from './interceptor';

@Module({
  providers: [
    LoggingInterceptor,
    TransformInterceptor,
    TimeoutInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
  exports: [TransformInterceptor, LoggingInterceptor, TimeoutInterceptor],
})
export class SharedModule {}
