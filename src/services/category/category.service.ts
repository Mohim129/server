import { prisma } from '../../lib/prisma';
import { CategoryStatus } from '@prisma/client';

export interface CategoryDTO {
  name: string;
  status?: CategoryStatus;
}

export class CategoryService {
  static async createCategory(data: CategoryDTO) {
    const existing = await prisma.category.findFirst({
      where: {
        name: data.name,
        isDeleted: false,
      },
    });

    if (existing) {
      const error: any = new Error('Category name already exists');
      error.statusCode = 400;
      throw error;
    }

    return prisma.category.create({
      data: {
        name: data.name,
        status: data.status || 'ACTIVE',
      },
    });
  }

  static async getAllCategories(filters: { status?: CategoryStatus } = {}) {
    const whereClause: any = { isDeleted: false };
    if (filters.status) whereClause.status = filters.status;

    return prisma.category.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, isDeleted: false },
    });

    if (!category) {
      const error: any = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  static async updateCategory(id: string, data: CategoryDTO) {
    await this.getCategoryById(id);

    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          isDeleted: false,
        },
      });

      if (existing) {
        const error: any = new Error('Category name already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    await this.getCategoryById(id);

    // Soft delete Category
    return prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
