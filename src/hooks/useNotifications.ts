import { useEffect } from 'react';
import { requestNotificationPermissions } from '../services/notificationService';
import { useSubscriptionStore } from '../store/subscriptionStore';

/**
 * Requests notification permissions on mount if notifications are enabled in settings.
 * Returns the granted state.
 */
export const useNotifications = () => {
  const notificationsEnabled = useSubscriptionStore((s) => s.settings.notificationsEnabled);

  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermissions().catch(console.error);
    }
  }, [notificationsEnabled]);

  return { notificationsEnabled };
};
