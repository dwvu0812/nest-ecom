import { Injectable } from '@nestjs/common';
import { Variant, VariantOption } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

export interface VariantWithOptions extends Variant {
  options?: VariantOption[];
}

@Injectable()
export class VariantRepository extends BaseRepository<Variant> {
  protected modelName = 'variant';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByProduct(productId: number): Promise<VariantWithOptions[]> {
    return this.findMany({
      where: { productId },
      include: {
        options: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    } as any);
  }

  async findWithOptions(id: number): Promise<VariantWithOptions | null> {
    return this.model.findUnique({
      where: { id, deletedAt: null },
      include: {
        options: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
        product: {
          include: {
            brand: true,
            translations: true,
          },
        },
      },
    });
  }

  async deleteByProduct(productId: number, deletedBy?: number): Promise<void> {
    const variants = await this.findByProduct(productId);

    for (const variant of variants) {
      // Delete all options first
      await this.prisma.variantOption.updateMany({
        where: {
          variantId: variant.id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date(),
          updatedById: deletedBy,
        },
      });

      // Then delete the variant
      await this.softDelete({ id: variant.id }, deletedBy);
    }
  }
}

@Injectable()
export class VariantOptionRepository extends BaseRepository<VariantOption> {
  protected modelName = 'variantOption';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByVariant(variantId: number): Promise<VariantOption[]> {
    return this.findMany({
      where: { variantId },
      orderBy: { createdAt: 'asc' },
    } as any);
  }

  async findByValue(
    variantId: number,
    value: string,
  ): Promise<VariantOption | null> {
    return this.findFirst({
      variantId,
      value,
    } as any);
  }

  async deleteByVariant(variantId: number, deletedBy?: number): Promise<void> {
    const options = await this.findByVariant(variantId);

    for (const option of options) {
      await this.softDelete({ id: option.id }, deletedBy);
    }
  }
}
