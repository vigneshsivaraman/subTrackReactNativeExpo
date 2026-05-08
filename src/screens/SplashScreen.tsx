import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const loadFromStorage = useSubscriptionStore((s) => s.loadFromStorage);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Load data then navigate
    const init = async () => {
      await loadFromStorage();
      setTimeout(() => {
        navigation.replace('Main');
      }, 1800);
    };
    init();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        {/* App Icon */}
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="calendar-sync" size={52} color="#FFFFFF" />
        </View>

        <Text style={[styles.appName, { color: colors.text }]}>SubTrack</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Never miss a renewal
        </Text>
      </Animated.View>

      {/* Dot loader */}
      <Animated.View style={[styles.loader, { opacity: fadeAnim }]}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <View style={[styles.dot, { backgroundColor: colors.primaryLight }]} />
        <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
