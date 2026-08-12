import { Router } from 'express';
import { OrderController } from '../services/order/order.controller';
import { authenticate, authorize } from '../lib/auth.middleware';

const router = Router();

// Authenticated routes
router.post('/', authenticate as any, OrderController.createOrder as any);
router.get('/', authenticate as any, OrderController.getAllOrders as any);
router.get('/:id', authenticate as any, OrderController.getOrderById as any);
router.delete('/:id', authenticate as any, OrderController.deleteOrder as any);

// Admin-only order status update route
router.patch('/:id/status', authenticate as any, authorize('ADMIN') as any, OrderController.updateOrderStatus as any);

export default router;
