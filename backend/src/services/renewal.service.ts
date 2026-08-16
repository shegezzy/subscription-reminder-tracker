import { addMonths, addQuarters, addWeeks, addYears } from 'date-fns';
import type { billingCycles } from '../models/subscription.model.js';

export type BillingCycle = (typeof billingCycles)[number];

function toLocalCalendarDate(date: Date): Date {
  // Persisted renewal dates are UTC date-only values. Use local midday solely
  // for date-fns calendar arithmetic, avoiding local-midnight DST boundaries.
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12);
}

function toUtcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/** Calculates a renewal using calendar arithmetic while preserving its UTC date. */
export function calculateNextRenewalDate(renewalDate: Date, billingCycle: BillingCycle): Date {
  const calendarDate = toLocalCalendarDate(renewalDate);
  const nextDate = {
    weekly: () => addWeeks(calendarDate, 1),
    monthly: () => addMonths(calendarDate, 1),
    quarterly: () => addQuarters(calendarDate, 1),
    yearly: () => addYears(calendarDate, 1),
  }[billingCycle]();
  return toUtcMidnight(nextDate);
}
