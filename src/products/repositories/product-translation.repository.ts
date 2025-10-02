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
    return this.findFirst({ productId, languageId } as any);
  }

  async findByProduct(productId: number): Promise<ProductTranslation[]> {
    return this.findMany({
      where: { productId },
      include: { language: true },
    } as any);
  }

  async createOrUpdate(data: {
    productId: number;
    languageId: number;
    name: string;
    description: string;
    createdById?: number;
    updatedById?: number;
  }): Promise<ProductTranslation> {
    const existing = await this.findByProductAndLanguage(
      data.productId,
      data.languageId,
    );

    if (existing) {
      return this.update(
        { id: existing.id },
        {
          name: data.name,
          description: data.description,
          updatedById: data.updatedById || data.createdById,
        } as any,
      );
    }

    return this.create({
      productId: data.productId,
      languageId: data.languageId,
      name: data.name,
      description: data.description,
      createdById: data.createdById,
      updatedById: data.createdById,
    } as any);
  }

  async deleteByProduct(productId: number, deletedBy?: number): Promise<void> {
    const translations = await this.findByProduct(productId);

    for (const translation of translations) {
      await this.softDelete({ id: translation.id }, deletedBy);
    }
  }
}
