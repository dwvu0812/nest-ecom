import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ResourceException } from '../shared/exceptions';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return {
      success: true,
      data: permissions,
      message: 'Permissions retrieved successfully',
    };
  }

  @Get(':permissionId')
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
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() user?: User,
  ) {
    if (user?.id) {
      createPermissionDto.createdById = user.id;
    }

    const permission =
      await this.permissionsService.create(createPermissionDto);

    return {
      success: true,
      data: permission,
      message: 'Permission created successfully',
    };
  }

  @Put(':permissionId')
  async update(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() user?: User,
  ) {
    if (user?.id) {
      updatePermissionDto.updatedById = user.id;
    }

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
  async remove(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @CurrentUser() user?: User,
  ) {
    const permission = await this.permissionsService.remove(
      permissionId,
      user?.id,
    );

    return {
      success: true,
      data: permission,
      message: 'Permission deleted successfully',
    };
  }
}
