import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { isOverdue, isUpcoming, daysUntil } from '../../utils/dateUtils';

interface SubscriptionBadgeProps {
  renewalDate: string;
}

export default function SubscriptionBadge({ renewalDate }: SubscriptionBadgeProps) {
  const { colors } = useTheme();
  const days = daysUntil(renewalDate);

  if (isOverdue(renewalDate)) {
    return (
      <View style={[styles.badge, { backgroundColor: `${colors.error}22` }]}>
        <Text style={[styles.text, { color: colors.error }]}>Overdue</Text>
      </View>
    );
  }

  if (isUpcoming(renewalDate)) {
    return (
      <View style={[styles.badge, { backgroundColor: `${colors.warning}22` }]}>
        <Text style={[styles.text, { color: colors.warning }]}>
          Due in {days} day{days !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: `${colors.success}22` }]}>
      <Text style={[styles.text, { color: colors.success }]}>Active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
