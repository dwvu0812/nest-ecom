import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductTranslationDto {
  @IsNotEmpty()
  @IsInt()
  languageId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class VariantOptionDto {
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class VariantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  options: VariantOptionDto[];
}

export class SKUDto {
  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  variantOptionIds?: number[];
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  base_price: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  virtual_price: number;

  @IsNotEmpty()
  @IsInt()
  brandId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  categoryIds: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations: ProductTranslationDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SKUDto)
  skus?: SKUDto[];

  @IsOptional()
  @IsInt()
  createdById?: number;
}
