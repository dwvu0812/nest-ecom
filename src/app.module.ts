import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { LanguagesModule } from './languages/languages.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
  imports: [
    PrismaModule,
    SharedModule,
    AuthModule,
    LanguagesModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
