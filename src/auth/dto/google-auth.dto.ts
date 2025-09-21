import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}

export class GoogleAuthResponseDto {
  message!: string;
  user!: {
    id: number;
    email: string;
    name: string;
    role: any;
    avatar?: string;
  };
  accessToken!: string;
  refreshToken!: string;
}
