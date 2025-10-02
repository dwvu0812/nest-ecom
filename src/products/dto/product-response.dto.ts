export class ProductTranslationResponseDto {
  id: number;
  languageId: number;
  name: string;
  description: string;
  language?: {
    id: number;
    name: string;
    code: string;
  };

  constructor(data: any) {
    this.id = data.id;
    this.languageId = data.languageId;
    this.name = data.name;
    this.description = data.description;
    if (data.language) {
      this.language = {
        id: data.language.id,
        name: data.language.name,
        code: data.language.code,
      };
    }
  }
}

export class SKUResponseDto {
  id: number;
  value: string;
  price: number;
  stock: number;
  images: string[];
  variantOptions?: any[];

  constructor(data: any) {
    this.id = data.id;
    this.value = data.value;
    this.price = data.price;
    this.stock = data.stock;
    this.images = data.images || [];
    this.variantOptions = data.variantOptions;
  }
}

export class BrandResponseDto {
  id: number;
  logo: string;
  translations?: any[];

  constructor(data: any) {
    this.id = data.id;
    this.logo = data.logo;
    this.translations = data.translations;
  }
}

export class CategoryResponseDto {
  id: number;
  parentCategoryId: number | null;
  translations?: any[];
  productCount?: number;

  constructor(data: any) {
    this.id = data.id;
    this.parentCategoryId = data.parentCategoryId;
    this.translations = data.translations;
    this.productCount = data._count?.products;
  }
}

export class ProductResponseDto {
  id: number;
  base_price: number;
  virtual_price: number;
  brandId: number;
  images: string[];
  brand?: BrandResponseDto;
  translations?: ProductTranslationResponseDto[];
  categories?: CategoryResponseDto[];
  skus?: SKUResponseDto[];
  variants?: any[];
  avgRating?: number;
  reviewCount?: number;
  totalStock?: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: number | null;
  updatedById?: number | null;

  constructor(data: any) {
    this.id = data.id;
    this.base_price = data.base_price;
    this.virtual_price = data.virtual_price;
    this.brandId = data.brandId;
    this.images = data.images || [];
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.createdById = data.createdById;
    this.updatedById = data.updatedById;

    if (data.brand) {
      this.brand = new BrandResponseDto(data.brand);
    }

    if (data.translations) {
      this.translations = data.translations.map(
        (t: any) => new ProductTranslationResponseDto(t),
      );
    }

    if (data.categories) {
      this.categories = data.categories.map(
        (c: any) => new CategoryResponseDto(c),
      );
    }

    if (data.skus) {
      this.skus = data.skus.map((s: any) => new SKUResponseDto(s));
    }

    if (data.variants) {
      this.variants = data.variants;
    }

    if (data.avgRating !== undefined) {
      this.avgRating = data.avgRating;
    }

    if (data.reviewCount !== undefined) {
      this.reviewCount = data.reviewCount;
    }

    if (data.totalStock !== undefined) {
      this.totalStock = data.totalStock;
    }
  }
}

export class ProductListResponseDto {
  data: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(data: any) {
    this.data = data.data.map((p: any) => new ProductResponseDto(p));
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.totalPages = data.totalPages;
  }
}
