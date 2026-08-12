import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import sendResponse from '../../lib/response';
import { ProductStatus } from '@prisma/client';

export class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock, categoryId, status } = req.body;
      if (!name || !description || price === undefined || stock === undefined || !categoryId) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, price, stock, and categoryId are required fields',
        });
      }

      const result = await ProductService.createProduct({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId,
        status,
      });

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, status, search } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = categoryId as string;
      if (status) filters.status = status as ProductStatus;
      if (search) filters.search = search as string;

      const result = await ProductService.getAllProducts(filters);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Products retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProductService.getProductById(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProductService.updateProduct(id, req.body);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ProductService.deleteProduct(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product soft-deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
