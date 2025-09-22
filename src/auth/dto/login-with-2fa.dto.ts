import { IsString, Length } from 'class-validator';

export class LoginWith2FADto {
  @IsString()
  tempToken: string;

  @IsString()
  @Length(6, 6, { message: 'TOTP code phải có 6 chữ số' })
  code: string;
}
