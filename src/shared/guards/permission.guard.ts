import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/required-permissions.decorator';
import { AuthException } from '../exceptions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw AuthException.invalidToken();
    }

    // Get user with role and permissions
    const userWithPermissions = await this.usersService.findByIdWithRole(
      user.id,
    );

    if (!userWithPermissions || !userWithPermissions.role) {
      throw AuthException.insufficientPermissions();
    }

    const userPermissions = userWithPermissions.role.permissions || [];
    const userPermissionNames = userPermissions.map(
      (permission) => permission.name,
    );

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((requiredPermission) =>
      userPermissionNames.includes(requiredPermission),
    );

    if (!hasAllPermissions) {
      throw AuthException.insufficientPermissions();
    }

    return true;
  }
}
