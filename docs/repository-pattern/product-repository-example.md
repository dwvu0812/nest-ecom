# Ví dụ: Implement Product Repository

Đây là ví dụ minh họa cách implement repository cho Product entity trong hệ thống e-commerce.

## 1. Tạo Product Repository Interface (Optional)

```typescript
// src/products/repositories/interfaces/product-repository.interface.ts
import { Product, ProductTranslation } from '@prisma/client';
import { BaseRepositoryInterface } from '../../../shared/repositories/interfaces/base-repository.interface';

export interface ProductWithRelations extends Product {
  brand?: any;
  translations?: ProductTranslation[];
  categories?: any[];
  skus?: any[];
  reviews?: any[];
}

export interface ProductRepositoryInterface
  extends BaseRepositoryInterface<Product> {
  // Product-specific methods
  findByBrand(brandId: number): Promise<Product[]>;
  findByCategory(categoryId: number): Promise<Product[]>;
  findWithTranslations(
    id: number,
    languageId?: number,
  ): Promise<ProductWithRelations | null>;
  searchProducts(
    query: string,
    filters?: ProductSearchFilters,
  ): Promise<Product[]>;
  getProductsWithPagination(params: ProductPaginationParams): Promise<any>;
  updateStock(
    productId: number,
    skuId: number,
    quantity: number,
  ): Promise<void>;
  getTopRatedProducts(limit?: number): Promise<ProductWithRelations[]>;
  getRelatedProducts(productId: number, limit?: number): Promise<Product[]>;
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
}
```

## 2. Implement Product Repository

