import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repositories/user.repository';
import { UserTranslationRepository } from './repositories/user-translation.repository';
import { LanguagesService } from '../languages/languages.service';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcryptjs';
import {
  ProfileResponseDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateProfileTranslationDto,
  UpdateProfileTranslationDto,
  ProfileTranslationResponseDto,
} from './dto';
import { ProfileExceptions } from './exceptions/profile.exceptions';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userTranslationRepository: UserTranslationRepository,
    private readonly languagesService: LanguagesService,
    private readonly authService: AuthService,
  ) {}

  async getProfile(userId: number): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findByIdWithTranslations(userId);

    if (!user) {
      throw ProfileExceptions.profileNotFound();
    }

    return new ProfileResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar || undefined,
      is2FAEnabled: user.is2FAEnabled,
      emailVerifiedAt: user.emailVerifiedAt || undefined,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      translations: user.userTranslations?.map((translation) => ({
        languageId: translation.languageId,
        languageCode: translation.language?.code || '',
        address: translation.address || undefined,
        description: translation.description || undefined,
      })),
    });
  }

  async updateProfile(
    userId: number,
    updateData: UpdateProfileDto,
    updatedById?: number,
  ): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findUnique({ id: userId });
    if (!existingUser) {
      throw ProfileExceptions.profileNotFound();
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingUser.email) {
      const existingEmailUser = await this.userRepository.findByEmail(
        updateData.email,
      );
      if (existingEmailUser) {
        throw ProfileExceptions.emailAlreadyExists(updateData.email);
      }
    }

    // Update user profile
    await this.userRepository.updateProfile(userId, updateData, updatedById);

    // Return updated profile
    return this.getProfile(userId);
  }

  async changePassword(
    userId: number,
    changePasswordData: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } =
      changePasswordData;

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      throw ProfileExceptions.passwordMismatch();
    }

    // Get user with current password
    const user = await this.userRepository.findUnique({ id: userId });
    if (!user) {
      throw ProfileExceptions.profileNotFound();
    }

    if (!user.password) {
      throw ProfileExceptions.noPasswordSet();
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw ProfileExceptions.invalidCurrentPassword();
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await this.userRepository.updatePassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully' };
  }

  async updateAvatar(
    userId: number,
    avatarUrl: string,
  ): Promise<ProfileResponseDto> {
    // Check if user exists
    const existingUser = await this.userRepository.findUnique({ id: userId });
    if (!existingUser) {
      throw ProfileExceptions.profileNotFound();
    }

    // Update avatar
    await this.userRepository.updateAvatar(userId, avatarUrl);

    // Return updated profile
    return this.getProfile(userId);
  }

  // =============================================================================
  // Profile Translation Methods
  // =============================================================================

  async getProfileTranslations(
    userId: number,
  ): Promise<ProfileTranslationResponseDto[]> {
    const translations =
      await this.userTranslationRepository.findAllByUserId(userId);

    return translations.map(
      (translation) =>
        new ProfileTranslationResponseDto({
          id: translation.id,
          userId: translation.userId,
          languageId: translation.languageId,
          languageCode: translation.language?.code || '',
          languageName: translation.language?.name || '',
          address: translation.address || undefined,
          description: translation.description || undefined,
          createdAt: translation.createdAt,
          updatedAt: translation.updatedAt,
        }),
    );
  }

  async createProfileTranslation(
    userId: number,
    data: CreateProfileTranslationDto,
    createdById?: number,
  ): Promise<ProfileTranslationResponseDto> {
    // Check if user exists
    const user = await this.userRepository.findUnique({ id: userId });
    if (!user) {
      throw ProfileExceptions.profileNotFound();
    }

    // Check if language exists
    const language = await this.languagesService.findById(data.languageId);
    if (!language) {
      throw ProfileExceptions.languageNotFound();
    }

    // Check if translation already exists for this language
    const existingTranslation =
      await this.userTranslationRepository.findByUserIdAndLanguageId(
        userId,
        data.languageId,
      );
    if (existingTranslation) {
      throw ProfileExceptions.translationAlreadyExists(language.code);
    }

    // Create translation
    const translation = await this.userTranslationRepository.createTranslation({
      userId,
      languageId: data.languageId,
      address: data.address,
      description: data.description,
      createdById,
    });

    return new ProfileTranslationResponseDto({
      id: translation.id,
      userId: translation.userId,
      languageId: translation.languageId,
      languageCode: translation.language?.code || '',
      languageName: translation.language?.name || '',
      address: translation.address || undefined,
      description: translation.description || undefined,
      createdAt: translation.createdAt,
      updatedAt: translation.updatedAt,
    });
  }

  async updateProfileTranslation(
    userId: number,
    translationId: number,
    data: UpdateProfileTranslationDto,
    updatedById?: number,
  ): Promise<ProfileTranslationResponseDto> {
    // Check if translation exists and belongs to user
    const existingTranslation =
      await this.userTranslationRepository.findByUserIdAndLanguageId(
        userId,
        translationId,
      );
    if (!existingTranslation) {
      throw ProfileExceptions.translationNotFound();
    }

    // Update translation
    const updatedTranslation =
      await this.userTranslationRepository.updateTranslation(translationId, {
        address: data.address,
        description: data.description,
        updatedById,
      });

    return new ProfileTranslationResponseDto({
      id: updatedTranslation.id,
      userId: updatedTranslation.userId,
      languageId: updatedTranslation.languageId,
      languageCode: updatedTranslation.language?.code || '',
      languageName: updatedTranslation.language?.name || '',
      address: updatedTranslation.address || undefined,
      description: updatedTranslation.description || undefined,
      createdAt: updatedTranslation.createdAt,
      updatedAt: updatedTranslation.updatedAt,
    });
  }

  async deleteProfileTranslation(
    userId: number,
    translationId: number,
    deletedById?: number,
  ): Promise<{ message: string }> {
    // Check if translation exists and belongs to user
    const existingTranslation =
      await this.userTranslationRepository.findByUserIdAndLanguageId(
        userId,
        translationId,
      );
    if (!existingTranslation) {
      throw ProfileExceptions.translationNotFound();
    }

    // Delete translation
    await this.userTranslationRepository.deleteTranslation(
      translationId,
      deletedById,
    );

    return { message: 'Profile translation deleted successfully' };
  }

  // =============================================================================
  // 2FA Methods
  // =============================================================================

  async enable2FA(
    userId: number,
  ): Promise<{ message: string; qrCodeUrl?: string }> {
    // This will be implemented when we integrate with existing 2FA system
    // For now, just enable it
    await this.userRepository.enable2FA(userId);

    return { message: '2FA enabled successfully' };
  }

  async disable2FA(userId: number): Promise<{ message: string }> {
    await this.userRepository.disable2FA(userId);

    return { message: '2FA disabled successfully' };
  }
}
