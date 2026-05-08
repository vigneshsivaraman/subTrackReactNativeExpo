import { useColorScheme } from 'react-native';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { LightColors, DarkColors, AppColors } from '../constants/colors';

/**
 * Returns the correct color palette based on the current theme setting.
 * Falls back to system preference when themeMode = 'system'.
 */
export const useTheme = (): { colors: AppColors; isDark: boolean } => {
  // Suppress union type narrowing — both palettes conform to AppColors at runtime
  const themeMode = useSubscriptionStore((s) => s.settings.themeMode);
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? DarkColors : LightColors,
    isDark,
  };
};
