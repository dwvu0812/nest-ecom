import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { LanguageRepository } from './repositories/language.repository';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ResourceException } from '../shared/exceptions';

@Injectable()
export class LanguagesService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async findAll(): Promise<Language[]> {
    return this.languageRepository.findAllActive();
  }

  async findById(id: number): Promise<Language | null> {
    const language = await this.languageRepository.findUnique({ id });

    if (!language || language.deletedAt) {
      return null;
    }

    return language;
  }

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    const { name, code, createdById } = createLanguageDto;

    // Check if code already exists
    const existingLanguage = await this.languageRepository.existsByCode(code);
    if (existingLanguage) {
      throw ResourceException.alreadyExists('Language code already exists');
    }

    return this.languageRepository.create({
      name,
      code,
      createdById,
      updatedById: createdById,
    });
  }

  async update(
    id: number,
    updateLanguageDto: UpdateLanguageDto,
  ): Promise<Language> {
    const { name, code, updatedById } = updateLanguageDto;

    // Check if language exists
    const existingLanguage = await this.findById(id);
    if (!existingLanguage) {
      throw ResourceException.notFound('Language not found');
    }

    // Check if code already exists for another language
    if (code && (await this.languageRepository.existsByCode(code, id))) {
      throw ResourceException.alreadyExists('Language code already exists');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (updatedById !== undefined) updateData.updatedById = updatedById;

    return this.languageRepository.update({ id }, updateData);
  }

  async remove(id: number, deletedBy?: number): Promise<Language> {
    // Check if language exists
    const existingLanguage = await this.findById(id);
    if (!existingLanguage) {
      throw ResourceException.notFound('Language not found');
    }

    return this.languageRepository.softDelete({ id }, deletedBy);
  }
}
