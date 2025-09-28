import { Injectable } from '@nestjs/common';
import { FileUpload } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { UploadCategory } from '../constants/upload.constants';

export interface FileUploadSearchOptions {
  uploadedBy?: number;
  category?: UploadCategory;
  mimetype?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface FileUploadCreateData {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  category: string;
  path: string;
  url: string;
  description: string | null;
  uploadedBy: number;
  thumbnail?: string | null;
}

@Injectable()
export class FileUploadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: FileUploadCreateData): Promise<FileUpload> {
    return this.prisma.fileUpload.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findUnique(where: { id: string }): Promise<FileUpload | null> {
    return this.prisma.fileUpload.findUnique({ where });
  }

  async findMany(args?: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<FileUpload[]> {
    return this.prisma.fileUpload.findMany({
      ...args,
      where: { ...args?.where, deletedAt: null },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.fileUpload.count({
      where: { ...where, deletedAt: null },
    });
  }

  async softDelete(where: { id: string }): Promise<FileUpload> {
    return this.prisma.fileUpload.update({
      where,
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findManyWithPagination(args: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }) {
    const { where, orderBy, skip = 0, take = 10 } = args;
    const whereClause = { ...where, deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.fileUpload.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
      }),
      this.prisma.fileUpload.count({ where: whereClause }),
    ]);

    const page = Math.floor(skip / take) + 1;
    const totalPages = Math.ceil(total / take);

    return {
      data,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  async findByUser(
    userId: number,
    options: {
      category?: UploadCategory;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { category, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      uploadedBy: userId,
      deletedAt: null,
    };

    if (category) {
      where.category = category;
    }

    return this.findManyWithPagination({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCategory(category: UploadCategory, limit = 50) {
    return this.findMany({
      where: {
        category,
        deletedAt: null,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUploadStats(userId?: number) {
    const baseWhere = userId ? { uploadedBy: userId } : {};

    const [totalFiles, totalSize, filesByCategory] = await Promise.all([
      this.count({ ...baseWhere, deletedAt: null }),

      // Get total size
      this.prisma.fileUpload.aggregate({
        where: { ...baseWhere, deletedAt: null },
        _sum: { size: true },
      }),

      // Get files by category
      this.prisma.fileUpload.groupBy({
        by: ['category'],
        where: { ...baseWhere, deletedAt: null },
        _count: { _all: true },
        _sum: { size: true },
      }),
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      filesByCategory,
    };
  }

  async deleteFilesByUser(userId: number, fileIds: string[]) {
    return this.prisma.fileUpload.updateMany({
      where: {
        id: { in: fileIds },
        uploadedBy: userId,
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findRecentUploads(userId?: number, limit = 10) {
    const where = userId
      ? { uploadedBy: userId, deletedAt: null }
      : { deletedAt: null };

    return this.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async searchFiles(searchTerm: string, options: FileUploadSearchOptions = {}) {
    const { uploadedBy, category, mimetype, dateFrom, dateTo } = options;

    const where: any = {
      deletedAt: null,
      OR: [
        { originalName: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (uploadedBy) where.uploadedBy = uploadedBy;
    if (category) where.category = category;
    if (mimetype) where.mimetype = mimetype;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    return this.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
