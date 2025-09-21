import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RepositoryModule } from '../shared/repositories/repository.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [RepositoryModule, UsersModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
