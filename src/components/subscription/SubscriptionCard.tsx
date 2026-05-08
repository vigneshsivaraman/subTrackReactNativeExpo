import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Subscription } from '../../types';
import { getCategoryMeta } from '../../constants/categories';
import { formatAmountCompact } from '../../utils/currencyUtils';
import { relativeRenewalLabel, isOverdue, isUpcoming, daysUntil } from '../../utils/dateUtils';
import SubscriptionBadge from './SubscriptionBadge';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function SubscriptionCard({ subscription, onPress, onLongPress }: SubscriptionCardProps) {
  const { colors } = useTheme();
  const meta = getCategoryMeta(subscription.category);
  const days = daysUntil(subscription.renewalDate);
  const overdue  = isOverdue(subscription.renewalDate);
  const upcoming = isUpcoming(subscription.renewalDate);

  const accentColor = overdue ? colors.error : upcoming ? colors.warning : meta.color;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[styles.card, { backgroundColor: colors.card }]}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Category Icon */}
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}22` }]}>
        <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.color} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {subscription.name}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]}>
          {meta.label} · {subscription.billingCycle}
        </Text>
        <SubscriptionBadge renewalDate={subscription.renewalDate} />
      </View>

      {/* Amount + Renewal */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatAmountCompact(subscription.amount, subscription.currency)}
        </Text>
        <Text style={[styles.renewalLabel, { color: accentColor }]}>
          {relativeRenewalLabel(subscription.renewalDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 12,
    marginVertical: 14,
  },
  info: {
    flex: 1,
    paddingVertical: 14,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  category: {
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
    paddingRight: 16,
    paddingVertical: 14,
    gap: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  renewalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
