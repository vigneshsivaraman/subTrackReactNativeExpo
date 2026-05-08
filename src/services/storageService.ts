import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const saveSubscriptions = async (subscriptions: Subscription[]): Promise<void> => {
  try {
    const json = JSON.stringify(subscriptions);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, json);
  } catch (error) {
    console.error('[StorageService] Failed to save subscriptions:', error);
    throw error;
  }
};

export const loadSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!json) return [];
    return JSON.parse(json) as Subscription[];
  } catch (error) {
    console.error('[StorageService] Failed to load subscriptions:', error);
    return [];
  }
};

// ─── Settings ─────────────────────────────────────────────────────────────────

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const json = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, json);
  } catch (error) {
    console.error('[StorageService] Failed to save settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!json) return DEFAULT_SETTINGS;
    // Merge with defaults to handle missing keys after app updates
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) } as AppSettings;
  } catch (error) {
    console.error('[StorageService] Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// ─── Clear All ────────────────────────────────────────────────────────────────

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('[StorageService] Failed to clear all data:', error);
    throw error;
  }
};
