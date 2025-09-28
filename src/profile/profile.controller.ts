import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ProfileService } from './profile.service';
import {
  ProfileResponseDto,
  UpdateProfileDto,
  ChangePasswordDto,
  CreateProfileTranslationDto,
  UpdateProfileTranslationDto,
  ProfileTranslationResponseDto,
} from './dto';
import { avatarUploadConfig } from './config/upload.config';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // =============================================================================
  // Profile Management
  // =============================================================================

  @Get()
  async getProfile(@CurrentUser() user: User): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateData: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(user.id, updateData, user.id);
  }

  @Put('password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordData: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.profileService.changePassword(user.id, changePasswordData);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadConfig))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No avatar file uploaded');
    }

    // Generate avatar URL (adjust path as needed for your setup)
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    return this.profileService.updateAvatar(user.id, avatarUrl);
  }

  // =============================================================================
  // Profile Translations
  // =============================================================================

  @Get('translations')
  async getProfileTranslations(
    @CurrentUser() user: User,
  ): Promise<ProfileTranslationResponseDto[]> {
    return this.profileService.getProfileTranslations(user.id);
  }

  @Post('translations')
  async createProfileTranslation(
    @CurrentUser() user: User,
    @Body() data: CreateProfileTranslationDto,
  ): Promise<ProfileTranslationResponseDto> {
    return this.profileService.createProfileTranslation(user.id, data, user.id);
  }

  @Put('translations/:id')
  async updateProfileTranslation(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) translationId: number,
    @Body() data: UpdateProfileTranslationDto,
  ): Promise<ProfileTranslationResponseDto> {
    return this.profileService.updateProfileTranslation(
      user.id,
      translationId,
      data,
      user.id,
    );
  }

  @Delete('translations/:id')
  async deleteProfileTranslation(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) translationId: number,
  ): Promise<{ message: string }> {
    return this.profileService.deleteProfileTranslation(
      user.id,
      translationId,
      user.id,
    );
  }

  // =============================================================================
  // 2FA Management
  // =============================================================================

  @Post('2fa/enable')
  async enable2FA(
    @CurrentUser() user: User,
  ): Promise<{ message: string; qrCodeUrl?: string }> {
    return this.profileService.enable2FA(user.id);
  }

  @Post('2fa/disable')
  async disable2FA(@CurrentUser() user: User): Promise<{ message: string }> {
    return this.profileService.disable2FA(user.id);
  }
}
