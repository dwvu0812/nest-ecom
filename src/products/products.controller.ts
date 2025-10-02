import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductQueryDto, ProductResponseDto, ProductListResponseDto } from './dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(@Query() query: ProductQueryDto) {
    const result = await this.productsService.getProducts(query);

    const response = new ProductListResponseDto(result);

    return {
      success: true,
      data: response,
      message: 'Products retrieved successfully',
    };
  }

  @Get('top-rated')
  async getTopRatedProducts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const products = await this.productsService.getTopRatedProducts(
      limit,
      languageId,
    );

    const response = products.map((p) => new ProductResponseDto(p));

    return {
      success: true,
      data: response,
      message: 'Top rated products retrieved successfully',
    };
  }

  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('brandIds') brandIds?: string,
    @Query('categoryIds') categoryIds?: string,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query('inStock') inStock?: string,
  ) {
    const filters: any = {};

    if (brandIds) {
      filters.brandIds = brandIds.split(',').map((id) => parseInt(id, 10));
    }
    if (categoryIds) {
      filters.categoryIds = categoryIds
        .split(',')
        .map((id) => parseInt(id, 10));
    }
    if (minPrice !== undefined) filters.minPrice = minPrice;
    if (maxPrice !== undefined) filters.maxPrice = maxPrice;
    if (inStock) filters.inStock = inStock === 'true';

    const products = await this.productsService.searchProducts(query, filters);

    const response = products.map((p) => new ProductResponseDto(p));

    return {
      success: true,
      data: response,
      message: 'Products found successfully',
    };
  }

  @Get(':id')
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

  @Get(':id/related')
  async getRelatedProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const products = await this.productsService.getRelatedProducts(
      id,
      limit,
      languageId,
    );

    const response = products.map((p) => new ProductResponseDto(p));

    return {
      success: true,
      data: response,
      message: 'Related products retrieved successfully',
    };
  }
}
