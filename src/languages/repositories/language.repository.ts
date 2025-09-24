import { Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../shared/repositories/base-repository';

@Injectable()
export class LanguageRepository extends BaseRepository<Language> {
  protected modelName = 'language';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.model.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async findAllActive(): Promise<Language[]> {
    return this.model.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async existsByCode(code: string, excludeId?: number): Promise<boolean> {
    const whereClause: any = {
      code,
      deletedAt: null,
    };

    if (excludeId) {
      whereClause.id = {
        not: excludeId,
      };
    }

    const count = await this.model.count({
      where: whereClause,
    });

    return count > 0;
  }
}
