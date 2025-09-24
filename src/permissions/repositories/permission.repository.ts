import { Injectable } from '@nestjs/common';
import { Permission, HTTPMethod } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base-repository';

@Injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  protected modelName = 'permission';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByNameAndMethod(
    name: string,
    method: HTTPMethod,
  ): Promise<Permission | null> {
    return this.model.findFirst({
      where: {
        name,
        method,
        deletedAt: null,
      },
    });
  }

  async findByPathAndMethod(
    path: string,
    method: HTTPMethod,
  ): Promise<Permission | null> {
    return this.model.findFirst({
      where: {
        path,
        method,
        deletedAt: null,
      },
    });
  }

  async findAllActive(): Promise<Permission[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [{ name: 'asc' }, { method: 'asc' }],
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async existsByNameAndMethod(
    name: string,
    method: HTTPMethod,
    excludeId?: number,
  ): Promise<boolean> {
    const whereClause: any = {
      name,
      method,
      deletedAt: null,
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId,
      };
    }

    const count = await this.model.count({
      where: whereClause,
    });

    return count > 0;
  }

  async existsByPathAndMethod(
    path: string,
    method: HTTPMethod,
    excludeId?: number,
  ): Promise<boolean> {
    const whereClause: any = {
      path,
      method,
      deletedAt: null,
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId,
      };
    }

    const count = await this.model.count({
      where: whereClause,
    });

    return count > 0;
  }

  async findById(id: number): Promise<Permission | null> {
    return this.model.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
