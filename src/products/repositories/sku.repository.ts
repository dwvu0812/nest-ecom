import { Injectable } from '@nestjs/common';
import { SKU } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface SKUWithRelations extends SKU {
  product?: any;
  variantOptions?: any[];
}

@Injectable()
export class SKURepository extends BaseRepository<SKU> {
  protected modelName = 'sKU';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByProduct(productId: number): Promise<SKUWithRelations[]> {
    return this.findMany({
      where: { productId },
      include: {
        variantOptions: {
          where: { deletedAt: null },
          include: {
            variant: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    } as any);
  }

  async findByIdWithDetails(id: number): Promise<SKUWithRelations | null> {
    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: {
        product: {
          include: {
            brand: {
              include: { translations: true },
            },
            translations: true,
          },
        },
        variantOptions: {
          where: { deletedAt: null },
          include: {
            variant: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });
  }

  async updateStock(
    skuId: number,
    quantity: number,
    operation: 'increment' | 'decrement' = 'decrement',
  ): Promise<SKU> {
    return this.model.update({
      where: { id: skuId, deletedAt: null },
      data: {
        stock: operation === 'increment' ? { increment: quantity } : { decrement: quantity },
        updatedAt: new Date(),
      },
    });
  }

  async checkAvailability(skuId: number, quantity: number): Promise<boolean> {
    const sku = await this.findUnique({ id: skuId });
    if (!sku || sku.deletedAt) return false;
    return sku.stock >= quantity;
  }

  async getLowStockSKUs(threshold: number = 10): Promise<SKUWithRelations[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
        stock: { lte: threshold, gt: 0 },
      },
      include: {
        product: {
          include: {
            brand: {
              include: { translations: true },
            },
            translations: true,
          },
        },
        variantOptions: {
          where: { deletedAt: null },
          include: {
            variant: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { stock: 'asc' },
    });
  }

  async getOutOfStockSKUs(): Promise<SKUWithRelations[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
        stock: 0,
      },
      include: {
        product: {
          include: {
            brand: {
              include: { translations: true },
            },
            translations: true,
          },
        },
        variantOptions: {
          where: { deletedAt: null },
          include: {
            variant: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getSKUStatistics(): Promise<{
    totalSKUs: number;
    inStockSKUs: number;
    lowStockSKUs: number;
    outOfStockSKUs: number;
    totalInventoryValue: number;
  }> {
    const [totalSKUs, inStockSKUs, lowStockSKUs, outOfStockSKUs] =
      await Promise.all([
        this.count({ deletedAt: null } as any),
        this.model.count({
          where: {
            deletedAt: null,
            stock: { gt: 10 },
          },
        }),
        this.model.count({
          where: {
            deletedAt: null,
            stock: { lte: 10, gt: 0 },
          },
        }),
        this.model.count({
          where: {
            deletedAt: null,
            stock: 0,
          },
        }),
      ]);

    // Calculate total inventory value
    const skus = await this.model.findMany({
      where: { deletedAt: null },
      select: { price: true, stock: true },
    });

    const totalInventoryValue = skus.reduce(
      (sum, sku) => sum + sku.price * sku.stock,
      0,
    );

    return {
      totalSKUs,
      inStockSKUs,
      lowStockSKUs,
      outOfStockSKUs,
      totalInventoryValue,
    };
  }

  async deleteByProduct(productId: number, deletedBy?: number): Promise<void> {
    const skus = await this.findByProduct(productId);

    for (const sku of skus) {
      await this.softDelete({ id: sku.id }, deletedBy);
    }
  }
}
