import {
  FindManyArgs,
  WhereInput,
  CreateInput,
  UpdateInput,
} from '../types/repository.types';

export interface BaseRepositoryInterface<T, TWhereUnique = { id: number }> {
  // Basic CRUD operations
  findMany(args?: FindManyArgs<T>): Promise<T[]>;
  findUnique(where: TWhereUnique): Promise<T | null>;
  findFirst(where?: WhereInput<T>): Promise<T | null>;
  create(data: CreateInput<T>): Promise<T>;
  update(where: TWhereUnique, data: UpdateInput<T>): Promise<T>;
  delete(where: TWhereUnique): Promise<T>;

  // Soft delete operations
  softDelete(where: TWhereUnique, deletedBy?: number): Promise<T>;
  restore(where: TWhereUnique): Promise<T>;

  // Count operations
  count(where?: WhereInput<T>): Promise<number>;

  // Exists check
  exists(where: WhereInput<T>): Promise<boolean>;

  // Pagination
  findManyWithPagination(args: {
    where?: WhereInput<T>;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
