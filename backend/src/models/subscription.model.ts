import { model, models, Schema, type InferSchemaType, type Model } from 'mongoose';
export const billingCycles = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;
export const subscriptionStatuses = ['active', 'paused', 'cancelled'] as const;
const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Schema.Types.Decimal128, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, trim: true },
    billingCycle: { type: String, required: true, enum: billingCycles },
    renewalDate: { type: Date, required: true },
    category: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    status: { type: String, required: true, enum: subscriptionStatuses, default: 'active' },
    isTrial: { type: Boolean, required: true, default: false },
    trialEndDate: { type: Date },
    reminderDays: { type: [Number], required: true, default: [3] },
  },
  { timestamps: true },
);
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, renewalDate: 1 });
export type Subscription = InferSchemaType<typeof subscriptionSchema>;
export const SubscriptionModel: Model<Subscription> =
  models.Subscription ?? model<Subscription>('Subscription', subscriptionSchema);
