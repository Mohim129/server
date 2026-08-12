import { Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import sendResponse from '../../lib/response';
import { AuthRequest } from '../../lib/auth.middleware';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!productId || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'ProductId and quantity are required fields',
        });
      }

      if (Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive integer',
        });
      }

      const result = await OrderService.createOrder({
        productId,
        quantity: Number(quantity),
        userId,
        status,
      });

      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Order placed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const requester = req.user;
      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { status } = req.query;
      const filters: any = {};
      if (status) filters.status = status as OrderStatus;

      const result = await OrderService.getAllOrders(requester, filters);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Orders retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requester = req.user;

      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await OrderService.getOrderById(id, requester);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const requester = req.user;

      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const result = await OrderService.updateOrderStatus(id, status as OrderStatus, requester);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order status updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requester = req.user;

      if (!requester) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await OrderService.deleteOrder(id, requester);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Order soft-deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
