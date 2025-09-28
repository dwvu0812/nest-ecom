import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListUsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  roleId?: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'BLOCKED'])
  status?: 'ACTIVE' | 'BLOCKED';

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeDeleted?: boolean = false;
}
