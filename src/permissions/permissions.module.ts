import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionGuard } from '../shared/guards/permission.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { jwtConfig } from '../shared/config';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: jwtConfig.expiresIn },
    }),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository, PermissionGuard],
  exports: [PermissionsService, PermissionRepository, PermissionGuard],
})
export class PermissionsModule {}
