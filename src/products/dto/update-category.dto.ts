import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryTranslationDto } from './create-category.dto';

export class UpdateCategoryDto {
  @IsOptional()
  @IsInt()
  parentCategoryId?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  translations?: CategoryTranslationDto[];

  @IsOptional()
  @IsInt()
  updatedById?: number;
}
