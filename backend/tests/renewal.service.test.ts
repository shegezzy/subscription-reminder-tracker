import { describe, expect, it } from 'vitest';
import { calculateNextRenewalDate } from '../src/services/renewal.service.js';

function date(value: string): Date { return new Date(`${value}T00:00:00.000Z`); }
function iso(value: Date): string { return value.toISOString().slice(0, 10); }

describe('renewal calculation engine', () => {
  it('calculates weekly renewals using calendar weeks', () => expect(iso(calculateNextRenewalDate(date('2026-03-01'), 'weekly'))).toBe('2026-03-08'));
  it('clamps January 31 to the last valid day in February', () => expect(iso(calculateNextRenewalDate(date('2025-01-31'), 'monthly'))).toBe('2025-02-28'));
  it('preserves leap-day renewal behavior', () => expect(iso(calculateNextRenewalDate(date('2024-02-29'), 'yearly'))).toBe('2025-02-28'));
  it('calculates quarter and year month-end renewals', () => {
    expect(iso(calculateNextRenewalDate(date('2025-11-30'), 'quarterly'))).toBe('2026-02-28');
    expect(iso(calculateNextRenewalDate(date('2024-02-29'), 'yearly'))).toBe('2025-02-28');
  });
  it('uses the stored UTC calendar date regardless of the input timezone', () => {
    const result = calculateNextRenewalDate(new Date('2026-03-08T23:30:00-05:00'), 'monthly');
    expect(result.toISOString()).toBe('2026-04-09T00:00:00.000Z');
  });
});
