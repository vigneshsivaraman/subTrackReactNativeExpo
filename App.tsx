import React from 'react';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useSubscriptionStore } from './src/store/subscriptionStore';
import { LightColors, DarkColors } from './src/constants/colors';
import { useColorScheme } from 'react-native';

// Build React Native Paper theme from our color tokens
function buildPaperTheme(isDark: boolean) {
  const base  = isDark ? MD3DarkTheme : MD3LightTheme;
  const colors = isDark ? DarkColors : LightColors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary:    colors.primary,
      background: colors.background,
      surface:    colors.surface,
      error:      colors.error,
    },
  };
}

export default function App() {
  const themeMode  = useSubscriptionStore((s) => s.settings.themeMode);
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  const paperTheme = buildPaperTheme(isDark);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AppNavigator />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
