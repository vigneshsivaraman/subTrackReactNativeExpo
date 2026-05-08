export * from './colors';
export * from './categories';
export * from './currencies';

// App-wide constants
export const APP_NAME = 'SubTrack';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  SUBSCRIPTIONS: '@subtrack_subscriptions',
  SETTINGS: '@subtrack_settings',
} as const;

export const DEFAULT_SETTINGS = {
  themeMode: 'dark' as const,
  defaultCurrency: 'INR',
  notificationsEnabled: true,
  defaultReminderDays: 3,
};

export const BILLING_CYCLES = [
  { key: 'monthly',   label: 'Monthly',   multiplier: 1    },
  { key: 'yearly',    label: 'Yearly',    multiplier: 1/12 },
  { key: 'weekly',    label: 'Weekly',    multiplier: 52/12},
  { key: 'quarterly', label: 'Quarterly', multiplier: 1/3  },
] as const;

/** Days considered "upcoming" for renewal badge/section */
export const UPCOMING_DAYS_THRESHOLD = 7;
