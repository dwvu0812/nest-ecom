import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions - Array of permission names required to access the route
 *
 * @example
 * ```typescript
 * @RequiredPermissions('MANAGE_USERS', 'VIEW_USERS')
 * @Get('users')
 * async getUsers() { ... }
 * ```
 */
export const RequiredPermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, permissions);
