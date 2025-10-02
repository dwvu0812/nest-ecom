import { IsOptional, IsString, IsInt, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  languageId?: number;

  @IsOptional()
  @IsString()
  brandIds?: string; // comma-separated IDs

  @IsOptional()
  @IsString()
  categoryIds?: string; // comma-separated IDs

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsEnum(['true', 'false'])
  inStock?: string;

  @IsOptional()
  @IsEnum(['name', 'price', 'rating', 'created'])
  sortBy?: 'name' | 'price' | 'rating' | 'created';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  // Helper methods to parse comma-separated IDs
  getParsedBrandIds(): number[] | undefined {
    if (!this.brandIds) return undefined;
    return this.brandIds.split(',').map((id) => parseInt(id.trim(), 10));
  }

  getParsedCategoryIds(): number[] | undefined {
    if (!this.categoryIds) return undefined;
    return this.categoryIds.split(',').map((id) => parseInt(id.trim(), 10));
  }

  getInStockBoolean(): boolean | undefined {
    if (!this.inStock) return undefined;
    return this.inStock === 'true';
  }
}
