import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import sendResponse from '../../lib/response';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }
      
      const result = await AuthService.register({ name, email, password, role });
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const result = await AuthService.login({ email, password });
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
