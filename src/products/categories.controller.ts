import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('tree')
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

  @Get()
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

  @Get('search')
  async searchCategories(
    @Query('q') query: string,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const categories = await this.categoriesService.searchCategories(
      query,
      languageId,
    );

    return {
      success: true,
      data: categories,
      message: 'Categories found successfully',
    };
  }

  @Get(':id')
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

  @Get(':id/children')
  async getCategoryWithChildren(
    @Param('id', ParseIntPipe) id: number,
    @Query('languageId', new ParseIntPipe({ optional: true }))
    languageId?: number,
  ) {
    const category = await this.categoriesService.getCategoryWithChildren(
      id,
      languageId,
    );

    return {
      success: true,
      data: category,
      message: 'Category with children retrieved successfully',
    };
  }
}
