import { prisma } from '../../lib/prisma';
import { ProductStatus } from '@prisma/client';

export interface ProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  status?: ProductStatus;
}

export class ProductService {
  static async createProduct(data: ProductDTO) {
    // Verify category exists and is not deleted
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, isDeleted: false },
    });

    if (!category) {
      const error: any = new Error('Category not found or has been deleted');
      error.statusCode = 400;
      throw error;
    }

    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        status: data.status || 'ACTIVE',
      },
      include: {
        category: true,
      },
    });
  }

  static async getAllProducts(filters: { categoryId?: string; status?: ProductStatus; search?: string } = {}) {
    const whereClause: any = { isDeleted: false };

    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: true,
        reviews: {
          where: { isDeleted: false },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      const error: any = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  static async updateProduct(id: string, data: Partial<ProductDTO>) {
    await this.getProductById(id);

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, isDeleted: false },
      });
      if (!category) {
        const error: any = new Error('Category not found or has been deleted');
        error.statusCode = 400;
        throw error;
      }
    }

    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  static async deleteProduct(id: string) {
    await this.getProductById(id);

    return prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