```typescript
// src/products/repositories/product.repository.ts
import { Injectable } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ProductRepositoryInterface,
  ProductWithRelations,
  ProductSearchFilters,
  ProductPaginationParams,
} from './interfaces/product-repository.interface';

@Injectable()
export class ProductRepository
  extends BaseRepository<Product>
  implements ProductRepositoryInterface
{
  protected modelName = 'product';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByBrand(brandId: number): Promise<Product[]> {
    return this.findMany({
      where: { brandId },
      include: {
        brand: true,
        translations: true,
        skus: {
          where: { deletedAt: null },
          select: { id: true, price: true, stock: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.findMany({
      where: {
        categories: {
          some: { id: categoryId },
        },
      },
      include: {
        brand: true,
        translations: true,
        categories: true,
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
        include: {
          translations: languageId ? { where: { languageId } } : true,
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
      where: { id },
      include: includeClause,
    });
  }

  async searchProducts(
    query: string,
    filters?: ProductSearchFilters,
  ): Promise<Product[]> {
    const whereClause: any = {
      deletedAt: null,
      OR: [
        {
          translations: {
            some: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        },
        {
          translations: {
            some: {
              description: { contains: query, mode: 'insensitive' },
            },
          },
        },
        {
          brand: {
            translations: {
              some: {
                name: { contains: query, mode: 'insensitive' },
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
          some: { id: { in: filters.categoryIds } },
        };
      }

      if (filters.minPrice || filters.maxPrice) {
        const priceFilter: any = {};
        if (filters.minPrice) priceFilter.gte = filters.minPrice;
        if (filters.maxPrice) priceFilter.lte = filters.maxPrice;
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
          select: { id: true, price: true, stock: true },
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
            },
          },
        },
        {
          translations: {
            some: {
              description: { contains: search, mode: 'insensitive' },
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
          some: { id: { in: filters.categoryIds } },
        };
      }

      if (filters.minPrice || filters.maxPrice) {
        const priceFilter: any = {};
        if (filters.minPrice) priceFilter.gte = filters.minPrice;
        if (filters.maxPrice) priceFilter.lte = filters.maxPrice;
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
      case 'name':
        orderBy = {
          translations: {
            _count: sortOrder,
          },
        };
        break;
      case 'price':
        orderBy = { base_price: sortOrder };
        break;
      case 'rating':
        // This would require aggregation
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: whereClause,
        include: {
          brand: {
            include: { translations: true },
          },
          translations: true,
          skus: {
            where: { deletedAt: null },
            select: { id: true, price: true, stock: true },
          },
          reviews: {
            where: { deletedAt: null },
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.model.count({ where: whereClause }),
    ]);

    // Calculate average rating for each product
    const productsWithRating = data.map((product: any) => {
      const avgRating = product.reviews.length
        ? product.reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0,
          ) / product.reviews.length
        : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
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
        productId, // Ensure SKU belongs to product
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
  ): Promise<ProductWithRelations[]> {
    // This is a complex query that would benefit from a database view
    // For now, we'll use a simpler approach
    return this.model.findMany({
      where: {
        deletedAt: null,
        reviews: {
          some: {},
        },
      },
      include: {
        brand: {
          include: { translations: true },
        },
        translations: true,
        skus: {
          where: { deletedAt: null },
          select: { id: true, price: true, stock: true },
        },
        reviews: {
          where: { deletedAt: null },
          select: { rating: true },
        },
      },
      take: limit,
    });
  }

  async getRelatedProducts(
    productId: number,
    limit: number = 6,
  ): Promise<Product[]> {
    // Get the product's categories
    const product = await this.findUnique({ id: productId });
    if (!product) return [];

    const productWithCategories = await this.model.findUnique({
      where: { id: productId },
      include: { categories: true },
    });

    if (!productWithCategories?.categories.length) return [];

    const categoryIds = productWithCategories.categories.map((cat) => cat.id);

    return this.model.findMany({
      where: {
        deletedAt: null,
        id: { not: productId },
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      },
      include: {
        brand: {
          include: { translations: true },
        },
        translations: true,
        skus: {
          where: { deletedAt: null },
          select: { id: true, price: true, stock: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

## 3. Product Translation Repository

```typescript
// src/products/repositories/product-translation.repository.ts
import { Injectable } from '@nestjs/common';
import { ProductTranslation } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductTranslationRepository extends BaseRepository<ProductTranslation> {
  protected modelName = 'productTranslation';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByProductAndLanguage(
    productId: number,
    languageId: number,
  ): Promise<ProductTranslation | null> {
    return this.findFirst({ productId, languageId });
  }

  async findByProduct(productId: number): Promise<ProductTranslation[]> {
    return this.findMany({
      where: { productId },
      include: { language: true },
    });
  }

  async createOrUpdate(data: {
    productId: number;
    languageId: number;
    name: string;
    description: string;
    createdById?: number;
  }): Promise<ProductTranslation> {
    const existing = await this.findByProductAndLanguage(
      data.productId,
      data.languageId,
    );

    if (existing) {
      return this.update({ id: existing.id }, {
        name: data.name,
        description: data.description,
        updatedById: data.createdById,
      } as any);
    }

    return this.create(data as any);
  }
}
```

## 4. Update Repository Module

```typescript
// src/shared/repositories/repository.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRepository } from '../../users/repositories/user.repository';
import { RoleRepository } from '../../users/repositories/role.repository';
import { VerificationCodeRepository } from '../../auth/repositories/verification-code.repository';
import { ProductRepository } from '../../products/repositories/product.repository';
import { ProductTranslationRepository } from '../../products/repositories/product-translation.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    UserRepository,
    RoleRepository,
    VerificationCodeRepository,
    ProductRepository,
    ProductTranslationRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    VerificationCodeRepository,
    ProductRepository,
    ProductTranslationRepository,
  ],
})
export class RepositoryModule {}
```

## 5. Products Service sử dụng Repository

```typescript
// src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductRepository } from './repositories/product.repository';
import { ProductTranslationRepository } from './repositories/product-translation.repository';
import { ResourceException } from '../shared/exceptions';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productTranslationRepository: ProductTranslationRepository,
  ) {}

  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    brandIds?: number[];
    categoryIds?: number[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return this.productRepository.getProductsWithPagination({
      page: params.page,
      limit: params.limit,
      search: params.search,
      filters: {
        brandIds: params.brandIds,
        categoryIds: params.categoryIds,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        inStock: true,
      },
      sortBy: params.sortBy as any,
      sortOrder: params.sortOrder,
    });
  }

  async getProductDetail(id: number, languageId?: number) {
    const product = await this.productRepository.findWithTranslations(
      id,
      languageId,
    );
    if (!product) {
      throw ResourceException.notFound('Product');
    }
    return product;
  }

  async searchProducts(query: string, filters?: any) {
    return this.productRepository.searchProducts(query, filters);
  }

  async getTopRatedProducts(limit?: number) {
    return this.productRepository.getTopRatedProducts(limit);
  }

  async getRelatedProducts(productId: number, limit?: number) {
    return this.productRepository.getRelatedProducts(productId, limit);
  }

  async createProduct(data: {
    base_price: number;
    virtual_price: number;
    brandId: number;
    images: string[];
    categoryIds: number[];
    translations: Array<{
      languageId: number;
      name: string;
      description: string;
    }>;
    createdById?: number;
  }) {
    // This would typically be wrapped in a transaction
    const product = await this.productRepository.create({
      base_price: data.base_price,
      virtual_price: data.virtual_price,
      brandId: data.brandId,
      images: data.images,
      createdById: data.createdById,
    } as any);

    // Create translations
    for (const translation of data.translations) {
      await this.productTranslationRepository.create({
        productId: product.id,
        languageId: translation.languageId,
        name: translation.name,
        description: translation.description,
        createdById: data.createdById,
      } as any);
    }

    // Connect categories (would need to be done via Prisma directly or extend repository)
    // This demonstrates that some operations might still need direct Prisma access

    return this.getProductDetail(product.id);
  }
}
```

## 6. Products Module

```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RepositoryModule } from '../shared/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

Ví dụ này minh họa cách Repository Pattern có thể scale để handle các entities phức tạp với nhiều relations và business logic đa dạng.
