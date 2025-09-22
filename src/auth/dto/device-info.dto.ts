import { IsIP, IsString, IsOptional } from 'class-validator';

export class DeviceInfoDto {
  @IsIP()
  ip!: string;

  @IsString()
  userAgent!: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
