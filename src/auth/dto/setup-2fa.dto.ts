import { IsString, Length, IsOptional } from 'class-validator';

export class Setup2FADto {
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'TOTP code phải có 6 chữ số' })
  code?: string;
}
