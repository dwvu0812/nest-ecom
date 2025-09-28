import { User, UserStatus } from '@prisma/client';

export class UserRoleDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export class UserManagementResponseDto {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  avatar?: string | null;
  status: UserStatus;
  is2FAEnabled: boolean;
  emailVerifiedAt?: Date | null;
  googleId?: string | null;
  role: UserRoleDto;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;

  // Audit fields
  createdById?: number | null;
  updatedById?: number | null;

  // Additional admin info
  lastLoginAt?: Date;
  deviceCount?: number;
  activeSessionCount?: number;

  constructor(partial: Partial<UserManagementResponseDto>) {
    Object.assign(this, partial);
  }
}

export class UserListResponseDto {
  data: UserManagementResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(partial: Partial<UserListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ChangeUserRoleDto {
  roleId: number;
  updatedById?: number;
}

export class ChangeUserStatusDto {
  status: UserStatus;
  reason?: string;
  updatedById?: number;
}

export class BulkUserActionDto {
  userIds: number[];
  action: 'activate' | 'deactivate' | 'delete' | 'restore';
  reason?: string;
  updatedById?: number;
}
