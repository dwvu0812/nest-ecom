import { Injectable } from '@nestjs/common';
import { Brand } from '@prisma/client';
import { BrandRepository } from './repositories/brand.repository';
import { BrandTranslationRepository } from './repositories/brand-translation.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ResourceException } from '../shared/exceptions';
import { CreateBrandDto, UpdateBrandDto } from './dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly brandTranslationRepository: BrandTranslationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getBrands(params: {
    page?: number;
    limit?: number;
    search?: string;
    languageId?: number;
  }) {
    return this.brandRepository.getBrandsWithPagination(params);
  }

  async getAllBrands(languageId?: number) {
    return this.brandRepository.findAllActive(languageId);
  }

  async getBrandById(id: number, languageId?: number) {
    const brand = await this.brandRepository.findWithTranslations(
      id,
      languageId,
    );

    if (!brand) {
      throw ResourceException.notFound('Brand', id.toString());
    }

    return brand;
  }

  async searchBrands(query: string, languageId?: number) {
    return this.brandRepository.searchBrands(query, languageId);
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<Brand> {
    return this.prisma.$transaction(async () => {
      // Create the brand
      const brand = await this.brandRepository.create({
        logo: createBrandDto.logo,
        createdById: createBrandDto.createdById,
        updatedById: createBrandDto.createdById,
      } as any);

      // Create translations
      for (const translation of createBrandDto.translations) {
        await this.brandTranslationRepository.create({
          brandId: brand.id,
          languageId: translation.languageId,
          name: translation.name,
          description: translation.description,
          createdById: createBrandDto.createdById,
          updatedById: createBrandDto.createdById,
        } as any);
      }

      return brand;
    });
  }

  async updateBrand(
    id: number,
    updateBrandDto: UpdateBrandDto,
  ): Promise<Brand> {
    // Check if brand exists
    const existingBrand = await this.brandRepository.findUnique({ id });
    if (!existingBrand) {
      throw ResourceException.notFound('Brand', id.toString());
    }

    return this.prisma.$transaction(async () => {
      // Update brand basic info
      const updateData: any = {
        updatedById: updateBrandDto.updatedById,
      };

      if (updateBrandDto.logo !== undefined) {
        updateData.logo = updateBrandDto.logo;
      }

      const brand = await this.brandRepository.update({ id }, updateData);

      // Update translations if provided
      if (updateBrandDto.translations?.length) {
        for (const translation of updateBrandDto.translations) {
          await this.brandTranslationRepository.createOrUpdate({
            brandId: id,
            languageId: translation.languageId,
            name: translation.name,
            description: translation.description,
            updatedById: updateBrandDto.updatedById,
          });
        }
      }

      return brand;
    });
  }

  async deleteBrand(id: number, deletedBy?: number): Promise<Brand> {
    const brand = await this.brandRepository.findUnique({ id });
    if (!brand) {
      throw ResourceException.notFound('Brand', id.toString());
    }

    // Check if brand has products
    const brandWithCount = await this.brandRepository.findWithTranslations(id);
    if (brandWithCount?._count?.products && brandWithCount._count.products > 0) {
      throw ResourceException.validationError(
        'Cannot delete brand',
        `Brand has ${brandWithCount._count.products} products associated with it`,
      );
    }

    return this.prisma.$transaction(async () => {
      // Soft delete all translations
      await this.brandTranslationRepository.deleteByBrand(id, deletedBy);

      // Soft delete the brand
      return this.brandRepository.softDelete({ id }, deletedBy);
    });
  }

  async restoreBrand(id: number): Promise<Brand> {
    const brand = await this.brandRepository.findUnique({ id });
    if (!brand) {
      throw ResourceException.notFound('Brand', id.toString());
    }

    return this.brandRepository.restore({ id });
  }

  async getBrandStatistics() {
    return this.brandRepository.getBrandStatistics();
  }
}
