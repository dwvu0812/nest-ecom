import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJS E-commerce API v1.0 - Welcome! 🚀';
  }
}
