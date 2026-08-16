import { AppError } from '../utils/app-error.js';

const currencies = ['NGN', 'USD', 'GBP', 'EUR'] as const;
const billingCycles = ['weekly', 'monthly', 'quarterly', 'yearly'] as const;

type Currency = (typeof currencies)[number];
type BillingCycle = (typeof billingCycles)[number];

export interface CreateSubscriptionInput {
  name: string;
  description?: string;
  amount: number;
  currency: Currency;
  billingCycle: BillingCycle;
  renewalDate: Date;
  category?: string;
  paymentMethod?: string;
  websiteUrl?: string;
  isTrial?: boolean;
  trialEndDate?: Date;
  reminderDays?: number[];
}

export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput> & { status?: 'active' | 'paused' | 'cancelled' };

const allowedFields = new Set([
  'name',
  'description',
  'amount',
  'currency',
  'billingCycle',
  'renewalDate',
  'category',
  'paymentMethod',
  'websiteUrl',
  'isTrial',
  'trialEndDate',
  'reminderDays',
]);

function invalid(message: string): never {
  throw new AppError(400, 'VALIDATION_ERROR', message);
}

function bodyAsRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return invalid('Request body must be an object.');
  }

  const record = body as Record<string, unknown>;
  for (const field of Object.keys(record)) {
    if (!allowedFields.has(field)) invalid(`Unsupported field: ${field}.`);
  }
  return record;
}

function stringValue(value: unknown, field: string, required = false): string | undefined {
  if (value === undefined) {
    if (required) invalid(`${field} is required.`);
    return undefined;
  }
  if (typeof value !== 'string') invalid(`${field} must be a string.`);
  const result = value.trim();
  if (required && !result) invalid(`${field} is required.`);
  return result || undefined;
}

function dateValue(value: unknown, field: string, required = false): Date | undefined {
  if (value === undefined) {
    if (required) invalid(`${field} is required.`);
    return undefined;
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return invalid(`${field} must be an ISO date (YYYY-MM-DD).`);
  }
  const result = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(result.getTime()) || result.toISOString().slice(0, 10) !== value) {
    return invalid(`${field} must be a valid calendar date.`);
  }
  return result;
}

function optionalText(value: unknown, field: string): string {
  const result = stringValue(value, field);
  if (!result) invalid(`${field} cannot be empty.`);
  if (result.length > 500) invalid(`${field} must be 500 characters or fewer.`);
  return result;
}

function reminderDaysValue(value: unknown): number[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0) {
    invalid('reminderDays must be a non-empty array of whole days between 0 and 365.');
  }

  const result: number[] = [];
  for (const day of value) {
    if (typeof day !== 'number' || !Number.isInteger(day) || day < 0 || day > 365) {
      invalid('reminderDays must be a non-empty array of whole days between 0 and 365.');
    }
    result.push(day);
  }
  return result;
}

function parseFields(body: Record<string, unknown>, requireAll: boolean): UpdateSubscriptionInput {
  const name = stringValue(body.name, 'name', requireAll);
  if (name && name.length > 120) invalid('name must be 120 characters or fewer.');

  const amount = body.amount;
  if (
    amount !== undefined &&
    (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0)
  ) {
    invalid('amount must be a non-negative number.');
  }
  if (requireAll && amount === undefined) invalid('amount is required.');

  const currencyValue = body.currency;
  if (
    currencyValue !== undefined &&
    (typeof currencyValue !== 'string' || !currencies.includes(currencyValue as Currency))
  ) {
    invalid('currency must be one of NGN, USD, GBP, or EUR.');
  }
  if (requireAll && currencyValue === undefined) invalid('currency is required.');

  const billingCycleValue = body.billingCycle;
  if (
    billingCycleValue !== undefined &&
    (typeof billingCycleValue !== 'string' ||
      !billingCycles.includes(billingCycleValue as BillingCycle))
  ) {
    invalid('billingCycle must be weekly, monthly, quarterly, or yearly.');
  }
  if (requireAll && billingCycleValue === undefined) invalid('billingCycle is required.');

  const isTrial = body.isTrial;
  if (isTrial !== undefined && typeof isTrial !== 'boolean') invalid('isTrial must be a boolean.');

  const renewalDate = dateValue(body.renewalDate, 'renewalDate', requireAll);
  const trialEndDate = dateValue(body.trialEndDate, 'trialEndDate');

  const reminderDays = reminderDaysValue(body.reminderDays);

  const result: UpdateSubscriptionInput = {
    ...(name !== undefined ? { name } : {}),
    ...(body.description !== undefined
      ? { description: optionalText(body.description, 'description') }
      : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(currencyValue !== undefined ? { currency: currencyValue as Currency } : {}),
    ...(billingCycleValue !== undefined ? { billingCycle: billingCycleValue as BillingCycle } : {}),
    ...(renewalDate !== undefined ? { renewalDate } : {}),
    ...(body.category !== undefined ? { category: optionalText(body.category, 'category') } : {}),
    ...(body.paymentMethod !== undefined
      ? { paymentMethod: optionalText(body.paymentMethod, 'paymentMethod') }
      : {}),
    ...(body.websiteUrl !== undefined
      ? { websiteUrl: optionalText(body.websiteUrl, 'websiteUrl') }
      : {}),
    ...(isTrial !== undefined ? { isTrial } : {}),
    ...(trialEndDate !== undefined ? { trialEndDate } : {}),
    ...(reminderDays !== undefined ? { reminderDays } : {}),
  };

  if (result.websiteUrl) {
    try {
      const url = new URL(result.websiteUrl);
      if (!['http:', 'https:'].includes(url.protocol))
        invalid('websiteUrl must use http or https.');
    } catch {
      invalid('websiteUrl must be a valid URL.');
    }
  }

  if (result.isTrial === true && !trialEndDate && requireAll) {
    invalid('trialEndDate is required when isTrial is true.');
  }

  return result;
}

export function validateCreateSubscription(body: unknown): CreateSubscriptionInput {
  return parseFields(bodyAsRecord(body), true) as CreateSubscriptionInput;
}

export function validateUpdateSubscription(body: unknown): UpdateSubscriptionInput {
  const result = parseFields(bodyAsRecord(body), false);
  if (Object.keys(result).length === 0)
    invalid('Provide at least one subscription field to update.');
  return result;
}

export function validateSubscriptionId(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Subscription id is invalid.');
  }
  return value;
}
