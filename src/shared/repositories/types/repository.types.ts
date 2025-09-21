// Generic types for repository operations
export type WhereInput<T> = Partial<T> & {
  id?: number;
  deletedAt?: Date | null;
  createdAt?: Date | { gte?: Date; lte?: Date };
  updatedAt?: Date | { gte?: Date; lte?: Date };
};

export type CreateInput<T> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
> & {
  createdById?: number;
};

export type UpdateInput<T> = Partial<
  Omit<T, 'id' | 'createdAt' | 'updatedAt'>
> & {
  updatedById?: number;
};

export type FindManyArgs<T> = {
  where?: WhereInput<T>;
  select?: any;
  include?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
};

export type OrderBy = {
  [key: string]: 'asc' | 'desc';
};

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Audit fields for entities
export interface AuditableEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdById?: number | null;
  updatedById?: number | null;
}
