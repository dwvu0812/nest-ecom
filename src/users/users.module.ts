import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { AdminUserController } from './controllers/admin-user.controller';
import { PermissionGuard } from '../shared/guards/permission.guard';
import { RepositoryModule } from '../shared/repositories/repository.module';
import { SharedModule } from '../shared/shared.module';
import { jwtConfig } from '../shared/config';

@Module({
  imports: [
    RepositoryModule,
    SharedModule, // Import SharedModule to get AuditLogService
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [AdminUserController],
  providers: [UsersService, PermissionGuard],
  exports: [UsersService],
})
export class UsersModule {}
