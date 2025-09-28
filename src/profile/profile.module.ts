import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '../auth/auth.module';
import { LanguagesModule } from '../languages/languages.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { RepositoryModule } from '../shared/repositories/repository.module';
import { avatarUploadConfig } from './config/upload.config';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserTranslationRepository } from './repositories/user-translation.repository';

@Module({
  imports: [
    PrismaModule,
    RepositoryModule, // Add this to get UserRepository
    UsersModule,
    LanguagesModule,
    AuthModule,
    MulterModule.register(avatarUploadConfig),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, UserTranslationRepository],
  exports: [ProfileService, UserTranslationRepository],
})
export class ProfileModule {}
