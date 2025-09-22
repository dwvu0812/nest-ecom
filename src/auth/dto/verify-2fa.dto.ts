import { IsString, Length } from 'class-validator';

export class Verify2FADto {
  @IsString()
  @Length(6, 6, { message: 'TOTP code phải có 6 chữ số' })
  code: string;
}
