import { getCurrencySymbol } from '../constants/currencies';

/**
 * Format a numeric amount with currency symbol.
 * e.g. formatAmount(999, 'INR') → '₹999.00'
 */
export const formatAmount = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a compact amount (no decimals for whole numbers).
 */
export const formatAmountCompact = (amount: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  if (amount % 1 === 0) {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
