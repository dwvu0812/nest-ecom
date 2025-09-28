import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequiredPermissions } from '../../shared/decorators/required-permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AuditLogService } from '../../shared/services/audit-log.service';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
  ListUsersQueryDto,
  UserManagementResponseDto,
  UserListResponseDto,
  ChangeUserRoleDto,
  ChangeUserStatusDto,
  BulkUserActionDto,
} from '../dto';
import * as bcrypt from 'bcryptjs';
import { securityConfig } from '../../shared/config';
import type { User } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminUserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequiredPermissions('Quản lý người dùng')
  async getUsers(@Query() query: ListUsersQueryDto) {
    const result = await this.usersService.getUsersWithAdvancedPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      roleId: query.roleId,
      status: query.status,
      createdAfter: query.createdAfter,
      createdBefore: query.createdBefore,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      includeDeleted: query.includeDeleted,
    });

    // Transform data to response DTOs
    const users = result.data.map(
      (user: any) =>
        new UserManagementResponseDto({
          id: user.id,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
          status: user.status,
          is2FAEnabled: user.is2FAEnabled,
          emailVerifiedAt: user.emailVerifiedAt,
          googleId: user.googleId,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
          createdById: user.createdById,
          updatedById: user.updatedById,
          deviceCount: user._count?.devices || 0,
          activeSessionCount: user._count?.sessions || 0,
        }),
    );

    const response = new UserListResponseDto({
      data: users,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });

    return {
      success: true,
      data: response,
      message: 'Users retrieved successfully',
    };
  }

  @Get('statistics')
  @RequiredPermissions('Quản lý người dùng')
  async getUserStatistics() {
    const stats = await this.usersService.getUserStatistics();
    return {
      success: true,
      data: stats,
      message: 'User statistics retrieved successfully',
    };
  }

  @Get(':userId')
  @RequiredPermissions('Quản lý người dùng')
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.usersService.findByIdWithRole(userId);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    const userResponse = new UserManagementResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      status: user.status,
      is2FAEnabled: user.is2FAEnabled,
      emailVerifiedAt: user.emailVerifiedAt,
      googleId: user.googleId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      createdById: user.createdById,
      updatedById: user.updatedById,
    });

    return {
      success: true,
      data: userResponse,
      message: 'User retrieved successfully',
    };
  }

  @Post()
  @RequiredPermissions('Tạo người dùng')
  async createUser(
    @Body() createUserDto: AdminCreateUserDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    // Hash password
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      securityConfig.bcryptRounds,
    );

    const user = await this.usersService.createUserByAdmin({
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      phoneNumber: createUserDto.phoneNumber,
      roleId: createUserDto.roleId,
      emailVerified: createUserDto.emailVerified,
      avatar: createUserDto.avatar,
      createdById: currentUser.id,
    });

    // Log audit trail
    await this.auditLogService.logUserCreation(
      currentUser.id,
      user.id,
      createUserDto,
      request,
    );

    const userResponse = new UserManagementResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      status: user.status,
      is2FAEnabled: user.is2FAEnabled,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdById: user.createdById,
    });

    return {
      success: true,
      data: userResponse,
      message: 'User created successfully',
    };
  }

  @Put(':userId')
  @RequiredPermissions('Cập nhật người dùng')
  async updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: AdminUpdateUserDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const user = await this.usersService.updateUserByAdmin(
      userId,
      {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phoneNumber: updateUserDto.phoneNumber,
        avatar: updateUserDto.avatar,
        roleId: updateUserDto.roleId,
        status: updateUserDto.status,
        is2FAEnabled: updateUserDto.is2FAEnabled,
        emailVerified: updateUserDto.emailVerified,
      },
      currentUser.id,
    );

    // Log audit trail
    await this.auditLogService.logUserUpdate(
      currentUser.id,
      userId,
      updateUserDto,
      request,
    );

    const userResponse = new UserManagementResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      status: user.status,
      is2FAEnabled: user.is2FAEnabled,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      updatedById: user.updatedById,
    });

    return {
      success: true,
      data: userResponse,
      message: 'User updated successfully',
    };
  }

  @Put(':userId/role')
  @RequiredPermissions('Cập nhật người dùng')
  async changeUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() changeRoleDto: ChangeUserRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.usersService.changeUserRole(
      userId,
      changeRoleDto.roleId,
      currentUser.id,
    );

    return {
      success: true,
      data: { id: user.id, roleId: user.roleId },
      message: 'User role updated successfully',
    };
  }

  @Put(':userId/status')
  @RequiredPermissions('Cập nhật người dùng')
  async changeUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() changeStatusDto: ChangeUserStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.usersService.changeUserStatus(
      userId,
      changeStatusDto.status,
      currentUser.id,
      changeStatusDto.reason,
    );

    return {
      success: true,
      data: { id: user.id, status: user.status },
      message: 'User status updated successfully',
    };
  }

  @Delete(':userId')
  @RequiredPermissions('Xóa người dùng')
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const user = await this.usersService.softDeleteUser(userId, currentUser.id);

    // Log audit trail
    await this.auditLogService.logUserDeletion(currentUser.id, userId, request);

    return {
      success: true,
      data: { id: user.id, deletedAt: user.deletedAt },
      message: 'User deleted successfully',
    };
  }

  @Put(':userId/restore')
  @RequiredPermissions('Cập nhật người dùng')
  async restoreUser(@Param('userId', ParseIntPipe) userId: number) {
    const user = await this.usersService.restoreUser(userId);

    return {
      success: true,
      data: { id: user.id, deletedAt: user.deletedAt },
      message: 'User restored successfully',
    };
  }

  @Post('bulk-action')
  @RequiredPermissions('Cập nhật người dùng', 'Xóa người dùng')
  async bulkAction(
    @Body() bulkActionDto: BulkUserActionDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const result = await this.usersService.bulkUpdateUsers(
      bulkActionDto.userIds,
      bulkActionDto.action,
      currentUser.id,
      bulkActionDto.reason,
    );

    // Log audit trail
    await this.auditLogService.logBulkAction(
      currentUser.id,
      bulkActionDto.action,
      bulkActionDto.userIds,
      result,
      request,
    );

    return {
      success: true,
      data: result,
      message: `Bulk action completed. ${result.updated} users updated${
        result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''
      }`,
    };
  }
}
