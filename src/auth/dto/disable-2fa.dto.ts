import { IsString, MinLength, Length } from 'class-validator';

export class Disable2FADto {
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @Length(6, 6, { message: 'TOTP code phải có 6 chữ số' })
  code: string;
}
