import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogData {
  userId: number;
  action: string;
  resource: string;
  resourceId?: string | number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(data: AuditLogData): Promise<void> {
    try {
      // For now, we'll log to console and could extend to database later
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      };

      // Log to console (in production, this would go to proper logging service)
      console.log('🔍 AUDIT LOG:', JSON.stringify(logEntry, null, 2));

      // TODO: In production, save to database audit_logs table
      // await this.prisma.auditLog.create({ data: logEntry });
    } catch (error) {
      // Don't throw errors for audit logging to avoid breaking business logic
      console.error('Failed to log audit action:', error);
    }
  }

  // Convenience methods for common admin actions
  async logUserCreation(
    adminId: number,
    newUserId: number,
    userData: any,
    request?: any,
  ) {
    await this.logAction({
      userId: adminId,
      action: 'USER_CREATE',
      resource: 'user',
      resourceId: newUserId,
      details: {
        createdUser: {
          email: userData.email,
          name: userData.name,
          roleId: userData.roleId,
        },
      },
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }

  async logUserUpdate(
    adminId: number,
    targetUserId: number,
    updateData: any,
    request?: any,
  ) {
    await this.logAction({
      userId: adminId,
      action: 'USER_UPDATE',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        updates: updateData,
      },
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }

  async logUserStatusChange(
    adminId: number,
    targetUserId: number,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    request?: any,
  ) {
    await this.logAction({
      userId: adminId,
      action: 'USER_STATUS_CHANGE',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        oldStatus,
        newStatus,
        reason,
      },
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }

  async logUserRoleChange(
    adminId: number,
    targetUserId: number,
    oldRoleId: number,
    newRoleId: number,
    request?: any,
  ) {
    await this.logAction({
      userId: adminId,
      action: 'USER_ROLE_CHANGE',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        oldRoleId,
        newRoleId,
      },
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }

  async logUserDeletion(adminId: number, targetUserId: number, request?: any) {
    await this.logAction({
      userId: adminId,
      action: 'USER_DELETE',
      resource: 'user',
      resourceId: targetUserId,
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }

  async logBulkAction(
    adminId: number,
    action: string,
    userIds: number[],
    result: { updated: number; errors: string[] },
    request?: any,
  ) {
    await this.logAction({
      userId: adminId,
      action: 'USER_BULK_ACTION',
      resource: 'user',
      details: {
        bulkAction: action,
        targetUserIds: userIds,
        result,
      },
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
    });
  }
}
