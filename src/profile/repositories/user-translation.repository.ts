import { Injectable } from '@nestjs/common';
import { UserTranslation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base-repository';

export interface UserTranslationWithLanguage extends UserTranslation {
  language?: {
    id: number;
    code: string;
    name: string;
  };
}

@Injectable()
export class UserTranslationRepository extends BaseRepository<UserTranslation> {
  protected modelName = 'userTranslation';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByUserIdAndLanguageId(
    userId: number,
    languageId: number,
  ): Promise<UserTranslationWithLanguage | null> {
    return this.model.findFirst({
      where: {
        userId,
        languageId,
        deletedAt: null,
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByUserId(
    userId: number,
  ): Promise<UserTranslationWithLanguage[]> {
    return this.model.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createTranslation(data: {
    userId: number;
    languageId: number;
    address?: string;
    description?: string;
    createdById?: number;
  }): Promise<UserTranslationWithLanguage> {
    return this.model.create({
      data: {
        userId: data.userId,
        languageId: data.languageId,
        address: data.address,
        description: data.description,
        createdById: data.createdById,
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async updateTranslation(
    id: number,
    data: {
      address?: string;
      description?: string;
      updatedById?: number;
    },
  ): Promise<UserTranslationWithLanguage> {
    return this.model.update({
      where: { id },
      data: {
        address: data.address,
        description: data.description,
        updatedById: data.updatedById,
      },
      include: {
        language: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteTranslation(
    id: number,
    deletedById?: number,
  ): Promise<UserTranslation> {
    return this.softDelete({ id }, deletedById);
  }
}
