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
import { ProductsService } from '../products.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequiredPermissions } from '../../shared/decorators/required-permissions.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AuditLogService } from '../../shared/services/audit-log.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  ProductListResponseDto,
  CreateSKUDto,
  UpdateSKUDto,
} from '../dto';
import type { User } from '@prisma/client';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequiredPermissions('Quản lý sản phẩm')
  async getProducts(@Query() query: ProductQueryDto) {
    const result = await this.productsService.getProducts(query);

    const response = new ProductListResponseDto(result);

    return {
      success: true,
      data: response,
      message: 'Products retrieved successfully',
    };
  }

  @Get('statistics')
  @RequiredPermissions('Quản lý sản phẩm')
  async getProductStatistics() {
    const stats = await this.productsService.getProductStatistics();

    return {
      success: true,
      data: stats,
      message: 'Product statistics retrieved successfully',
    };
  }

  @Get('low-stock')
  @RequiredPermissions('Quản lý sản phẩm')
  async getLowStockSKUs(
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold?: number,
  ) {
    const skus = await this.productsService.getLowStockSKUs(threshold);

    return {
      success: true,
      data: skus,
      message: 'Low stock SKUs retrieved successfully',
    };
  }

  @Get('out-of-stock')
  @RequiredPermissions('Quản lý sản phẩm')
  async getOutOfStockSKUs() {
    const skus = await this.productsService.getOutOfStockSKUs();

    return {
      success: true,
      data: skus,
      message: 'Out of stock SKUs retrieved successfully',
    };
  }

  @Get(':id')
  @RequiredPermissions('Quản lý sản phẩm')
  async getProductById(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const product = await this.productsService.getProductById(id, languageId);

    const response = new ProductResponseDto(product);

    return {
      success: true,
      data: response,
      message: 'Product retrieved successfully',
    };
  }

  @Post()
  @RequiredPermissions('Tạo sản phẩm')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    createProductDto.createdById = currentUser.id;

    const product = await this.productsService.createProduct(createProductDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'CREATE_PRODUCT',
      'Product',
      product.id,
      null,
      createProductDto,
      request,
    );

    // Fetch full product details
    const fullProduct = await this.productsService.getProductById(product.id);
    const response = new ProductResponseDto(fullProduct);

    return {
      success: true,
      data: response,
      message: 'Product created successfully',
    };
  }

  @Put(':id')
  @RequiredPermissions('Cập nhật sản phẩm')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    updateProductDto.updatedById = currentUser.id;

    const product = await this.productsService.updateProduct(
      id,
      updateProductDto,
    );

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'UPDATE_PRODUCT',
      'Product',
      id,
      null,
      updateProductDto,
      request,
    );

    // Fetch full product details
    const fullProduct = await this.productsService.getProductById(id);
    const response = new ProductResponseDto(fullProduct);

    return {
      success: true,
      data: response,
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @RequiredPermissions('Xóa sản phẩm')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const product = await this.productsService.deleteProduct(
      id,
      currentUser.id,
    );

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'DELETE_PRODUCT',
      'Product',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: product.id, deletedAt: product.deletedAt },
      message: 'Product deleted successfully',
    };
  }

  @Put(':id/restore')
  @RequiredPermissions('Cập nhật sản phẩm')
  async restoreProduct(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const product = await this.productsService.restoreProduct(id);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'RESTORE_PRODUCT',
      'Product',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: product.id, deletedAt: product.deletedAt },
      message: 'Product restored successfully',
    };
  }

  // SKU Management endpoints
  @Post('skus')
  @RequiredPermissions('Tạo sản phẩm')
  async createSKU(
    @Body() createSKUDto: CreateSKUDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    createSKUDto.createdById = currentUser.id;

    const sku = await this.productsService.createSKU(createSKUDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'CREATE_SKU',
      'SKU',
      sku.id,
      null,
      createSKUDto,
      request,
    );

    return {
      success: true,
      data: sku,
      message: 'SKU created successfully',
    };
  }

  @Put('skus/:id')
  @RequiredPermissions('Cập nhật sản phẩm')
  async updateSKU(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSKUDto: UpdateSKUDto,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    updateSKUDto.updatedById = currentUser.id;

    const sku = await this.productsService.updateSKU(id, updateSKUDto);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'UPDATE_SKU',
      'SKU',
      id,
      null,
      updateSKUDto,
      request,
    );

    return {
      success: true,
      data: sku,
      message: 'SKU updated successfully',
    };
  }

  @Delete('skus/:id')
  @RequiredPermissions('Xóa sản phẩm')
  async deleteSKU(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const sku = await this.productsService.deleteSKU(id, currentUser.id);

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'DELETE_SKU',
      'SKU',
      id,
      null,
      null,
      request,
    );

    return {
      success: true,
      data: { id: sku.id, deletedAt: sku.deletedAt },
      message: 'SKU deleted successfully',
    };
  }

  @Put('skus/:id/stock')
  @RequiredPermissions('Cập nhật sản phẩm')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { quantity: number; operation?: 'increment' | 'decrement' },
    @CurrentUser() currentUser: User,
    @Req() request: any,
  ) {
    const sku = await this.productsService.updateStock(
      id,
      body.quantity,
      body.operation || 'decrement',
    );

    // Log audit trail
    await this.auditLogService.logAction(
      currentUser.id,
      'UPDATE_STOCK',
      'SKU',
      id,
      null,
      body,
      request,
    );

    return {
      success: true,
      data: sku,
      message: 'Stock updated successfully',
    };
  }
}
