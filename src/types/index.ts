// ─── Subscription ───────────────────────────────────────────────────────────

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export type SubscriptionCategory =
  | 'entertainment'
  | 'productivity'
  | 'cloud'
  | 'music'
  | 'gaming'
  | 'fitness'
  | 'news'
  | 'education'
  | 'finance'
  | 'other';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;       // e.g. 'INR', 'USD'
  billingCycle: BillingCycle;
  renewalDate: string;    // ISO date string YYYY-MM-DD
  category: SubscriptionCategory;
  reminderDays: number;   // days before renewal to notify
  isActive: boolean;
  notificationId?: string; // Expo notification identifier
  color?: string;           // optional accent color override
  createdAt: string;        // ISO date string
  updatedAt: string;        // ISO date string
}

// ─── App Settings ────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  themeMode: ThemeMode;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  defaultReminderDays: number;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface CategoryStat {
  category: SubscriptionCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface SubscriptionStats {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  overdueCount: number;
  upcomingCount: number;     // due within 7 days
  byCategory: CategoryStat[];
  nextRenewal: Subscription | null;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  AddEditSubscription: { subscriptionId?: string } | undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Settings: undefined;
};

// ─── Form ────────────────────────────────────────────────────────────────────

export interface SubscriptionFormData {
  name: string;
  amount: string;         // string for form input, parsed to number on save
  currency: string;
  billingCycle: BillingCycle;
  renewalDate: string;    // YYYY-MM-DD
  category: SubscriptionCategory;
  reminderDays: string;   // string for form input
}

// ─── Currency ────────────────────────────────────────────────────────────────

export interface Currency {
  code: string;   // e.g. 'INR'
  symbol: string; // e.g. '₹'
  name: string;   // e.g. 'Indian Rupee'
}

// ─── Category Meta ────────────────────────────────────────────────────────────

export interface CategoryMeta {
  key: SubscriptionCategory;
  label: string;
  icon: string;   // @expo/vector-icons MaterialCommunityIcons name
  color: string;  // hex color
}
