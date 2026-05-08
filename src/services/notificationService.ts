import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Subscription } from '../types';
import { addDays, parseLocalDate } from '../utils/dateUtils';

// Configure how notifications are presented when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Permission ───────────────────────────────────────────────────────────────

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    // Notifications only work on physical devices
    return false;
  }

  if (Platform.OS === 'android') {
    // Android 13+ requires explicit permission
    await Notifications.setNotificationChannelAsync('renewals', {
      name: 'Subscription Renewals',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// ─── Schedule Reminder ────────────────────────────────────────────────────────

/**
 * Schedules a local notification `reminderDays` before the renewal date.
 * Returns the notification identifier (to store for later cancellation).
 */
export const scheduleRenewalReminder = async (
  subscription: Subscription
): Promise<string | null> => {
  try {
    const renewalDate = parseLocalDate(subscription.renewalDate);
    // Trigger date = renewalDate minus reminderDays
    const triggerDate = addDays(renewalDate, -subscription.reminderDays);
    triggerDate.setHours(9, 0, 0, 0); // 9:00 AM on reminder day

    // Don't schedule if the trigger is in the past
    if (triggerDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${subscription.name} renews soon!`,
        body: `Your ${subscription.name} subscription renews in ${subscription.reminderDays} day(s). Amount: ${subscription.currency} ${subscription.amount}.`,
        data: { subscriptionId: subscription.id },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  } catch (error) {
    console.error('[NotificationService] Failed to schedule notification:', error);
    return null;
  }
};

// ─── Cancel Notification ──────────────────────────────────────────────────────

export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('[NotificationService] Failed to cancel notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[NotificationService] Failed to cancel all notifications:', error);
  }
};
