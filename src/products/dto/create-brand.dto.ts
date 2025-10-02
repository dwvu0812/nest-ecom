import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BrandTranslationDto {
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

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  logo: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BrandTranslationDto)
  translations: BrandTranslationDto[];

  @IsOptional()
  @IsInt()
  createdById?: number;
}
