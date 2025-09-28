import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProfileDto {
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
  @IsPhoneNumber('VN') // Assuming Vietnamese phone numbers
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}
