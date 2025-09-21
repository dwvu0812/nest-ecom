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
}
