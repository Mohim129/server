import { Router } from 'express';
import { ProductController } from '../services/product/product.controller';
import { authenticate, authorize } from '../lib/auth.middleware';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Admin-only routes
router.post('/', authenticate as any, authorize('ADMIN') as any, ProductController.createProduct as any);
router.put('/:id', authenticate as any, authorize('ADMIN') as any, ProductController.updateProduct as any);
router.delete('/:id', authenticate as any, authorize('ADMIN') as any, ProductController.deleteProduct as any);

export default router;
