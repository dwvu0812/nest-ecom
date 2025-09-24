import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { HTTPMethod } from '@prisma/client';

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  path?: string;

  @IsEnum(HTTPMethod)
  @IsOptional()
  method?: HTTPMethod;

  @IsOptional()
  updatedById?: number;
}
