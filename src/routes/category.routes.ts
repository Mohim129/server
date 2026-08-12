import { Router } from 'express';
import { CategoryController } from '../services/category/category.controller';
import { authenticate, authorize } from '../lib/auth.middleware';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin-only routes
router.post('/', authenticate as any, authorize('ADMIN') as any, CategoryController.createCategory as any);
router.put('/:id', authenticate as any, authorize('ADMIN') as any, CategoryController.updateCategory as any);
router.delete('/:id', authenticate as any, authorize('ADMIN') as any, CategoryController.deleteCategory as any);

export default router;
