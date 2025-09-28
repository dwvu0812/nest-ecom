import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  UPLOAD_CATEGORIES,
  type UploadCategory,
} from '../constants/upload.constants';

export class UploadFileDto {
  @IsEnum(UPLOAD_CATEGORIES, {
    message:
      'Category must be one of: documents, images, videos, audio, general',
  })
  @IsOptional()
  category?: UploadCategory = UPLOAD_CATEGORIES.GENERAL;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  preserveOriginalName?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  generateThumbnail?: boolean = false;
}

export class MultipleUploadDto extends UploadFileDto {
  @IsNumber()
  @Min(1)
  @Max(20)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  maxFiles?: number = 10;
}

export class UploadQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(UPLOAD_CATEGORIES)
  @IsOptional()
  category?: UploadCategory;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}
