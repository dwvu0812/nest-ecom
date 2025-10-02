import { Injectable } from '@nestjs/common';
import { Product } from '@prisma/client';
import { ProductRepository } from './repositories/product.repository';
import { ProductTranslationRepository } from './repositories/product-translation.repository';
import { SKURepository } from './repositories/sku.repository';
import { VariantRepository, VariantOptionRepository } from './repositories/variant.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ResourceException } from '../shared/exceptions';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  CreateSKUDto,
  UpdateSKUDto,
} from './dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productTranslationRepository: ProductTranslationRepository,
    private readonly skuRepository: SKURepository,
    private readonly variantRepository: VariantRepository,
    private readonly variantOptionRepository: VariantOptionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getProducts(query: ProductQueryDto) {
    const filters = {
      brandIds: query.getParsedBrandIds(),
      categoryIds: query.getParsedCategoryIds(),
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      inStock: query.getInStockBoolean(),
    };

    return this.productRepository.getProductsWithPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      filters,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      languageId: query.languageId,
    });
  }

  async getProductById(id: number, languageId?: number) {
    const product = await this.productRepository.findWithTranslations(
      id,
      languageId,
    );

    if (!product) {
      throw ResourceException.notFound('Product', id.toString());
    }

    return product;
  }

  async searchProducts(query: string, filters?: any) {
    return this.productRepository.searchProducts(query, filters);
  }

  async getTopRatedProducts(limit?: number, languageId?: number) {
    return this.productRepository.getTopRatedProducts(limit, languageId);
  }

  async getRelatedProducts(
    productId: number,
    limit?: number,
    languageId?: number,
  ) {
    return this.productRepository.getRelatedProducts(
      productId,
      limit,
      languageId,
    );
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    // Use Prisma transaction for complex operations
    return this.prisma.$transaction(async (tx) => {
      // Create the product
      const product = await this.productRepository.create({
        base_price: createProductDto.base_price,
        virtual_price: createProductDto.virtual_price,
        brandId: createProductDto.brandId,
        images: createProductDto.images || [],
        createdById: createProductDto.createdById,
        updatedById: createProductDto.createdById,
      } as any);

      // Create translations
      for (const translation of createProductDto.translations) {
        await this.productTranslationRepository.create({
          productId: product.id,
          languageId: translation.languageId,
          name: translation.name,
          description: translation.description,
          createdById: createProductDto.createdById,
          updatedById: createProductDto.createdById,
        } as any);
      }

      // Connect categories
      if (createProductDto.categoryIds?.length) {
        await tx.product.update({
          where: { id: product.id },
          data: {
            categories: {
              connect: createProductDto.categoryIds.map((id) => ({ id })),
            },
          },
        });
      }

      // Create variants and options if provided
      if (createProductDto.variants?.length) {
        for (const variantDto of createProductDto.variants) {
          const variant = await this.variantRepository.create({
            productId: product.id,
            name: variantDto.name,
            createdById: createProductDto.createdById,
            updatedById: createProductDto.createdById,
          } as any);

          // Create variant options
          for (const optionDto of variantDto.options) {
            await this.variantOptionRepository.create({
              variantId: variant.id,
              value: optionDto.value,
              createdById: createProductDto.createdById,
              updatedById: createProductDto.createdById,
            } as any);
          }
        }
      }

      // Create SKUs if provided
      if (createProductDto.skus?.length) {
        for (const skuDto of createProductDto.skus) {
          const sku = await this.skuRepository.create({
            productId: product.id,
            value: skuDto.value,
            price: skuDto.price,
            stock: skuDto.stock,
            images: skuDto.images || [],
            createdById: createProductDto.createdById,
            updatedById: createProductDto.createdById,
          } as any);

          // Connect variant options to SKU if provided
          if (skuDto.variantOptionIds?.length) {
            await tx.sKU.update({
              where: { id: sku.id },
              data: {
                variantOptions: {
                  connect: skuDto.variantOptionIds.map((id) => ({ id })),
                },
              },
            });
          }
        }
      }

      return product;
    });
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // Check if product exists
    const existingProduct = await this.productRepository.findUnique({ id });
    if (!existingProduct) {
      throw ResourceException.notFound('Product', id.toString());
    }

    return this.prisma.$transaction(async (tx) => {
      // Update product basic info
      const updateData: any = {
        updatedById: updateProductDto.updatedById,
      };

      if (updateProductDto.base_price !== undefined)
        updateData.base_price = updateProductDto.base_price;
      if (updateProductDto.virtual_price !== undefined)
        updateData.virtual_price = updateProductDto.virtual_price;
      if (updateProductDto.brandId !== undefined)
        updateData.brandId = updateProductDto.brandId;
      if (updateProductDto.images !== undefined)
        updateData.images = updateProductDto.images;

      const product = await this.productRepository.update({ id }, updateData);

      // Update categories if provided
      if (updateProductDto.categoryIds !== undefined) {
        // Disconnect all existing categories first
        await tx.product.update({
          where: { id },
          data: {
            categories: {
              set: [],
            },
          },
        });

        // Connect new categories
        if (updateProductDto.categoryIds.length > 0) {
          await tx.product.update({
            where: { id },
            data: {
              categories: {
                connect: updateProductDto.categoryIds.map((catId) => ({
                  id: catId,
                })),
              },
            },
          });
        }
      }

      // Update translations if provided
      if (updateProductDto.translations?.length) {
        for (const translation of updateProductDto.translations) {
          await this.productTranslationRepository.createOrUpdate({
            productId: id,
            languageId: translation.languageId,
            name: translation.name,
            description: translation.description,
            updatedById: updateProductDto.updatedById,
          });
        }
      }

      return product;
    });
  }

  async deleteProduct(id: number, deletedBy?: number): Promise<Product> {
    const product = await this.productRepository.findUnique({ id });
    if (!product) {
      throw ResourceException.notFound('Product', id.toString());
    }

    return this.prisma.$transaction(async () => {
      // Soft delete all related entities
      await this.productTranslationRepository.deleteByProduct(id, deletedBy);
      await this.skuRepository.deleteByProduct(id, deletedBy);
      await this.variantRepository.deleteByProduct(id, deletedBy);

      // Soft delete the product
      return this.productRepository.softDelete({ id }, deletedBy);
    });
  }

  async restoreProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findUnique({ id });
    if (!product) {
      throw ResourceException.notFound('Product', id.toString());
    }

    return this.productRepository.restore({ id });
  }

  // SKU Management
  async createSKU(createSKUDto: CreateSKUDto) {
    // Verify product exists
    const product = await this.productRepository.findUnique({
      id: createSKUDto.productId,
    });
    if (!product) {
      throw ResourceException.notFound(
        'Product',
        createSKUDto.productId.toString(),
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const sku = await this.skuRepository.create({
        productId: createSKUDto.productId,
        value: createSKUDto.value,
        price: createSKUDto.price,
        stock: createSKUDto.stock,
        images: createSKUDto.images || [],
        createdById: createSKUDto.createdById,
        updatedById: createSKUDto.createdById,
      } as any);

      // Connect variant options if provided
      if (createSKUDto.variantOptionIds?.length) {
        await tx.sKU.update({
          where: { id: sku.id },
          data: {
            variantOptions: {
              connect: createSKUDto.variantOptionIds.map((id) => ({ id })),
            },
          },
        });
      }

      return sku;
    });
  }

  async updateSKU(id: number, updateSKUDto: UpdateSKUDto) {
    const sku = await this.skuRepository.findUnique({ id });
    if (!sku) {
      throw ResourceException.notFound('SKU', id.toString());
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = {
        updatedById: updateSKUDto.updatedById,
      };

      if (updateSKUDto.value !== undefined) updateData.value = updateSKUDto.value;
      if (updateSKUDto.price !== undefined) updateData.price = updateSKUDto.price;
      if (updateSKUDto.stock !== undefined) updateData.stock = updateSKUDto.stock;
      if (updateSKUDto.images !== undefined) updateData.images = updateSKUDto.images;

      const updatedSKU = await this.skuRepository.update({ id }, updateData);

      // Update variant options if provided
      if (updateSKUDto.variantOptionIds !== undefined) {
        // Disconnect all existing variant options
        await tx.sKU.update({
          where: { id },
          data: {
            variantOptions: {
              set: [],
            },
          },
        });

        // Connect new variant options
        if (updateSKUDto.variantOptionIds.length > 0) {
          await tx.sKU.update({
            where: { id },
            data: {
              variantOptions: {
                connect: updateSKUDto.variantOptionIds.map((optionId) => ({
                  id: optionId,
                })),
              },
            },
          });
        }
      }

      return updatedSKU;
    });
  }

  async deleteSKU(id: number, deletedBy?: number) {
    const sku = await this.skuRepository.findUnique({ id });
    if (!sku) {
      throw ResourceException.notFound('SKU', id.toString());
    }

    return this.skuRepository.softDelete({ id }, deletedBy);
  }

  async updateStock(
    skuId: number,
    quantity: number,
    operation: 'increment' | 'decrement' = 'decrement',
  ) {
    const sku = await this.skuRepository.findUnique({ id: skuId });
    if (!sku) {
      throw ResourceException.notFound('SKU', skuId.toString());
    }

    if (operation === 'decrement' && sku.stock < quantity) {
      throw ResourceException.validationError(
        'Insufficient stock',
        `Only ${sku.stock} items available`,
      );
    }

    return this.skuRepository.updateStock(skuId, quantity, operation);
  }

  async getProductStatistics() {
    return this.productRepository.getProductStatistics();
  }

  async getLowStockSKUs(threshold: number = 10) {
    return this.skuRepository.getLowStockSKUs(threshold);
  }

  async getOutOfStockSKUs() {
    return this.skuRepository.getOutOfStockSKUs();
  }
}
