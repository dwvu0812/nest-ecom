import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../../users/repositories/user.repository';
import { RoleRepository } from '../../users/repositories/role.repository';
import { VerificationCodeRepository } from '../../auth/repositories/verification-code.repository';

@Module({
  imports: [PrismaModule],
  providers: [UserRepository, RoleRepository, VerificationCodeRepository],
  exports: [UserRepository, RoleRepository, VerificationCodeRepository],
})
export class RepositoryModule {}
