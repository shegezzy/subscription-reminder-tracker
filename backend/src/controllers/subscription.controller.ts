import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import { successResponse } from '../utils/api-response.js';
import { AppError } from '../utils/app-error.js';
import {
  createSubscription,
  deleteSubscription,
  getSubscription,
  listSubscriptions,
  updateSubscription,
} from '../services/subscription.service.js';
import {
  validateCreateSubscription,
  validateSubscriptionId,
  validateUpdateSubscription,
} from '../validators/subscription.validator.js';

function currentUserId(request: AuthenticatedRequest): string {
  if (!request.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication is required.');
  return request.user.id;
}

export async function list(request: AuthenticatedRequest, response: Response): Promise<void> {
  const subscriptions = await listSubscriptions(currentUserId(request));
  successResponse(response, { subscriptions });
}

export async function create(request: AuthenticatedRequest, response: Response): Promise<void> {
  const subscription = await createSubscription(
    currentUserId(request),
    validateCreateSubscription(request.body),
  );
  successResponse(response, { subscription }, 201);
}

export async function getById(request: AuthenticatedRequest, response: Response): Promise<void> {
  const subscription = await getSubscription(
    currentUserId(request),
    validateSubscriptionId(request.params.id),
  );
  successResponse(response, { subscription });
}

export async function update(request: AuthenticatedRequest, response: Response): Promise<void> {
  const subscription = await updateSubscription(
    currentUserId(request),
    validateSubscriptionId(request.params.id),
    validateUpdateSubscription(request.body),
  );
  successResponse(response, { subscription });
}

export async function remove(request: AuthenticatedRequest, response: Response): Promise<void> {
  await deleteSubscription(currentUserId(request), validateSubscriptionId(request.params.id));
  successResponse(response, { message: 'Subscription deleted.' });
}
