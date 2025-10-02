import { Injectable } from '@nestjs/common';
import { CategoryTranslation } from '@prisma/client';
import { BaseRepository } from '../../shared/repositories/base-repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoryTranslationRepository extends BaseRepository<CategoryTranslation> {
  protected modelName = 'categoryTranslation';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByCategoryAndLanguage(
    categoryId: number,
    languageId: number,
  ): Promise<CategoryTranslation | null> {
    return this.findFirst({ categoryId, languageId } as any);
  }

  async findByCategory(categoryId: number): Promise<CategoryTranslation[]> {
    return this.findMany({
      where: { categoryId },
      include: { language: true },
    } as any);
  }

  async createOrUpdate(data: {
    categoryId: number;
    languageId: number;
    name: string;
    description: string;
    createdById?: number;
    updatedById?: number;
  }): Promise<CategoryTranslation> {
    const existing = await this.findByCategoryAndLanguage(
      data.categoryId,
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
      categoryId: data.categoryId,
      languageId: data.languageId,
      name: data.name,
      description: data.description,
      createdById: data.createdById,
      updatedById: data.createdById,
    } as any);
  }

  async deleteByCategory(
    categoryId: number,
    deletedBy?: number,
  ): Promise<void> {
    const translations = await this.findByCategory(categoryId);

    for (const translation of translations) {
      await this.softDelete({ id: translation.id }, deletedBy);
    }
  }
}
