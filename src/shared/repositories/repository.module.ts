import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../../users/repositories/user.repository';
import { RoleRepository } from '../../users/repositories/role.repository';
import { VerificationCodeRepository } from '../../auth/repositories/verification-code.repository';
import { LanguageRepository } from '../../languages/repositories/language.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    UserRepository,
    RoleRepository,
    VerificationCodeRepository,
    LanguageRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    VerificationCodeRepository,
    LanguageRepository,
  ],
})
export class RepositoryModule {}
