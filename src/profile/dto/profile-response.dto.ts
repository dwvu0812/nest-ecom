export class ProfileResponseDto {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  is2FAEnabled: boolean;
  emailVerifiedAt?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  // Role information
  role: {
    id: number;
    name: string;
    description: string;
  };

  // Translations for multi-language support
  translations?: {
    languageId: number;
    languageCode: string;
    address?: string;
    description?: string;
  }[];

  constructor(partial: Partial<ProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
