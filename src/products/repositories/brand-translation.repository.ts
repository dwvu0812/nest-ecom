import { Injectable } from '@nestjs/common';
import { BrandTranslation } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BrandTranslationRepository extends BaseRepository<BrandTranslation> {
  protected modelName = 'brandTranslation';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByBrandAndLanguage(
    brandId: number,
    languageId: number,
  ): Promise<BrandTranslation | null> {
    return this.findFirst({ brandId, languageId } as any);
  }

  async findByBrand(brandId: number): Promise<BrandTranslation[]> {
    return this.findMany({
      where: { brandId },
      include: { language: true },
    } as any);
  }

  async createOrUpdate(data: {
    brandId: number;
    languageId: number;
    name: string;
    description: string;
    createdById?: number;
    updatedById?: number;
  }): Promise<BrandTranslation> {
    const existing = await this.findByBrandAndLanguage(
      data.brandId,
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
      brandId: data.brandId,
      languageId: data.languageId,
      name: data.name,
      description: data.description,
      createdById: data.createdById,
      updatedById: data.createdById,
    } as any);
  }

  async deleteByBrand(brandId: number, deletedBy?: number): Promise<void> {
    const translations = await this.findByBrand(brandId);

    for (const translation of translations) {
      await this.softDelete({ id: translation.id }, deletedBy);
    }
  }
}
