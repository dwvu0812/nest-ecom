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
  Req,
} from '@nestjs/common';
import { CategoriesService } from '../categories.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequiredPermissions } from '../../shared/decorators/required-permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AuditLogService } from '../../shared/services/audit-log.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto';
import type { User } from '@prisma/client';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminCategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequiredPermissions('Quản lý danh mục')
  async getCategories(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('parentId', new ParseIntPipe({ optional: true })) parentId?: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const result = await this.categoriesService.getCategories({
      page,
      limit,
      search,
      parentId: parentId === -1 ? null : parentId,
      languageId,
    });

    return {
      success: true,
      data: result,
      message: 'Categories retrieved successfully',
    };
  }

  @Get('tree')
  @RequiredPermissions('Quản lý danh mục')
  async getCategoryTree(
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const tree = await this.categoriesService.getCategoryTree(languageId);

    return {
      success: true,
      data: tree,
      message: 'Category tree retrieved successfully',
    };
  }

  @Get('statistics')
  @RequiredPermissions('Quản lý danh mục')
  async getCategoryStatistics() {
    const stats = await this.categoriesService.getCategoryStatistics();

    return {
      success: true,
      data: stats,
      message: 'Category statistics retrieved successfully',
    };
  }

  @Get(':id')
  @RequiredPermissions('Quản lý danh mục')
  async getCategoryById(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const category = await this.categoriesService.getCategoryById(
      id,
      languageId,
    );

    return {
      success: true,
      data: category,
      message: 'Category retrieved successfully',
    };
  }

  @Post()
  @RequiredPermissions('Tạo danh mục')
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    createCategoryDto.createdById = currentUser.id;

    const category =
      await this.categoriesService.createCategory(createCategoryDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'CREATE_CATEGORY',
      'Category',
      category.id,
      null,
      createCategoryDto,
      request,
    );

    // Fetch full category details
    const fullCategory = await this.categoriesService.getCategoryById(
      category.id,
    );

    return {
      success: true,
      data: fullCategory,
      message: 'Category created successfully',
    };
  }

  @Put(':id')
  @RequiredPermissions('Cập nhật danh mục')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    updateCategoryDto.updatedById = currentUser.id;

    const category = await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
    );

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'UPDATE_CATEGORY',
      'Category',
      id,
      null,
      updateCategoryDto,
      request,
    );

    // Fetch full category details
    const fullCategory = await this.categoriesService.getCategoryById(id);

    return {
      success: true,
      data: fullCategory,
      message: 'Category updated successfully',
    };
  }

  @Delete(':id')
  @RequiredPermissions('Xóa danh mục')
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const category = await this.categoriesService.deleteCategory(
      id,
      currentUser.id,
    );

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'DELETE_CATEGORY',
      'Category',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: category.id, deletedAt: category.deletedAt },
      message: 'Category deleted successfully',
    };
  }

  @Put(':id/restore')
  @RequiredPermissions('Cập nhật danh mục')
  async restoreCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const category = await this.categoriesService.restoreCategory(id);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'RESTORE_CATEGORY',
      'Category',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: category.id, deletedAt: category.deletedAt },
      message: 'Category restored successfully',
    };
  }
}
