import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';

// Controllers
import { ProductsController } from './products.controller';
import { BrandsController } from './brands.controller';
import { CategoriesController } from './categories.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminBrandsController } from './controllers/admin-brands.controller';
import { AdminCategoriesController } from './controllers/admin-categories.controller';

// Services
import { ProductsService } from './products.service';
import { BrandsService } from './brands.service';
import { CategoriesService } from './categories.service';

// Repositories
import { ProductRepository } from './repositories/product.repository';
import { ProductTranslationRepository } from './repositories/product-translation.repository';
import { BrandRepository } from './repositories/brand.repository';
import { BrandTranslationRepository } from './repositories/brand-translation.repository';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryTranslationRepository } from './repositories/category-translation.repository';
import { SKURepository } from './repositories/sku.repository';
import {
  VariantRepository,
  VariantOptionRepository,
} from './repositories/variant.repository';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [
    ProductsController,
    BrandsController,
    CategoriesController,
    AdminProductsController,
    AdminBrandsController,
    AdminCategoriesController,
  ],
  providers: [
    // Services
    ProductsService,
    BrandsService,
    CategoriesService,
    // Repositories
    ProductRepository,
    ProductTranslationRepository,
    BrandRepository,
    BrandTranslationRepository,
    CategoryRepository,
    CategoryTranslationRepository,
    SKURepository,
    VariantRepository,
    VariantOptionRepository,
  ],
  exports: [
    ProductsService,
    BrandsService,
    CategoriesService,
    ProductRepository,
    BrandRepository,
    CategoryRepository,
    SKURepository,
  ],
})
export class ProductsModule {}
