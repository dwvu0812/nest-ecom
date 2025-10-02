import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTranslationDto } from './create-product.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  virtual_price?: number;

  @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @IsOptional()
  @IsInt()
  updatedById?: number;
}
