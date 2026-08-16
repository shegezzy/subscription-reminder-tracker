import { SubscriptionModel } from '../models/subscription.model.js';
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../validators/subscription.validator.js';

export class SubscriptionRepository {
  public create(userId: string, input: CreateSubscriptionInput) {
    return SubscriptionModel.create({ userId, ...input });
  }

  public listByUser(userId: string) {
    return SubscriptionModel.find({ userId }).sort({ renewalDate: 1 }).lean();
  }

  public findByIdForUser(userId: string, subscriptionId: string) {
    return SubscriptionModel.findOne({ _id: subscriptionId, userId }).lean();
  }

  public updateByIdForUser(userId: string, subscriptionId: string, input: UpdateSubscriptionInput) {
    return SubscriptionModel.findOneAndUpdate(
      { _id: subscriptionId, userId },
      { $set: input },
      { new: true, runValidators: true },
    ).lean();
  }

  public deleteByIdForUser(userId: string, subscriptionId: string) {
    return SubscriptionModel.findOneAndDelete({ _id: subscriptionId, userId }).lean();
  }
}
