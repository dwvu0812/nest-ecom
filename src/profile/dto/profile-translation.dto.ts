import {
  IsNumber,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateProfileTranslationDto {
  @IsNumber()
  @IsNotEmpty()
  languageId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateProfileTranslationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ProfileTranslationResponseDto {
  id: number;
  userId: number;
  languageId: number;
  languageCode: string;
  languageName: string;
  address?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ProfileTranslationResponseDto>) {
    Object.assign(this, partial);
  }
}
