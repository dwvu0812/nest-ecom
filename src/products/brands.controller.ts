import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
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

  @Get('all')
  async getAllBrands(
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const brands = await this.brandsService.getAllBrands(languageId);

    return {
      success: true,
      data: brands,
      message: 'All brands retrieved successfully',
    };
  }

  @Get('search')
  async searchBrands(
    @Query('q') query: string,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const brands = await this.brandsService.searchBrands(query, languageId);

    return {
      success: true,
      data: brands,
      message: 'Brands found successfully',
    };
  }

  @Get(':id')
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
}
