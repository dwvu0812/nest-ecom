import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsOptional()
  @IsInt()
  roleId?: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'BLOCKED'])
  status?: 'ACTIVE' | 'BLOCKED';

  @IsOptional()
  @IsBoolean()
  is2FAEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  // Will be set automatically by the controller
  updatedById?: number;
}
