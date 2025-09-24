import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLanguageDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: string;

  @IsOptional()
  updatedById?: number;
}
