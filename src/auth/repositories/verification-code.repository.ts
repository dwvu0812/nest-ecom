import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { VerificationCode, VerificationCodeType } from '@prisma/client';

@Injectable()
export class VerificationCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findValidCode(
    email: string,
    code: string,
    type: VerificationCodeType,
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        type,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async findLatestByEmailAndType(
    email: string,
    type: VerificationCodeType,
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: {
        email,
        type,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    email: string;
    code: string;
    type: VerificationCodeType;
    expiresAt: Date;
  }): Promise<VerificationCode> {
    return this.prisma.verificationCode.create({ data });
  }

  async deleteByEmailAndType(
    email: string,
    type: VerificationCodeType,
  ): Promise<void> {
    await this.prisma.verificationCode.deleteMany({
      where: { email, type },
    });
  }

  async deleteExpiredCodes(): Promise<number> {
    const result = await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  async isCodeRecentlyCreated(
    email: string,
    type: VerificationCodeType,
    withinSeconds: number = 60,
  ): Promise<boolean> {
    const sinceTime = new Date(Date.now() - withinSeconds * 1000);

    const recentCode = await this.prisma.verificationCode.findFirst({
      where: {
        email,
        type,
        createdAt: { gte: sinceTime },
      },
    });

    return !!recentCode;
  }

  async getCodeStatistics(): Promise<{
    total: number;
    byType: Record<VerificationCodeType, number>;
    expired: number;
  }> {
    const [total, codes, expired] = await Promise.all([
      this.prisma.verificationCode.count(),
      this.prisma.verificationCode.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.verificationCode.count({
        where: { expiresAt: { lt: new Date() } },
      }),
    ]);

    const byType = codes.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<VerificationCodeType, number>,
    );

    return { total, byType, expired };
  }
}
