import { Router } from 'express';
import { UserController } from '../services/user/user.controller';
import { authenticate, authorize } from '../lib/auth.middleware';

const router = Router();

// Regular users can access their own profile
router.get('/me', authenticate as any, UserController.getMyProfile as any);
router.put('/me', authenticate as any, UserController.updateMyProfile as any);

// Admins can manage all users
router.get('/', authenticate as any, authorize('ADMIN') as any, UserController.getAllUsers as any);
router.get('/:id', authenticate as any, authorize('ADMIN') as any, UserController.getUserById as any);
router.put('/:id', authenticate as any, authorize('ADMIN') as any, UserController.updateUser as any);
router.delete('/:id', authenticate as any, authorize('ADMIN') as any, UserController.deleteUser as any);

export default router;
