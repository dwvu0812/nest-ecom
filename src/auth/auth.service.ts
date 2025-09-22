import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';
import { VerificationCodeRepository } from './repositories/verification-code.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { securityConfig, jwtConfig } from '../shared/config';
import { UserException, ValidationException } from '../shared/exceptions';
import {
  VERIFICATION_CODE_TYPES,
  OTP_CONFIG,
  AUTH_MESSAGES,
  VALIDATION_FIELDS,
} from '../shared/constants';
import { DeviceService, DeviceInfo } from './device.service';
import { SessionService } from './session.service';
import { parseDuration } from '../shared/utils';
import { AuthException } from '../shared/exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly jwtService: JwtService,
    private readonly deviceService: DeviceService,
    private readonly sessionService: SessionService,
  ) {}

  private generateCode(): string {
    return Math.floor(
      OTP_CONFIG.MIN_VALUE +
        Math.random() * (OTP_CONFIG.MAX_VALUE - OTP_CONFIG.MIN_VALUE),
    ).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw UserException.emailAlreadyExists(dto.email);

    const hashed = await bcrypt.hash(dto.password, securityConfig.bcryptRounds);
    await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashed,
      phoneNumber: dto.phoneNumber,
    });

    // Invalidate previous REGISTER codes for this email
    await this.verificationCodeRepository.deleteByEmailAndType(
      dto.email,
      VERIFICATION_CODE_TYPES.REGISTER,
    );

    const code = this.generateCode();
    const expiresAt = new Date(
      Date.now() + securityConfig.otp.expiresIn * 1000,
    );
    await this.verificationCodeRepository.create({
      email: dto.email,
      code,
      type: 'REGISTER',
      expiresAt,
    });

    await this.mailer.sendVerificationCode(
      dto.email,
      code,
      securityConfig.otp.expiresIn,
    );

    return {
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const code = await this.verificationCodeRepository.findValidCode(
      dto.email,
      dto.code,
      VERIFICATION_CODE_TYPES.REGISTER,
    );
    if (!code)
      throw ValidationException.invalidInput(
        VALIDATION_FIELDS.VERIFICATION_CODE,
        AUTH_MESSAGES.INVALID_VERIFICATION_CODE,
      );

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw UserException.userNotFound(dto.email);

    if (user.emailVerifiedAt) {
      // cleanup any stray codes
      await this.verificationCodeRepository.deleteByEmailAndType(
        dto.email,
        VERIFICATION_CODE_TYPES.REGISTER,
      );
      return { message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED };
    }

    await this.usersService.markEmailVerified(user.id);
    await this.verificationCodeRepository.deleteByEmailAndType(
      dto.email,
      VERIFICATION_CODE_TYPES.REGISTER,
    );

    return { message: AUTH_MESSAGES.EMAIL_VERIFIED_SUCCESS };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw UserException.userNotFound(dto.email);
    if (user.emailVerifiedAt) {
      return { message: AUTH_MESSAGES.EMAIL_ALREADY_VERIFIED_RESEND };
    }

    // Throttle: prevent resending within 60s
    const isRecentlyCreated =
      await this.verificationCodeRepository.isCodeRecentlyCreated(
        dto.email,
        VERIFICATION_CODE_TYPES.REGISTER,
        OTP_CONFIG.RESEND_THROTTLE_SECONDS,
      );
    if (isRecentlyCreated) {
      throw ValidationException.invalidInput(
        VALIDATION_FIELDS.RESEND_REQUEST,
        AUTH_MESSAGES.RESEND_THROTTLE,
      );
    }

    await this.verificationCodeRepository.deleteByEmailAndType(
      dto.email,
      VERIFICATION_CODE_TYPES.REGISTER,
    );

    const code = this.generateCode();
    const expiresAt = new Date(
      Date.now() + securityConfig.otp.expiresIn * 1000,
    );
    await this.verificationCodeRepository.create({
      email: dto.email,
      code,
      type: VERIFICATION_CODE_TYPES.REGISTER,
      expiresAt,
    });

    await this.mailer.sendVerificationCode(
      dto.email,
      code,
      securityConfig.otp.expiresIn,
    );
    return { message: AUTH_MESSAGES.RESEND_SUCCESS };
  }

  async login(dto: LoginDto, deviceInfo: DeviceInfo) {
    const user = await this.usersService.findByEmailWithRole(dto.email);
    if (!user) {
      throw UserException.userNotFound(dto.email);
    }

    // Check password (skip for Google users who don't have password)
    if (!user.password) {
      throw ValidationException.invalidInput(
        VALIDATION_FIELDS.PASSWORD,
        'This account was created with Google. Please use Google login.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw ValidationException.invalidInput(
        VALIDATION_FIELDS.PASSWORD,
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    // Check if email is verified
    if (!user.emailVerifiedAt) {
      throw ValidationException.invalidInput(
        VALIDATION_FIELDS.EMAIL,
        AUTH_MESSAGES.EMAIL_NOT_VERIFIED,
      );
    }

    // Check if account is blocked
    if (user.status === 'BLOCKED') {
      throw UserException.accountBlocked(user.email);
    }

    // Device tracking
    const device = await this.deviceService.identifyOrCreateDevice(
      user.id,
      deviceInfo,
    );
    // Generate token payload with device context
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      deviceId: device.id,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });
    // Create session record
    await this.sessionService.createSession({
      userId: user.id,
      deviceId: device.id,
      accessToken,
      refreshToken,
      ip: deviceInfo.ip,
      userAgent: deviceInfo.userAgent,
      expiresAt: new Date(
        Date.now() + parseDuration(jwtConfig.refreshExpiresIn),
      ),
    });
    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
      device: { id: device.id },
    };
  }

  async refreshToken(token: string, deviceInfo: DeviceInfo) {
    const session = await this.sessionService.validateRefreshToken(token);
    if (!session) {
      throw AuthException.invalidToken();
    }
    await this.deviceService.updateLastActive(session.deviceId);
    const payload = {
      sub: session.userId,
      email: session.user.email,
      role: session.user.role,
      deviceId: session.deviceId,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });
    await this.sessionService.updateSession(session.id, {
      accessToken,
      lastUsedAt: new Date(),
      ip: deviceInfo.ip,
    });
    return { accessToken, refreshToken: token };
  }

  async logout(token: string) {
    await this.sessionService.deactivateSession(token);
    return {
      message: AUTH_MESSAGES.LOGOUT_SUCCESS || 'Logged out successfully',
    };
  }

  async logoutAllDevices(userId: number) {
    await this.sessionService.deactivateAllUserSessions(userId);
    return {
      message:
        AUTH_MESSAGES.LOGOUT_ALL_SUCCESS || 'Logged out from all devices',
    };
  }

  async getActiveSessions(userId: number) {
    return this.sessionService.getActiveUserSessions(userId);
  }

  async getUserDevices(userId: number) {
    return this.deviceService.getUserDevices(userId);
  }

  async revokeDevice(userId: number, deviceId: number) {
    await this.sessionService.revokeDeviceSessions(userId, deviceId);
    await this.deviceService.deactivateDevice(deviceId);
    return {
      message:
        AUTH_MESSAGES.DEVICE_REVOKE_SUCCESS || 'Device revoked successfully',
    };
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    picture?: string;
    emailVerified: boolean;
    accessToken?: string;
    refreshToken?: string;
  }) {
    // Tìm user bằng Google ID hoặc email
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Tìm bằng email để link với tài khoản hiện có
      user = await this.usersService.findByEmail(googleUser.email);

      if (user) {
        // Link Google ID với tài khoản hiện có
        await this.usersService.linkGoogleAccount(
          user.id,
          googleUser.googleId,
          googleUser.picture,
        );
      } else {
        // Tạo user mới từ Google
        const defaultRole = await this.usersService.getDefaultRole();
        user = await this.usersService.createGoogleUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          avatar: googleUser.picture,
          emailVerifiedAt: googleUser.emailVerified ? new Date() : null,
          roleId: defaultRole.id,
          phoneNumber: '', // Có thể để trống, user sẽ update sau
        });
      }
    }

    // Kiểm tra trạng thái account
    if (user.status === 'BLOCKED') {
      throw UserException.accountBlocked(user.email);
    }

    // Generate JWT tokens
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }
}
