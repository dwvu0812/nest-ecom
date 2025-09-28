import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserRepository } from './repositories/user.repository';
import { RoleRepository } from './repositories/role.repository';
import { ResourceException } from '../shared/exceptions';
import {
  USER_STATUS,
  USER_DEFAULTS,
  USER_RESOURCE_NAMES,
} from '../shared/constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByEmailWithRole(email: string) {
    return await this.userRepository.findByEmailWithRole(email);
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findUnique({ id });
  }

  async findByIdWithRole(id: number) {
    return await this.userRepository.findByIdWithRole(id);
  }

  async markEmailVerified(
    userId: number,
    when: Date = new Date(),
  ): Promise<User> {
    return await this.userRepository.markEmailVerified(userId, when);
  }

  async getDefaultUserRoleId(): Promise<number> {
    const role = await this.roleRepository.findDefaultUserRole();
    if (!role)
      throw ResourceException.notFound(USER_RESOURCE_NAMES.DEFAULT_USER_ROLE);
    return role.id;
  }

  async createUser(params: {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    createdById?: number;
  }): Promise<User> {
    const roleId = await this.getDefaultUserRoleId();
    return this.userRepository.createUser({
      email: params.email,
      name: params.name,
      password: params.password,
      phoneNumber: params.phoneNumber,
      roleId,
      createdById: params.createdById,
    });
  }

  async updateUserStatus(
    userId: number,
    status: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.BLOCKED,
    updatedBy?: number,
  ): Promise<User> {
    return this.userRepository.updateUserStatus(userId, status, updatedBy);
  }

  async searchUsers(
    query: string,
    limit: number = USER_DEFAULTS.SEARCH_LIMIT,
  ): Promise<User[]> {
    return this.userRepository.searchUsers(query, limit);
  }

  async getUsersWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.BLOCKED;
  }) {
    return this.userRepository.getUsersWithPagination(params);
  }

  async softDeleteUser(userId: number, deletedBy?: number): Promise<User> {
    return this.userRepository.softDelete({ id: userId }, deletedBy);
  }

  async restoreUser(userId: number): Promise<User> {
    return this.userRepository.restore({ id: userId });
  }

  // Google OAuth methods
  async findByGoogleId(googleId: string) {
    return await this.userRepository.findByGoogleId(googleId);
  }

  async linkGoogleAccount(userId: number, googleId: string, avatar?: string) {
    return await this.userRepository.linkGoogleAccount(
      userId,
      googleId,
      avatar,
    );
  }

  async getDefaultRole() {
    const role = await this.roleRepository.findDefaultUserRole();
    if (!role)
      throw ResourceException.notFound(USER_RESOURCE_NAMES.DEFAULT_USER_ROLE);
    return role;
  }

  async createGoogleUser(data: {
    email: string;
    name: string;
    googleId: string;
    avatar?: string;
    emailVerifiedAt?: Date | null;
    roleId: number;
    phoneNumber: string;
  }) {
    return await this.userRepository.createGoogleUser(data);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<User> {
    return await this.userRepository.updatePassword(userId, hashedPassword);
  }

  // =============================================================================
  // 2FA Methods
  // =============================================================================

  async updateTotpSecret(userId: number, totpSecret: string): Promise<User> {
    return await this.userRepository.updateTotpSecret(userId, totpSecret);
  }

  async enable2FA(userId: number): Promise<User> {
    return await this.userRepository.enable2FA(userId);
  }

  async disable2FA(userId: number): Promise<User> {
    return await this.userRepository.disable2FA(userId);
  }

  // =============================================================================
  // Admin User Management Methods
  // =============================================================================

  async createUserByAdmin(params: {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    roleId: number;
    emailVerified?: boolean;
    avatar?: string;
    createdById: number;
  }): Promise<User> {
    // Check if role exists
    const role = await this.roleRepository.findUnique({ id: params.roleId });
    if (!role) {
      throw ResourceException.notFound('Role', params.roleId.toString());
    }

    return this.userRepository.createUserByAdmin({
      email: params.email,
      name: params.name,
      password: params.password,
      phoneNumber: params.phoneNumber,
      roleId: params.roleId,
      emailVerified: params.emailVerified,
      avatar: params.avatar,
      createdById: params.createdById,
    });
  }

  async updateUserByAdmin(
    userId: number,
    updateData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      avatar?: string;
      roleId?: number;
      status?: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.BLOCKED;
      is2FAEnabled?: boolean;
      emailVerified?: boolean;
    },
    updatedById: number,
  ): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findUnique({ id: userId });
    if (!existingUser) {
      throw ResourceException.notFound('User', userId.toString());
    }

    // Check if role exists if roleId is being updated
    if (updateData.roleId) {
      const role = await this.roleRepository.findUnique({
        id: updateData.roleId,
      });
      if (!role) {
        throw ResourceException.notFound('Role', updateData.roleId.toString());
      }
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const existingEmailUser = await this.userRepository.findByEmail(
        updateData.email,
      );
      if (existingEmailUser) {
        throw ResourceException.alreadyExists(
          'User with email ' + updateData.email,
        );
      }
    }

    return this.userRepository.updateUserByAdmin(
      userId,
      updateData,
      updatedById,
    );
  }

  async changeUserRole(
    userId: number,
    roleId: number,
    updatedById: number,
  ): Promise<User> {
    // Check if user exists
    const user = await this.userRepository.findUnique({ id: userId });
    if (!user) {
      throw ResourceException.notFound('User', userId.toString());
    }

    // Check if role exists
    const role = await this.roleRepository.findUnique({ id: roleId });
    if (!role || !role.isActive) {
      throw ResourceException.notFound('Active role', roleId.toString());
    }

    return this.userRepository.update({ id: userId }, {
      roleId,
      updatedById,
    } as any);
  }

  async changeUserStatus(
    userId: number,
    status: keyof typeof USER_STATUS,
    updatedById: number,
    reason?: string,
  ): Promise<User> {
    // Check if user exists
    const user = await this.userRepository.findUnique({ id: userId });
    if (!user) {
      throw ResourceException.notFound('User', userId.toString());
    }

    // TODO: Log the status change with reason for audit
    return this.userRepository.updateUserStatus(
      userId,
      status as any,
      updatedById,
    );
  }

  async getUsersWithAdvancedPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.BLOCKED;
    createdAfter?: Date;
    createdBefore?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
  }) {
    return this.userRepository.getUsersWithAdvancedPagination(params);
  }

  async bulkUpdateUsers(
    userIds: number[],
    action: 'activate' | 'deactivate' | 'delete' | 'restore',
    updatedById: number,
    reason?: string,
  ): Promise<{ updated: number; errors: string[] }> {
    const errors: string[] = [];
    let updated = 0;

    for (const userId of userIds) {
      try {
        const user = await this.userRepository.findUnique({ id: userId });
        if (!user) {
          errors.push(`User ${userId} not found`);
          continue;
        }

        switch (action) {
          case 'activate':
            await this.userRepository.updateUserStatus(
              userId,
              'ACTIVE',
              updatedById,
            );
            break;
          case 'deactivate':
            await this.userRepository.updateUserStatus(
              userId,
              'BLOCKED',
              updatedById,
            );
            break;
          case 'delete':
            await this.userRepository.softDelete({ id: userId }, updatedById);
            break;
          case 'restore':
            await this.userRepository.restore({ id: userId });
            break;
        }
        updated++;
      } catch (error) {
        errors.push(`Error updating user ${userId}: ${error.message}`);
      }
    }

    return { updated, errors };
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    deletedUsers: number;
    usersLast30Days: number;
    roleDistribution: Array<{ roleName: string; count: number }>;
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      deletedUsers,
      usersLast30Days,
      roleDistribution,
    ] = await Promise.all([
      this.userRepository.count({ deletedAt: null } as any),
      this.userRepository.count({ status: 'ACTIVE', deletedAt: null } as any),
      this.userRepository.count({ status: 'BLOCKED', deletedAt: null } as any),
      this.userRepository.count({ deletedAt: { not: null } } as any),
      this.userRepository.count({
        createdAt: { gte: thirtyDaysAgo },
        deletedAt: null,
      } as any),
      this.roleRepository.getRoleUsageStats(),
    ]);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      deletedUsers,
      usersLast30Days,
      roleDistribution: roleDistribution.map((stat) => ({
        roleName: stat.roleName,
        count: stat.userCount,
      })),
    };
  }
}
