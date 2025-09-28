import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base-repository';

export interface UserWithRelations extends User {
  role?: any;
  userTranslations?: any[];
}

@Injectable()
export class UserRepository extends BaseRepository<User> {
  protected modelName = 'user';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findUnique({
      where: { email },
    });
  }

  async findByEmailWithRole(email: string): Promise<UserWithRelations | null> {
    return this.model.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findByIdWithRole(id: number): Promise<UserWithRelations | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    roleId: number;
    createdById?: number;
  }): Promise<User> {
    return this.create({
      email: data.email,
      name: data.name,
      password: data.password,
      phoneNumber: data.phoneNumber,
      roleId: data.roleId,
      emailVerifiedAt: null,
      status: 'ACTIVE',
      createdById: data.createdById,
    } as any);
  }

  async markEmailVerified(
    userId: number,
    when: Date = new Date(),
  ): Promise<User> {
    return this.update({ id: userId }, { emailVerifiedAt: when } as any);
  }

  async updateUserStatus(
    userId: number,
    status: 'ACTIVE' | 'BLOCKED',
    updatedBy?: number,
  ): Promise<User> {
    return this.update({ id: userId }, {
      status,
      updatedById: updatedBy,
    } as any);
  }

  async findUsersByRole(roleId: number): Promise<User[]> {
    return this.findMany({
      where: { roleId },
      include: {
        role: true,
      },
    });
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUsersWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: 'ACTIVE' | 'BLOCKED';
  }) {
    const { page = 1, limit = 10, search, roleId, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
      ];
    }

    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    return this.findManyWithPagination({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async findByGoogleId(googleId: string): Promise<UserWithRelations | null> {
    return this.model.findFirst({
      where: {
        googleId,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async linkGoogleAccount(
    userId: number,
    googleId: string,
    avatar?: string,
  ): Promise<User> {
    const updateData: any = { googleId };
    if (avatar) updateData.avatar = avatar;

    return this.update({ id: userId }, updateData);
  }

  async createGoogleUser(data: {
    email: string;
    name: string;
    googleId: string;
    avatar?: string;
    emailVerifiedAt?: Date | null;
    roleId: number;
    phoneNumber: string;
  }): Promise<UserWithRelations> {
    const user = await this.model.create({
      data: {
        email: data.email,
        name: data.name,
        password: '', // Google users don't have password initially
        phoneNumber: data.phoneNumber,
        googleId: data.googleId,
        avatar: data.avatar,
        emailVerifiedAt: data.emailVerifiedAt,
        roleId: data.roleId,
        status: 'ACTIVE',
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return user;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<User> {
    return this.update({ id: userId }, { password: hashedPassword } as any);
  }

  // =============================================================================
  // 2FA Methods
  // =============================================================================

  async updateTotpSecret(userId: number, totpSecret: string): Promise<User> {
    return this.update({ id: userId }, { totpSecret } as any);
  }

  async enable2FA(userId: number): Promise<User> {
    return this.update({ id: userId }, { is2FAEnabled: true } as any);
  }

  async disable2FA(userId: number): Promise<User> {
    return this.update({ id: userId }, {
      is2FAEnabled: false,
      totpSecret: null,
    } as any);
  }

  // =============================================================================
  // Profile Methods
  // =============================================================================

  async findByIdWithTranslations(
    id: number,
  ): Promise<UserWithRelations | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        userTranslations: {
          include: {
            language: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async updateProfile(
    userId: number,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      avatar?: string;
    },
    updatedById?: number,
  ): Promise<User> {
    return this.update({ id: userId }, {
      ...data,
      updatedById,
    } as any);
  }

  async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
    return this.update({ id: userId }, { avatar: avatarUrl } as any);
  }

  // =============================================================================
  // Admin User Management Methods
  // =============================================================================

  async createUserByAdmin(data: {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
    roleId: number;
    emailVerified?: boolean;
    avatar?: string;
    createdById: number;
  }): Promise<User> {
    return this.create({
      email: data.email,
      name: data.name,
      password: data.password,
      phoneNumber: data.phoneNumber,
      roleId: data.roleId,
      avatar: data.avatar,
      emailVerifiedAt: data.emailVerified ? new Date() : null,
      status: 'ACTIVE',
      createdById: data.createdById,
    } as any);
  }

  async updateUserByAdmin(
    userId: number,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      avatar?: string;
      roleId?: number;
      status?: 'ACTIVE' | 'BLOCKED';
      is2FAEnabled?: boolean;
      emailVerified?: boolean;
    },
    updatedById: number,
  ): Promise<User> {
    const updateData: any = { ...data, updatedById };

    if (data.emailVerified !== undefined) {
      updateData.emailVerifiedAt = data.emailVerified ? new Date() : null;
      delete updateData.emailVerified;
    }

    return this.update({ id: userId }, updateData);
  }

  async getUsersWithAdvancedPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    status?: 'ACTIVE' | 'BLOCKED';
    createdAfter?: Date;
    createdBefore?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      roleId,
      status,
      createdAfter,
      createdBefore,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted = false,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
      ];
    }

    // Filters
    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    // Date range filters
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = createdAfter;
      if (createdBefore) where.createdAt.lte = createdBefore;
    }

    // Handle deleted records
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // Build sort order
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Use direct Prisma queries for complex includes
    const [data, total] = await Promise.all([
      this.model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              devices: { where: { isActive: true } },
              sessions: { where: { isActive: true } },
            },
          },
        },
      }),
      this.model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
