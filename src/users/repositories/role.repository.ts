import { Injectable } from '@nestjs/common';
import { Role, Permission } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface RoleWithPermissions extends Role {
  permissions?: Permission[];
  _count?: {
    users: number;
  };
}

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  protected modelName = 'role';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.findFirst({ name });
  }

  async findDefaultUserRole(): Promise<Role | null> {
    return this.findByName('user');
  }

  async findByNameWithPermissions(
    name: string,
  ): Promise<RoleWithPermissions | null> {
    return this.model.findFirst({
      where: {
        name,
        deletedAt: null,
      },
      include: {
        permissions: true,
      },
    });
  }

  async findByIdWithPermissions(
    id: number,
  ): Promise<RoleWithPermissions | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findAllActiveRoles(): Promise<Role[]> {
    return this.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAllRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    return this.model.findMany({
      where: { deletedAt: null },
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createRoleWithPermissions(data: {
    name: string;
    description: string;
    permissionIds: number[];
    createdById?: number;
  }): Promise<RoleWithPermissions> {
    const { permissionIds, ...roleData } = data;

    return this.model.create({
      data: {
        ...roleData,
        isActive: true,
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
      include: {
        permissions: true,
      },
    });
  }

  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
    updatedById?: number,
  ): Promise<RoleWithPermissions> {
    // First, disconnect all existing permissions
    await this.model.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: [],
        },
      },
    });

    // Then connect the new permissions
    return this.model.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
        updatedById,
        updatedAt: new Date(),
      },
      include: {
        permissions: true,
      },
    });
  }

  async toggleRoleStatus(roleId: number, updatedById?: number): Promise<Role> {
    const role = await this.findUnique({ id: roleId });
    if (!role) {
      throw new Error('Role not found');
    }

    return this.update({ id: roleId }, {
      isActive: !role.isActive,
      updatedById,
    } as any);
  }

  async getRoleUsageStats(): Promise<
    Array<{ roleId: number; roleName: string; userCount: number }>
  > {
    return this.model
      .findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          _count: {
            select: { users: true },
          },
        },
        orderBy: { name: 'asc' },
      })
      .then((roles: any[]) =>
        roles.map((role) => ({
          roleId: role.id,
          roleName: role.name,
          userCount: role._count.users,
        })),
      );
  }
}
