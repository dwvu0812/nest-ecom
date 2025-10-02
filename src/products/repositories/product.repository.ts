import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductWithRelations extends Product {
  brand?: any;
  translations?: any[];
  categories?: any[];
  skus?: any[];
  reviews?: any[];
  variants?: any[];
}

export interface ProductSearchFilters {
  brandIds?: number[];
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
}

export interface ProductPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: ProductSearchFilters;
  sortBy?: 'name' | 'price' | 'rating' | 'created';
  sortOrder?: 'asc' | 'desc';
  languageId?: number;
}

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  protected modelName = 'product';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByBrand(brandId: number): Promise<ProductWithRelations[]> {
    return this.findMany({
      where: { brandId },
      include: {
        brand: {
          include: { translations: true },
        },
        translations: true,
        skus: {
          where: { deletedAt: null },
          select: { id: true, value: true, price: true, stock: true, images: true },
        },
        categories: {
          include: { translations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
  }

  async findByCategory(categoryId: number): Promise<ProductWithRelations[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
        categories: {
          some: { id: categoryId, deletedAt: null },
        },
      },
      include: {
        brand: {
          include: { translations: true },
        },
        translations: true,
        categories: {
          include: { translations: true },
        },
        skus: {
          where: { deletedAt: null },
          select: { id: true, value: true, price: true, stock: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithTranslations(
    id: number,
    languageId?: number,
  ): Promise<ProductWithRelations | null> {
    const includeClause: any = {
      brand: {
        include: {
          translations: languageId ? { where: { languageId } } : true,
        },
      },
      translations: languageId ? { where: { languageId } } : true,
      categories: {
        where: { deletedAt: null },
        include: {
          translations: languageId ? { where: { languageId } } : true,
        },
      },
      variants: {
        where: { deletedAt: null },
        include: {
          options: {
            where: { deletedAt: null },
          },
        },
      },
      skus: {
        where: { deletedAt: null },
        include: {
          variantOptions: {
            include: {
              variant: true,
            },
          },
        },
      },
      reviews: {
        where: { deletedAt: null },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    };

    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: includeClause,
    });
  }

  async searchProducts(
    query: string,
    filters?: ProductSearchFilters,
  ): Promise<ProductWithRelations[]> {
    const whereClause: any = {
      deletedAt: null,
      OR: [
        {
          translations: {
            some: {
              name: { contains: query, mode: 'insensitive' },
              deletedAt: null,
            },
          },
        },
        {
          translations: {
            some: {
              description: { contains: query, mode: 'insensitive' },
              deletedAt: null,
            },
          },
        },
        {
          brand: {
            translations: {
              some: {
                name: { contains: query, mode: 'insensitive' },
                deletedAt: null,
              },
            },
          },
        },
      ],
    };

    if (filters) {
      if (filters.brandIds?.length) {
        whereClause.brandId = { in: filters.brandIds };
      }

      if (filters.categoryIds?.length) {
        whereClause.categories = {
          some: { id: { in: filters.categoryIds }, deletedAt: null },
        };
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const priceFilter: any = {};
        if (filters.minPrice !== undefined) priceFilter.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) priceFilter.lte = filters.maxPrice;
        whereClause.base_price = priceFilter;
      }

      if (filters.inStock) {
        whereClause.skus = {
          some: {
            stock: { gt: 0 },
            deletedAt: null,
          },
        };
      }
    }

    return this.model.findMany({
      where: whereClause,
      include: {
        brand: {
          include: { translations: true },
        },
        translations: true,
        skus: {
          where: { deletedAt: null },
          select: { id: true, value: true, price: true, stock: true },
        },
        categories: {
          where: { deletedAt: null },
          include: { translations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getProductsWithPagination(params: ProductPaginationParams) {
    const {
      page = 1,
      limit = 12,
      search,
      filters,
      sortBy = 'created',
      sortOrder = 'desc',
      languageId,
    } = params;
    const skip = (page - 1) * limit;

    let whereClause: any = { deletedAt: null };

    // Search logic
    if (search) {
      whereClause.OR = [
        {
          translations: {
            some: {
              name: { contains: search, mode: 'insensitive' },
              deletedAt: null,
            },
          },
        },
        {
          translations: {
            some: {
              description: { contains: search, mode: 'insensitive' },
              deletedAt: null,
            },
          },
        },
      ];
    }

    // Apply filters
    if (filters) {
      if (filters.brandIds?.length) {
        whereClause.brandId = { in: filters.brandIds };
      }

      if (filters.categoryIds?.length) {
        whereClause.categories = {
          some: { id: { in: filters.categoryIds }, deletedAt: null },
        };
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const priceFilter: any = {};
        if (filters.minPrice !== undefined) priceFilter.gte = filters.minPrice;
        if (filters.maxPrice !== undefined) priceFilter.lte = filters.maxPrice;
        whereClause.base_price = priceFilter;
      }

      if (filters.inStock) {
        whereClause.skus = {
          some: {
            stock: { gt: 0 },
            deletedAt: null,
          },
        };
      }
    }

    // Sort logic
    let orderBy: any;
    switch (sortBy) {
      case 'price':
        orderBy = { base_price: sortOrder };
        break;
      case 'rating':
        // Default to createdAt for now, would need aggregation for actual rating
        orderBy = { createdAt: sortOrder };
        break;
      case 'name':
      default:
        orderBy = { createdAt: sortOrder };
    }

    const translationInclude = languageId
      ? { where: { languageId, deletedAt: null } }
      : { where: { deletedAt: null } };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: whereClause,
        include: {
          brand: {
            include: { translations: translationInclude },
          },
          translations: translationInclude,
          skus: {
            where: { deletedAt: null },
            select: { id: true, value: true, price: true, stock: true, images: true },
          },
          reviews: {
            where: { deletedAt: null },
            select: { rating: true },
          },
          categories: {
            where: { deletedAt: null },
            include: { translations: translationInclude },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where: whereClause }),
    ]);

    // Calculate average rating and total stock for each product
    const productsWithRating = data.map((product: any) => {
      const avgRating = product.reviews.length
        ? product.reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0,
          ) / product.reviews.length
        : 0;

      const totalStock = product.skus.reduce(
        (sum: number, sku: any) => sum + sku.stock,
        0,
      );

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        totalStock,
        reviews: undefined, // Remove reviews from response
      };
    });

    return {
      data: productsWithRating,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStock(
    productId: number,
    skuId: number,
    quantity: number,
  ): Promise<void> {
    await this.prisma.sKU.update({
      where: {
        id: skuId,
        productId,
        deletedAt: null,
      },
      data: {
        stock: { decrement: quantity },
        updatedAt: new Date(),
      },
    });
  }

  async getTopRatedProducts(
    limit: number = 10,
    languageId?: number,
  ): Promise<ProductWithRelations[]> {
    const translationInclude = languageId
      ? { where: { languageId, deletedAt: null } }
      : { where: { deletedAt: null } };

    return this.model.findMany({
      where: {
        deletedAt: null,
        reviews: {
          some: { deletedAt: null },
        },
      },
      include: {
        brand: {
          include: { translations: translationInclude },
        },
        translations: translationInclude,
        skus: {
          where: { deletedAt: null },
          select: { id: true, value: true, price: true, stock: true },
        },
        reviews: {
          where: { deletedAt: null },
          select: { rating: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRelatedProducts(
    productId: number,
    limit: number = 6,
    languageId?: number,
  ): Promise<ProductWithRelations[]> {
    const product = await this.model.findUnique({
      where: { id: productId, deletedAt: null },
      include: { categories: { where: { deletedAt: null } } },
    });

    if (!product?.categories?.length) return [];

    const categoryIds = product.categories.map((cat: any) => cat.id);

    const translationInclude = languageId
      ? { where: { languageId, deletedAt: null } }
      : { where: { deletedAt: null } };

    return this.model.findMany({
      where: {
        deletedAt: null,
        id: { not: productId },
        categories: {
          some: {
            id: { in: categoryIds },
            deletedAt: null,
          },
        },
      },
      include: {
        brand: {
          include: { translations: translationInclude },
        },
        translations: translationInclude,
        skus: {
          where: { deletedAt: null },
          select: { id: true, value: true, price: true, stock: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductStatistics(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    totalValue: number;
  }> {
    const [totalProducts, activeProducts, outOfStockProducts] =
      await Promise.all([
        this.count({ deletedAt: null } as any),
        this.model.count({
          where: {
            deletedAt: null,
            skus: {
              some: {
                stock: { gt: 0 },
                deletedAt: null,
              },
            },
          },
        }),
        this.model.count({
          where: {
            deletedAt: null,
            skus: {
              every: {
                OR: [{ stock: 0 }, { deletedAt: { not: null } }],
              },
            },
          },
        }),
      ]);

    // Calculate total inventory value
    const products = await this.model.findMany({
      where: { deletedAt: null },
      include: {
        skus: {
          where: { deletedAt: null },
          select: { price: true, stock: true },
        },
      },
    });

    const totalValue = products.reduce((sum, product: any) => {
      const productValue = product.skus.reduce(
        (skuSum: number, sku: any) => skuSum + sku.price * sku.stock,
        0,
      );
      return sum + productValue;
    }, 0);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalValue,
    };
  }
}
