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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithRole(dto.email);
    if (!user) {
      throw UserException.userNotFound(dto.email);
    }

    // Check password
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

    // Generate tokens
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
      },
      accessToken,
      refreshToken,
    };
  }
}
