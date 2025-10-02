import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryTranslationRepository } from './repositories/category-translation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ResourceException } from '../shared/exceptions';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryTranslationRepository: CategoryTranslationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    parentId?: number | null;
    languageId?: number;
  }) {
    return this.categoryRepository.getCategoriesWithPagination(params);
  }

  async getCategoryTree(languageId?: number) {
    return this.categoryRepository.getCategoryTree(languageId);
  }

  async getCategoryById(id: number, languageId?: number) {
    const category = await this.categoryRepository.findWithTranslations(
      id,
      languageId,
    );

    if (!category) {
      throw ResourceException.notFound('Category', id.toString());
    }

    return category;
  }

  async getCategoryWithChildren(id: number, languageId?: number) {
    const category = await this.categoryRepository.findWithChildren(
      id,
      languageId,
    );

    if (!category) {
      throw ResourceException.notFound('Category', id.toString());
    }

    return category;
  }

  async getCategoriesByParent(parentId: number | null, languageId?: number) {
    return this.categoryRepository.findByParent(parentId, languageId);
  }

  async searchCategories(query: string, languageId?: number) {
    return this.categoryRepository.searchCategories(query, languageId);
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    // If parent category is specified, check if it exists
    if (createCategoryDto.parentCategoryId) {
      const parentCategory = await this.categoryRepository.findUnique({
        id: createCategoryDto.parentCategoryId,
      });
      if (!parentCategory) {
        throw ResourceException.notFound(
          'Parent category',
          createCategoryDto.parentCategoryId.toString(),
        );
      }
    }

    return this.prisma.$transaction(async () => {
      // Create the category
      const category = await this.categoryRepository.create({
        parentCategoryId: createCategoryDto.parentCategoryId || null,
        createdById: createCategoryDto.createdById,
        updatedById: createCategoryDto.createdById,
      } as any);

      // Create translations
      for (const translation of createCategoryDto.translations) {
        await this.categoryTranslationRepository.create({
          categoryId: category.id,
          languageId: translation.languageId,
          name: translation.name,
          description: translation.description,
          createdById: createCategoryDto.createdById,
          updatedById: createCategoryDto.createdById,
        } as any);
      }

      return category;
    });
  }

  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Check if category exists
    const existingCategory = await this.categoryRepository.findUnique({ id });
    if (!existingCategory) {
      throw ResourceException.notFound('Category', id.toString());
    }

    // If parent category is being updated, validate it
    if (updateCategoryDto.parentCategoryId !== undefined) {
      // Prevent setting self as parent
      if (updateCategoryDto.parentCategoryId === id) {
        throw ResourceException.validationError(
          'Invalid parent category',
          'Category cannot be its own parent',
        );
      }

      // If parent is specified, check if it exists
      if (updateCategoryDto.parentCategoryId !== null) {
        const parentCategory = await this.categoryRepository.findUnique({
          id: updateCategoryDto.parentCategoryId,
        });
        if (!parentCategory) {
          throw ResourceException.notFound(
            'Parent category',
            updateCategoryDto.parentCategoryId.toString(),
          );
        }

        // Check for circular reference (parent cannot be a child of current category)
        const isCircular = await this.checkCircularReference(
          id,
          updateCategoryDto.parentCategoryId,
        );
        if (isCircular) {
          throw ResourceException.validationError(
            'Invalid parent category',
            'Circular reference detected in category hierarchy',
          );
        }
      }
    }

    return this.prisma.$transaction(async () => {
      // Update category basic info
      const updateData: any = {
        updatedById: updateCategoryDto.updatedById,
      };

      if (updateCategoryDto.parentCategoryId !== undefined) {
        updateData.parentCategoryId = updateCategoryDto.parentCategoryId;
      }

      const category = await this.categoryRepository.update({ id }, updateData);

      // Update translations if provided
      if (updateCategoryDto.translations?.length) {
        for (const translation of updateCategoryDto.translations) {
          await this.categoryTranslationRepository.createOrUpdate({
            categoryId: id,
            languageId: translation.languageId,
            name: translation.name,
            description: translation.description,
            updatedById: updateCategoryDto.updatedById,
          });
        }
      }

      return category;
    });
  }

  async deleteCategory(id: number, deletedBy?: number): Promise<Category> {
    const category = await this.categoryRepository.findUnique({ id });
    if (!category) {
      throw ResourceException.notFound('Category', id.toString());
    }

    // Check if category has child categories
    const categoryWithCount =
      await this.categoryRepository.findWithTranslations(id);
    if (
      categoryWithCount?._count?.childCategories &&
      categoryWithCount._count.childCategories > 0
    ) {
      throw ResourceException.validationError(
        'Cannot delete category',
        `Category has ${categoryWithCount._count.childCategories} child categories`,
      );
    }

    // Check if category has products
    if (
      categoryWithCount?._count?.products &&
      categoryWithCount._count.products > 0
    ) {
      throw ResourceException.validationError(
        'Cannot delete category',
        `Category has ${categoryWithCount._count.products} products associated with it`,
      );
    }

    return this.prisma.$transaction(async () => {
      // Soft delete all translations
      await this.categoryTranslationRepository.deleteByCategory(id, deletedBy);

      // Soft delete the category
      return this.categoryRepository.softDelete({ id }, deletedBy);
    });
  }

  async restoreCategory(id: number): Promise<Category> {
    const category = await this.categoryRepository.findUnique({ id });
    if (!category) {
      throw ResourceException.notFound('Category', id.toString());
    }

    return this.categoryRepository.restore({ id });
  }

  async getCategoryStatistics() {
    return this.categoryRepository.getCategoryStatistics();
  }

  // Helper method to check for circular references
  private async checkCircularReference(
    categoryId: number,
    proposedParentId: number,
  ): Promise<boolean> {
    let currentParentId: number | null = proposedParentId;

    while (currentParentId !== null) {
      if (currentParentId === categoryId) {
        return true; // Circular reference detected
      }

      const parent = await this.categoryRepository.findUnique({
        id: currentParentId,
      });

      if (!parent) break;

      currentParentId = parent.parentCategoryId;
    }

    return false;
  }
}
