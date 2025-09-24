import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { HTTPMethod } from '@prisma/client';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsEnum(HTTPMethod)
  @IsNotEmpty()
  method: HTTPMethod;

  @IsOptional()
  createdById?: number;
}
