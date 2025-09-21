import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { securityConfig } from '../shared/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly mailer: MailerService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, securityConfig.bcryptRounds);
    await this.usersService.createUser({
      email: dto.email,
      name: dto.name,
      password: hashed,
      phoneNumber: dto.phoneNumber,
    });

    // Invalidate previous REGISTER codes for this email
    await this.prisma.verificationCode.deleteMany({
      where: { email: dto.email, type: 'REGISTER' },
    });

    const code = this.generateCode();
    const expiresAt = new Date(
      Date.now() + securityConfig.otp.expiresIn * 1000,
    );
    await this.prisma.verificationCode.create({
      data: {
        email: dto.email,
        code,
        type: 'REGISTER',
        expiresAt,
      },
    });

    await this.mailer.sendVerificationCode(
      dto.email,
      code,
      securityConfig.otp.expiresIn,
    );

    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh.',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const code = await this.prisma.verificationCode.findFirst({
      where: {
        email: dto.email,
        code: dto.code,
        type: 'REGISTER',
        expiresAt: { gt: new Date() },
      },
    });
    if (!code)
      throw new BadRequestException('Mã xác minh không hợp lệ hoặc đã hết hạn');

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    if (user.emailVerifiedAt) {
      // cleanup any stray codes
      await this.prisma.verificationCode.deleteMany({
        where: { email: dto.email, type: 'REGISTER' },
      });
      return { message: 'Email đã được xác minh trước đó.' };
    }

    await this.usersService.markEmailVerified(user.id);
    await this.prisma.verificationCode.deleteMany({
      where: { email: dto.email, type: 'REGISTER' },
    });

    return { message: 'Xác minh email thành công.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (user.emailVerifiedAt) {
      return { message: 'Email đã được xác minh.' };
    }

    // Throttle: prevent resending within 60s
    const existing = await this.prisma.verificationCode.findFirst({
      where: {
        email: dto.email,
        type: 'REGISTER',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      const createdAt = existing.createdAt as unknown as Date;
      if (createdAt && Date.now() - new Date(createdAt).getTime() < 60_000) {
        throw new BadRequestException(
          'Vui lòng chờ ít nhất 60 giây trước khi yêu cầu lại.',
        );
      }
    }

    await this.prisma.verificationCode.deleteMany({
      where: { email: dto.email, type: 'REGISTER' },
    });

    const code = this.generateCode();
    const expiresAt = new Date(
      Date.now() + securityConfig.otp.expiresIn * 1000,
    );
    await this.prisma.verificationCode.create({
      data: { email: dto.email, code, type: 'REGISTER', expiresAt },
    });

    await this.mailer.sendVerificationCode(
      dto.email,
      code,
      securityConfig.otp.expiresIn,
    );
    return { message: 'Đã gửi lại mã xác minh qua email.' };
  }
}
