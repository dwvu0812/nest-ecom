import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { RepositoryModule } from '../shared/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
