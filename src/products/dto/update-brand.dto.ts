import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BrandTranslationDto } from './create-brand.dto';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BrandTranslationDto)
  translations?: BrandTranslationDto[];

  @IsOptional()
  @IsInt()
  updatedById?: number;
}
