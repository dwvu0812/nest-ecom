import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { ResourceException } from '../shared/exceptions';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll() {
    const languages = await this.languagesService.findAll();
    return {
      success: true,
      data: languages,
      message: 'Languages retrieved successfully',
    };
  }

  @Get(':languageId')
  async findOne(@Param('languageId', ParseIntPipe) languageId: number) {
    const language = await this.languagesService.findById(languageId);

    if (!language) {
      throw ResourceException.notFound('Language not found');
    }

    return {
      success: true,
      data: language,
      message: 'Language retrieved successfully',
    };
  }

  @Post()
  async create(
    @Body() createLanguageDto: CreateLanguageDto,
    @CurrentUser() user?: User,
  ) {
    if (user?.id) {
      createLanguageDto.createdById = user.id;
    }

    const language = await this.languagesService.create(createLanguageDto);

    return {
      success: true,
      data: language,
      message: 'Language created successfully',
    };
  }

  @Put(':languageId')
  async update(
    @Param('languageId', ParseIntPipe) languageId: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
    @CurrentUser() user?: User,
  ) {
    if (user?.id) {
      updateLanguageDto.updatedById = user.id;
    }

    const language = await this.languagesService.update(
      languageId,
      updateLanguageDto,
    );

    return {
      success: true,
      data: language,
      message: 'Language updated successfully',
    };
  }

  @Delete(':languageId')
  async remove(
    @Param('languageId', ParseIntPipe) languageId: number,
    @CurrentUser() user?: User,
  ) {
    const language = await this.languagesService.remove(languageId, user?.id);

    return {
      success: true,
      data: language,
      message: 'Language deleted successfully',
    };
  }
}
