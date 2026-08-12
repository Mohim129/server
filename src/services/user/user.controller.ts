import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import sendResponse from '../../lib/response';
import { AuthRequest } from '../../lib/auth.middleware';
import { UserRole, UserStatus } from '@prisma/client';

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status } = req.query;
      const filters: any = {};
      if (role) filters.role = role as UserRole;
      if (status) filters.status = status as UserStatus;

      const result = await UserService.getAllUsers(filters);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const result = await UserService.getUserById(userId);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserById(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Restrict users from updating their own role or status
      const { name, email, password } = req.body;
      const result = await UserService.updateUser(userId, { name, email, password });
      
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await UserService.updateUser(id, req.body);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User soft-deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
