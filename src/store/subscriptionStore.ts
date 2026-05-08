import { create } from 'zustand';
import { Subscription, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import {
  saveSubscriptions,
  loadSubscriptions,
  saveSettings,
  loadSettings,
} from '../services/storageService';
import {
  scheduleRenewalReminder,
  cancelNotification,
  cancelAllNotifications,
} from '../services/notificationService';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface SubscriptionStore {
  subscriptions: Subscription[];
  settings: AppSettings;
  isLoading: boolean;

  // Actions
  loadFromStorage: () => Promise<void>;
  addSubscription: (sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  rescheduleAllNotifications: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  subscriptions: [],
  settings: DEFAULT_SETTINGS,
  isLoading: true,

  /** Load persisted data from AsyncStorage on app start */
  loadFromStorage: async () => {
    set({ isLoading: true });
    const [subscriptions, settings] = await Promise.all([
      loadSubscriptions(),
      loadSettings(),
    ]);
    set({ subscriptions, settings, isLoading: false });
  },

  /** Add a new subscription and persist */
  addSubscription: async (subData) => {
    const now = new Date().toISOString();
    const newSub: Subscription = {
      ...subData,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    // Schedule a notification if enabled
    if (get().settings.notificationsEnabled) {
      const notifId = await scheduleRenewalReminder(newSub);
      if (notifId) newSub.notificationId = notifId;
    }

    const updated = [...get().subscriptions, newSub];
    set({ subscriptions: updated });
    await saveSubscriptions(updated);
  },

  /** Update an existing subscription by ID */
  updateSubscription: async (id, updates) => {
    const current = get().subscriptions;
    const index = current.findIndex((s) => s.id === id);
    if (index === -1) return;

    const existing = current[index];

    // Cancel old notification before scheduling new one
    if (existing.notificationId) {
      await cancelNotification(existing.notificationId);
    }

    const updated = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
      notificationId: undefined as string | undefined,
    };

    // Re-schedule notification for updated data
    if (get().settings.notificationsEnabled) {
      const notifId = await scheduleRenewalReminder(updated);
      if (notifId) updated.notificationId = notifId;
    }

    const updatedList = [...current];
    updatedList[index] = updated;
    set({ subscriptions: updatedList });
    await saveSubscriptions(updatedList);
  },

  /** Delete a subscription and cancel its notification */
  deleteSubscription: async (id) => {
    const current = get().subscriptions;
    const sub = current.find((s) => s.id === id);

    if (sub?.notificationId) {
      await cancelNotification(sub.notificationId);
    }

    const updated = current.filter((s) => s.id !== id);
    set({ subscriptions: updated });
    await saveSubscriptions(updated);
  },

  /** Update app settings and persist */
  updateSettings: async (updates) => {
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    await saveSettings(newSettings);

    // If notifications were just disabled, cancel all scheduled ones
    if (updates.notificationsEnabled === false) {
      await cancelAllNotifications();
      // Clear notification IDs from subscriptions
      const cleared = get().subscriptions.map((s) => ({ ...s, notificationId: undefined }));
      set({ subscriptions: cleared });
      await saveSubscriptions(cleared);
    }
  },

  /** Re-schedule notifications for all active subscriptions (e.g. after settings change) */
  rescheduleAllNotifications: async () => {
    await cancelAllNotifications();
    const { subscriptions, settings } = get();
    if (!settings.notificationsEnabled) return;

    const updated = await Promise.all(
      subscriptions.map(async (sub) => {
        const notifId = await scheduleRenewalReminder(sub);
        return { ...sub, notificationId: notifId ?? undefined };
      })
    );
    set({ subscriptions: updated });
    await saveSubscriptions(updated);
  },
}));
