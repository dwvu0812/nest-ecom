import {
  IsOptional,
  IsNumber,
  IsString,
  IsArray,
  Min,
  IsInt,
  IsNotEmpty,
} from 'class-validator';

export class UpdateSKUDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  variantOptionIds?: number[];

  @IsOptional()
  @IsInt()
  updatedById?: number;
}

export class UpdateStockDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  operation?: 'increment' | 'decrement';
}
