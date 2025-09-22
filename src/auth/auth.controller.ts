import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Disable2FADto } from './dto/disable-2fa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginWith2FADto } from './dto/login-with-2fa.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: any) {
    const deviceInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
    };
    return this.authService.login(dto, deviceInfo);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resend(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto, @Req() req: any) {
    const deviceInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
    };
    return this.authService.refreshToken(dto.refreshToken, deviceInfo);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:refreshToken')
  async logout(@Param('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  async logoutAll(@CurrentUser() user: any) {
    return this.authService.logoutAllDevices(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    return this.authService.getActiveSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async getDevices(@CurrentUser() user: any) {
    return this.authService.getUserDevices(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('devices/:deviceId')
  async revokeDevice(
    @CurrentUser() user: any,
    @Param('deviceId') deviceId: number,
  ) {
    return this.authService.revokeDevice(user.id, deviceId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return {
      message: 'Thông tin profile của bạn',
      user,
    };
  }

  // Google OAuth endpoints
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
    // Request will be redirected to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    try {
      // At this point, Google strategy has validated the user
      const result = await this.authService.googleLogin(req.user);

      // Redirect with tokens as query parameters (for frontend to handle)
      // In production, you might want to use a more secure method
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/success?token=${result.accessToken}&refreshToken=${result.refreshToken}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to error page
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/error?message=${encodeURIComponent(error.message)}`;
      return res.redirect(errorUrl);
    }
  }

  // Alternative endpoint for mobile apps or direct API access
  @Post('google/verify')
  async googleVerify() {
    // This would be used for mobile apps where you receive Google access token
    // and need to verify it server-side
    // Implementation would require google-auth-library and GoogleAuthDto
    throw new Error(
      'Not implemented yet - requires google-auth-library for token verification',
    );
  }

  // =============================================================================
  // 2FA Endpoints
  // =============================================================================

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  setup2FA(@CurrentUser() user: any) {
    return this.authService.setup2FA(user.id);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  verify2FA(@CurrentUser() user: any, @Body() dto: Verify2FADto) {
    return this.authService.verify2FA(user.id, dto);
  }

  @Delete('2fa/disable')
  @UseGuards(JwtAuthGuard)
  disable2FA(@CurrentUser() user: any, @Body() dto: Disable2FADto) {
    return this.authService.disable2FA(user.id, dto);
  }

  @Post('2fa/login')
  loginWith2FA(@Body() dto: LoginWith2FADto, @Req() req: any) {
    const deviceInfo = {
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    };
    return this.authService.loginWith2FA(dto, deviceInfo);
  }

  @Get('2fa/status')
  @UseGuards(JwtAuthGuard)
  async get2FAStatus(@CurrentUser() user: any) {
    return {
      is2FAEnabled: user.is2FAEnabled || false,
      hasSecret: !!user.totpSecret,
    };
  }
}
