import { prisma } from '../../lib/prisma';
import { ReviewStatus } from '@prisma/client';

export interface ReviewDTO {
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  status?: ReviewStatus;
}

export class ReviewService {
  static async createReview(data: ReviewDTO) {
    // Check if product exists and is not deleted
    const product = await prisma.product.findFirst({
      where: { id: data.productId, isDeleted: false },
    });

    if (!product) {
      const error: any = new Error('Product not found or has been deleted');
      error.statusCode = 400;
      throw error;
    }

    return prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId: data.userId,
        productId: data.productId,
        status: data.status || 'PENDING',
      },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getAllReviews(filters: { productId?: string; status?: ReviewStatus } = {}) {
    const whereClause: any = { isDeleted: false };
    if (filters.productId) whereClause.productId = filters.productId;
    if (filters.status) whereClause.status = filters.status;

    return prisma.review.findMany({
      where: whereClause,
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getReviewById(id: string) {
    const review = await prisma.review.findFirst({
      where: { id, isDeleted: false },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!review) {
      const error: any = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    return review;
  }

  static async updateReview(
    id: string,
    data: Partial<ReviewDTO>,
    requester: { id: string; role: 'ADMIN' | 'USER' }
  ) {
    const review = await this.getReviewById(id);

    // Enforce authorization: Users can only update their own reviews; Admins can update any.
    if (requester.role !== 'ADMIN' && review.userId !== requester.id) {
      const error: any = new Error('Forbidden: You can only update your own reviews');
      error.statusCode = 403;
      throw error;
    }

    return prisma.review.update({
      where: { id },
      data,
      include: {
        product: true,
      },
    });
  }

  static async deleteReview(id: string, requester: { id: string; role: 'ADMIN' | 'USER' }) {
    const review = await this.getReviewById(id);

    // Enforce authorization: Users can only delete their own reviews; Admins can delete any.
    if (requester.role !== 'ADMIN' && review.userId !== requester.id) {
      const error: any = new Error('Forbidden: You can only delete your own reviews');
      error.statusCode = 403;
      throw error;
    }

    return prisma.review.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
