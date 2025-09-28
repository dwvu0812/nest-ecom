import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequiredPermissions } from '../shared/decorators/required-permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../shared/guards/permission.guard';
import type { User } from '@prisma/client';
import { ResourceException } from '../shared/exceptions';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequiredPermissions('Quản lý người dùng')
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return {
      success: true,
      data: permissions,
      message: 'Permissions retrieved successfully',
    };
  }

  @Get(':permissionId')
  @RequiredPermissions('Quản lý người dùng')
  async findOne(@Param('permissionId', ParseIntPipe) permissionId: number) {
    const permission = await this.permissionsService.findById(permissionId);

    if (!permission) {
      throw ResourceException.notFound('Permission not found');
    }

    return {
      success: true,
      data: permission,
      message: 'Permission retrieved successfully',
    };
  }

  @Post()
  @RequiredPermissions('Quản lý người dùng')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() user: User,
  ) {
    createPermissionDto.createdById = user.id;

    const permission =
      await this.permissionsService.create(createPermissionDto);

    return {
      success: true,
      data: permission,
      message: 'Permission created successfully',
    };
  }

  @Put(':permissionId')
  @RequiredPermissions('Quản lý người dùng')
  async update(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() user: User,
  ) {
    updatePermissionDto.updatedById = user.id;

    const permission = await this.permissionsService.update(
      permissionId,
      updatePermissionDto,
    );

    return {
      success: true,
      data: permission,
      message: 'Permission updated successfully',
    };
  }

  @Delete(':permissionId')
  @RequiredPermissions('Quản lý người dùng')
  async remove(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @CurrentUser() user: User,
  ) {
    const permission = await this.permissionsService.remove(
      permissionId,
      user.id,
    );

    return {
      success: true,
      data: permission,
      message: 'Permission deleted successfully',
    };
  }
}
