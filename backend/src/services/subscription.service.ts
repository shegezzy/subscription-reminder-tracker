import { SubscriptionRepository } from '../repositories/subscription.repository.js';
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../validators/subscription.validator.js';
import { AppError } from '../utils/app-error.js';

const repository = new SubscriptionRepository();

function notFound(): never {
  throw new AppError(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found.');
}

export function createSubscription(userId: string, input: CreateSubscriptionInput) {
  return repository.create(userId, input);
}

export function listSubscriptions(userId: string) {
  return repository.listByUser(userId);
}

export async function getSubscription(userId: string, subscriptionId: string) {
  return (await repository.findByIdForUser(userId, subscriptionId)) ?? notFound();
}

export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  input: UpdateSubscriptionInput,
) {
  return (await repository.updateByIdForUser(userId, subscriptionId, input)) ?? notFound();
}

export async function deleteSubscription(userId: string, subscriptionId: string) {
  const subscription = await repository.deleteByIdForUser(userId, subscriptionId);
  if (!subscription) notFound();
}
