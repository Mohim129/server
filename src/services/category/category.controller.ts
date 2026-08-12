import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import sendResponse from '../../lib/response';
import { CategoryStatus } from '@prisma/client';

export class CategoryController {
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, status } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }

      const result = await CategoryService.createCategory({ name, status });
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Category created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const filters: any = {};
      if (status) filters.status = status as CategoryStatus;

      const result = await CategoryService.getAllCategories(filters);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Categories retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CategoryService.getCategoryById(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Category retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CategoryService.updateCategory(id, req.body);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Category updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CategoryService.deleteCategory(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Category soft-deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
