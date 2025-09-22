import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { emailConfig, securityConfig } from '../shared/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly resend: Resend;

  constructor() {
    if (!emailConfig.resend.apiKey) {
      throw new Error('RESEND_API_KEY is required for email service');
    }

    this.resend = new Resend(emailConfig.resend.apiKey);
    this.logger.log('Email service initialized with Resend');
  }

  async sendVerificationCode(
    to: string,
    code: string,
    expiresInSec: number = securityConfig.otp.expiresIn,
  ): Promise<void> {
    const subject = 'Mã xác minh tài khoản';
    const text = `Mã xác minh của bạn là ${code}. Mã hết hạn sau ${Math.floor(
      expiresInSec / 60,
    )} phút.`;

    await this.sendEmail(to, subject, text);
  }

  async sendPasswordResetCode(
    to: string,
    code: string,
    expiresInSec: number = securityConfig.otp.expiresIn,
  ): Promise<void> {
    const subject = 'Mã đặt lại mật khẩu';
    const text = `Mã đặt lại mật khẩu của bạn là ${code}. Mã hết hạn sau ${Math.floor(
      expiresInSec / 60,
    )} phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;

    await this.sendEmail(to, subject, text);
  }

  async sendPasswordResetConfirmation(to: string): Promise<void> {
    const subject = 'Mật khẩu đã được thay đổi thành công';
    const text = `Mật khẩu của bạn đã được thay đổi thành công. Nếu bạn không thực hiện hành động này, vui lòng liên hệ với chúng tôi ngay lập tức.`;

    await this.sendEmail(to, subject, text);
  }

  /**
   * Gửi email sử dụng Resend
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: emailConfig.from || 'onboarding@resend.dev',
        to,
        subject,
        text,
        html,
      });

      this.logger.log(
        `Email sent successfully via Resend to: ${to}, ID: ${result.data?.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email via Resend to: ${to}`, error);
      throw error;
    }
  }
}
