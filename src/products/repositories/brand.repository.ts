import { Injectable } from '@nestjs/common';
import { Brand } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface BrandWithRelations extends Brand {
  translations?: any[];
  products?: any[];
  _count?: {
    products: number;
  };
}

@Injectable()
export class BrandRepository extends BaseRepository<Brand> {
  protected modelName = 'brand';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findWithTranslations(
    id: number,
    languageId?: number,
  ): Promise<BrandWithRelations | null> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: {
        translations: { where: translationWhere },
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
    });
  }

  async findAllActive(languageId?: number): Promise<BrandWithRelations[]> {
    const translationWhere = languageId
      ? { languageId, deletedAt: null }
      : { deletedAt: null };

    return this.findMany({
      where: { deletedAt: null },
      include: {
        translations: { where: translationWhere },
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
  }

  async searchBrands(
    query: string,
    languageId?: number,
  ): Promise<BrandWithRelations[]> {
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
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBrandsWithPagination(params: {
    page?: number;
    limit?: number;
    search?: string;
    languageId?: number;
  }) {
    const { page = 1, limit = 20, search, languageId } = params;
    const skip = (page - 1) * limit;

    let whereClause: any = { deletedAt: null };

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
          _count: {
            select: { products: { where: { deletedAt: null } } },
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

  async getBrandStatistics(): Promise<{
    totalBrands: number;
    brandsWithProducts: number;
    topBrands: Array<{ brandId: number; brandName: string; productCount: number }>;
  }> {
    const [totalBrands, brandsWithProducts] = await Promise.all([
      this.count({ deletedAt: null } as any),
      this.model.count({
        where: {
          deletedAt: null,
          products: {
            some: { deletedAt: null },
          },
        },
      }),
    ]);

    // Get top brands by product count
    const brands = await this.model.findMany({
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

    const topBrands = brands.map((brand: any) => ({
      brandId: brand.id,
      brandName: brand.translations[0]?.name || 'Unknown',
      productCount: brand._count.products,
    }));

    return {
      totalBrands,
      brandsWithProducts,
      topBrands,
    };
  }
}
