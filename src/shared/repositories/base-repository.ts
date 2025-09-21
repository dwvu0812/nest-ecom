import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepositoryInterface } from './interfaces/base-repository.interface';
import {
  FindManyArgs,
  WhereInput,
  CreateInput,
  UpdateInput,
  PaginationResult,
  AuditableEntity,
} from './types/repository.types';

@Injectable()
export abstract class BaseRepository<
  T extends AuditableEntity,
  TWhereUnique = { id: number },
> implements BaseRepositoryInterface<T, TWhereUnique>
{
  protected abstract modelName: string;

  constructor(protected readonly prisma: PrismaService) {}

  protected get model() {
    return (this.prisma as any)[this.modelName];
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const { where, ...restArgs } = args || {};
    return this.model.findMany({
      where: this.buildWhereClause(where),
      ...restArgs,
    });
  }

  async findUnique(where: TWhereUnique): Promise<T | null> {
    return this.model.findUnique({ where });
  }

  async findFirst(where?: WhereInput<T>): Promise<T | null> {
    return this.model.findFirst({
      where: this.buildWhereClause(where),
    });
  }

  async create(data: CreateInput<T>): Promise<T> {
    const createData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.model.create({ data: createData });
  }

  async update(where: TWhereUnique, data: UpdateInput<T>): Promise<T> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };
    return this.model.update({
      where,
      data: updateData,
    });
  }

  async delete(where: TWhereUnique): Promise<T> {
    return this.model.delete({ where });
  }

  async softDelete(where: TWhereUnique, deletedBy?: number): Promise<T> {
    const updateData: any = {
      deletedAt: new Date(),
      updatedAt: new Date(),
    };
    if (deletedBy) {
      updateData.updatedById = deletedBy;
    }
    return this.model.update({
      where,
      data: updateData,
    });
  }

  async restore(where: TWhereUnique): Promise<T> {
    return this.model.update({
      where,
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
    });
  }

  async count(where?: WhereInput<T>): Promise<number> {
    return this.model.count({
      where: this.buildWhereClause(where),
    });
  }

  async exists(where: WhereInput<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async findManyWithPagination(args: {
    where?: WhereInput<T>;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<PaginationResult<T>> {
    const { where, orderBy, skip = 0, take = 10 } = args;
    const whereClause = this.buildWhereClause(where);

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      }),
      this.model.count({ where: whereClause }),
    ]);

    const page = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  protected buildWhereClause(where?: WhereInput<T>): any {
    if (!where) return { deletedAt: null };

    const { deletedAt, ...restWhere } = where;

    // If deletedAt is explicitly provided, use it; otherwise exclude deleted records
    const deletedAtClause =
      deletedAt !== undefined ? { deletedAt } : { deletedAt: null };

    return {
      ...restWhere,
      ...deletedAtClause,
    };
  }

  // Helper method for including relations
  protected buildInclude(relations?: string[]): any {
    if (!relations?.length) return undefined;

    return relations.reduce((acc, relation) => {
      acc[relation] = true;
      return acc;
    }, {} as any);
  }
}
