import { BillingCycle } from '../types';

/**
 * Parse a YYYY-MM-DD string as a local date (avoids UTC offset issues).
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a Date to YYYY-MM-DD string.
 */
export const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Format a YYYY-MM-DD string for human display (e.g. "May 15, 2025").
 */
export const formatDisplayDate = (dateStr: string): string => {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Add `days` to a Date (returns new Date).
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Number of calendar days from today to `dateStr` (negative if past).
 */
export const daysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = parseLocalDate(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

/**
 * Returns true if the renewal date has already passed.
 */
export const isOverdue = (dateStr: string): boolean => daysUntil(dateStr) < 0;

/**
 * Returns true if renewal is within `threshold` days (and not overdue).
 */
export const isUpcoming = (dateStr: string, threshold = 7): boolean => {
  const days = daysUntil(dateStr);
  return days >= 0 && days <= threshold;
};

/**
 * Short relative label: "Today", "Tomorrow", "3 days", "Overdue", "May 15".
 */
export const relativeRenewalLabel = (dateStr: string): string => {
  const days = daysUntil(dateStr);
  if (days < 0)  return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7)  return `${days} days`;
  return formatDisplayDate(dateStr);
};

/**
 * Convert any billing cycle amount to monthly equivalent.
 */
export const toMonthlyAmount = (amount: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'weekly':    return (amount * 52) / 12;
    case 'monthly':   return amount;
    case 'quarterly': return amount / 3;
    case 'yearly':    return amount / 12;
    default:          return amount;
  }
};

/**
 * Today's date as YYYY-MM-DD string.
 */
export const todayString = (): string => toDateString(new Date());
