import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';
import sendResponse from '../../lib/response';
import { AuthRequest } from '../../lib/auth.middleware';
import { ReviewStatus } from '@prisma/client';

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rating, comment, productId, status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (rating === undefined || !comment || !productId) {
        return res.status(400).json({
          success: false,
          message: 'Rating, comment, and productId are required fields',
        });
      }

      const result = await ReviewService.createReview({
        rating: Number(rating),
        comment,
        userId,
        productId,
        status,
      });

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Review created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, status } = req.query;
      const filters: any = {};
      if (productId) filters.productId = productId as string;
      if (status) filters.status = status as ReviewStatus;

      const result = await ReviewService.getAllReviews(filters);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Reviews retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ReviewService.getReviewById(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requester = req.user;

      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await ReviewService.updateReview(id, req.body, requester);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requester = req.user;

      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await ReviewService.deleteReview(id, requester);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Review deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
