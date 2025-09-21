import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { emailConfig, securityConfig } from '../shared/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter?: Transporter;

  constructor() {
    const { host, port, user, pass } = emailConfig.smtp;
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.logger.warn(
        'SMTP config missing; emails will be logged instead of sent.',
      );
    }
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

    if (!this.transporter) {
      this.logger.log(`[DEV-EMAIL] To: ${to} | ${subject} | ${text}`);
      return;
    }

    await this.transporter.sendMail({
      from: emailConfig.from || emailConfig.smtp.user,
      to,
      subject,
      text,
    });
  }
}
