import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  labelStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    ...styles.base,
    ...(variant === 'primary' && { backgroundColor: colors.primary }),
    ...(variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }),
    ...(variant === 'danger'  && { backgroundColor: colors.error }),
    ...(variant === 'ghost'   && { backgroundColor: 'transparent' }),
    ...(disabled && { opacity: 0.5 }),
  };

  const textStyle: TextStyle = {
    ...styles.label,
    ...(variant === 'primary' && { color: '#FFFFFF' }),
    ...(variant === 'outline' && { color: colors.primary }),
    ...(variant === 'danger'  && { color: '#FFFFFF' }),
    ...(variant === 'ghost'   && { color: colors.textSecondary }),
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFF'} />
      ) : (
        <Text style={[textStyle, labelStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
