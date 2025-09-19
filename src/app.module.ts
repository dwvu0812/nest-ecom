import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
