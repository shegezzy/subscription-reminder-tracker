import { Router } from 'express';
import { changeStatus, create, getById, list, remove, update } from '../controllers/subscription.controller.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate } from '../middleware/authenticate.js';
import type { AuthConfig } from '../types/auth.js';

export function createSubscriptionRouter(config: AuthConfig): Router {
  const router = Router();
  router.use(authenticate(config));
  router.route('/').get(asyncHandler(list)).post(asyncHandler(create));
  router
    .route('/:id')
    .get(asyncHandler(getById))
    .patch(asyncHandler(update))
    .delete(asyncHandler(remove));
  router.patch('/:id/status/:status', asyncHandler(changeStatus));
  return router;
}
