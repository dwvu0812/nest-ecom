import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { LanguageRepository } from './repositories/language.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguageRepository],
  exports: [LanguagesService, LanguageRepository],
})
export class LanguagesModule {}
