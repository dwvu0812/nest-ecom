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
import { BrandsService } from '../brands.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequiredPermissions } from '../../shared/decorators/required-permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AuditLogService } from '../../shared/services/audit-log.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto';
import type { User } from '@prisma/client';

@Controller('admin/brands')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminBrandsController {
  constructor(
    private readonly brandsService: BrandsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequiredPermissions('Quản lý thương hiệu')
  async getBrands(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const result = await this.brandsService.getBrands({
      page,
      limit,
      search,
      languageId,
    });

    return {
      success: true,
      data: result,
      message: 'Brands retrieved successfully',
    };
  }

  @Get('statistics')
  @RequiredPermissions('Quản lý thương hiệu')
  async getBrandStatistics() {
    const stats = await this.brandsService.getBrandStatistics();

    return {
      success: true,
      data: stats,
      message: 'Brand statistics retrieved successfully',
    };
  }

  @Get(':id')
  @RequiredPermissions('Quản lý thương hiệu')
  async getBrandById(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const brand = await this.brandsService.getBrandById(id, languageId);

    return {
      success: true,
      data: brand,
      message: 'Brand retrieved successfully',
    };
  }

  @Post()
  @RequiredPermissions('Tạo thương hiệu')
  async createBrand(
    @Body() createBrandDto: CreateBrandDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    createBrandDto.createdById = currentUser.id;

    const brand = await this.brandsService.createBrand(createBrandDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'CREATE_BRAND',
      'Brand',
      brand.id,
      null,
      createBrandDto,
      request,
    );

    // Fetch full brand details
    const fullBrand = await this.brandsService.getBrandById(brand.id);

    return {
      success: true,
      data: fullBrand,
      message: 'Brand created successfully',
    };
  }

  @Put(':id')
  @RequiredPermissions('Cập nhật thương hiệu')
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    updateBrandDto.updatedById = currentUser.id;

    const brand = await this.brandsService.updateBrand(id, updateBrandDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'UPDATE_BRAND',
      'Brand',
      id,
      null,
      updateBrandDto,
      request,
    );

    // Fetch full brand details
    const fullBrand = await this.brandsService.getBrandById(id);

    return {
      success: true,
      data: fullBrand,
      message: 'Brand updated successfully',
    };
  }

  @Delete(':id')
  @RequiredPermissions('Xóa thương hiệu')
  async deleteBrand(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const brand = await this.brandsService.deleteBrand(id, currentUser.id);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'DELETE_BRAND',
      'Brand',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: brand.id, deletedAt: brand.deletedAt },
      message: 'Brand deleted successfully',
    };
  }

  @Put(':id/restore')
  @RequiredPermissions('Cập nhật thương hiệu')
  async restoreBrand(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const brand = await this.brandsService.restoreBrand(id);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'RESTORE_BRAND',
      'Brand',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: brand.id, deletedAt: brand.deletedAt },
      message: 'Brand restored successfully',
    };
  }
}
