import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  LoggingInterceptor,
  TimeoutInterceptor,
  TransformInterceptor,
} from './interceptor';
import { AuditLogService } from './services';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    LoggingInterceptor,
    TransformInterceptor,
    TimeoutInterceptor,
    AuditLogService,
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
  exports: [
    TransformInterceptor,
    LoggingInterceptor,
    TimeoutInterceptor,
    AuditLogService,
  ],
})
export class SharedModule {}
