import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface CategoryWithRelations extends Category {
  translations?: any[];
  parentCategory?: any;
  childCategories?: any[];
  products?: any[];
  _count?: {
    products: number;
    childCategories: number;
  };
}

@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  protected modelName = 'category';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findWithTranslations(
    id: number,
    languageId?: number,
  ): Promise<CategoryWithRelations | null> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: {
        translations: { where: translationWhere },
        parentCategory: {
          where: { deletedAt: null },
          include: {
            translations: { where: translationWhere },
          },
        },
        childCategories: {
          where: { deletedAt: null },
          include: {
            translations: { where: translationWhere },
          },
        },
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            childCategories: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  async findWithChildren(
    id: number,
    languageId?: number,
  ): Promise<CategoryWithRelations | null> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: {
        translations: { where: translationWhere },
        childCategories: {
          where: { deletedAt: null },
          include: {
            translations: { where: translationWhere },
            childCategories: {
              where: { deletedAt: null },
              include: {
                translations: { where: translationWhere },
              },
            },
          },
        },
        _count: {
          select: {
            products: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  async findByParent(
    parentId: number | null,
    languageId?: number,
  ): Promise<CategoryWithRelations[]> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    const whereClause: any = {
      deletedAt: null,
      parentCategoryId: parentId,
    };

    return this.model.findMany({
      where: whereClause,
      include: {
        translations: { where: translationWhere },
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            childCategories: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getCategoryTree(languageId?: number): Promise<CategoryWithRelations[]> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    // Get root categories (no parent)
    const rootCategories = await this.model.findMany({
      where: {
        deletedAt: null,
        parentCategoryId: null,
      },
      include: {
        translations: { where: translationWhere },
        childCategories: {
          where: { deletedAt: null },
          include: {
            translations: { where: translationWhere },
            childCategories: {
              where: { deletedAt: null },
              include: {
                translations: { where: translationWhere },
                _count: {
                  select: {
                    products: { where: { deletedAt: null } },
                  },
                },
              },
            },
            _count: {
              select: {
                products: { where: { deletedAt: null } },
                childCategories: { where: { deletedAt: null } },
              },
            },
          },
        },
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            childCategories: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return rootCategories;
  }

  async searchCategories(
    query: string,
    languageId?: number,
  ): Promise<CategoryWithRelations[]> {
    const translationWhere: any = { deletedAt: null };
    if (languageId) {
      translationWhere.languageId = languageId;
    }

    return this.model.findMany({
      where: {
        deletedAt: null,
        translations: {
          some: {
            name: { contains: query, mode: 'insensitive' },
            deletedAt: null,
          },
        },
      },
      include: {
        translations: { where: translationWhere },
        parentCategory: {
          where: { deletedAt: null },
          include: {
            translations: { where: translationWhere },
          },
        },
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            childCategories: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategoriesWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: number | null;
    languageId?: number;
  }) {
    const { page = 1, limit = 20, search, parentId, languageId } = params;
    const skip = (page - 1) * limit;

    let whereClause: any = { deletedAt: null };

    if (parentId !== undefined) {
      whereClause.parentCategoryId = parentId;
    }

    if (search) {
      whereClause.translations = {
        some: {
          name: { contains: search, mode: 'insensitive' },
          deletedAt: null,
        },
      };
    }

    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: whereClause,
        include: {
          translations: { where: translationWhere },
          parentCategory: {
            where: { deletedAt: null },
            include: {
              translations: { where: translationWhere },
            },
          },
          _count: {
            select: {
              products: { where: { deletedAt: null } },
              childCategories: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.model.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategoryStatistics(): Promise<{
    totalCategories: number;
    rootCategories: number;
    categoriesWithProducts: number;
    topCategories: Array<{
      categoryId: number;
      categoryName: string;
      productCount: number;
    }>;
  }> {
    const [totalCategories, rootCategories, categoriesWithProducts] =
      await Promise.all([
        this.count({ deletedAt: null } as any),
        this.model.count({
          where: {
            deletedAt: null,
            parentCategoryId: null,
          },
        }),
        this.model.count({
          where: {
            deletedAt: null,
            products: {
              some: { deletedAt: null },
            },
          },
        }),
      ]);

    // Get top categories by product count
    const categories = await this.model.findMany({
      where: { deletedAt: null },
      include: {
        translations: {
          where: { deletedAt: null },
          take: 1,
        },
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: {
        products: { _count: 'desc' },
      },
      take: 10,
    });

    const topCategories = categories.map((category: any) => ({
      categoryId: category.id,
      categoryName: category.translations[0]?.name || 'Unknown',
      productCount: category._count.products,
    }));

    return {
      totalCategories,
      rootCategories,
      categoriesWithProducts,
      topCategories,
    };
  }
}
