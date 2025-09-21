import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  resend(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
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
}
