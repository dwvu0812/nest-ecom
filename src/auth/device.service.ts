import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';

export interface DeviceInfo {
  ip: string;
  userAgent: string;
  deviceId?: string;
}

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  private generateDeviceId(userId: number, deviceInfo: DeviceInfo): string {
    const parser = new UAParser(deviceInfo.userAgent);
    const result = parser.getResult();
    const fingerprint = `${userId}-${result.browser.name}-${result.os.name}-${deviceInfo.ip}`;
    return createHash('sha256').update(fingerprint).digest('hex');
  }

  private parseDeviceInfo(userAgent: string) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const browser = `${result.browser.name} ${result.browser.version}`;
    const os = `${result.os.name} ${result.os.version}`;
    const deviceType = result.device.type || 'desktop';
    const deviceName = result.device.model
      ? `${result.device.vendor} ${result.device.model}`
      : `${result.browser.name} on ${result.os.name}`;
    return { browser, os, deviceType, deviceName };
  }

  async identifyOrCreateDevice(userId: number, deviceInfo: DeviceInfo) {
    const deviceId =
      deviceInfo.deviceId || this.generateDeviceId(userId, deviceInfo);
    const parsed = this.parseDeviceInfo(deviceInfo.userAgent);
    let device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) {
      device = await this.prisma.device.create({
        data: {
          userId,
          deviceId,
          deviceName: parsed.deviceName,
          deviceType: parsed.deviceType,
          browser: parsed.browser,
          os: parsed.os,
          ip: deviceInfo.ip,
          userAgent: deviceInfo.userAgent,
        },
      });
    } else {
      device = await this.prisma.device.update({
        where: { id: device.id },
        data: { ip: deviceInfo.ip, lastActiveAt: new Date() },
      });
    }
    return device;
  }

  async updateLastActive(deviceId: number) {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: { lastActiveAt: new Date() },
    });
  }

  async deactivateDevice(deviceId: number) {
    return this.prisma.device.update({
      where: { id: deviceId },
      data: { isActive: false },
    });
  }

  async getUserDevices(userId: number) {
    return this.prisma.device.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ip: true,
        lastActiveAt: true,
        createdAt: true,
        _count: { select: { sessions: { where: { isActive: true } } } },
      },
    });
  }
}
