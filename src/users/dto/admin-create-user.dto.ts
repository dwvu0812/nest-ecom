import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean,
} from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  password: string;

  @IsPhoneNumber('VN')
  phoneNumber: string;

  @IsInt()
  @IsNotEmpty()
  roleId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  // Will be set automatically by the controller
  createdById?: number;
}
