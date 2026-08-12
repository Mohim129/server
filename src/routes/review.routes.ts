import { Router } from 'express';
import { ReviewController } from '../services/review/review.controller';
import { authenticate } from '../lib/auth.middleware';

const router = Router();

// Public routes
router.get('/', ReviewController.getAllReviews);
router.get('/:id', ReviewController.getReviewById);

// Authenticated routes
router.post('/', authenticate as any, ReviewController.createReview as any);
router.put('/:id', authenticate as any, ReviewController.updateReview as any);
router.delete('/:id', authenticate as any, ReviewController.deleteReview as any);

export default router;
