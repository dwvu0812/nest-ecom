import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserSession, User, Device } from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: {
    userId: number;
    deviceId: number;
    accessToken: string;
    refreshToken: string;
    ip: string;
    userAgent: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({ data });
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<
    (UserSession & { user: User & { role: any }; device: Device }) | null
  > {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: { include: { role: true } }, device: true },
    });
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return null;
    }
    return session;
  }

  async updateSession(
    id: number,
    data: Partial<{
      accessToken: string;
      lastUsedAt: Date;
      ip: string;
    }>,
  ): Promise<UserSession> {
    return this.prisma.userSession.update({ where: { id }, data });
  }

  async deactivateSession(refreshToken: string): Promise<void> {
    await this.prisma.userSession.update({
      where: { refreshToken },
      data: { isActive: false },
    });
  }

  async deactivateAllUserSessions(userId: number): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
  }

  async getActiveUserSessions(
    userId: number,
  ): Promise<(UserSession & { device: Device })[]> {
    return this.prisma.userSession.findMany({
      where: { userId, isActive: true },
      include: { device: true },
    });
  }

  async revokeDeviceSessions(userId: number, deviceId: number): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, deviceId, isActive: true },
      data: { isActive: false },
    });
  }
}
