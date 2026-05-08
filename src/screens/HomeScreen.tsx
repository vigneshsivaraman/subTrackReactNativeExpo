import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { useSubscriptionStats } from '../hooks/useSubscriptionStats';
import { RootStackParamList } from '../navigation/types';
import { Subscription } from '../types';
import { isOverdue, isUpcoming, formatDisplayDate } from '../utils/dateUtils';
import { formatAmountCompact } from '../utils/currencyUtils';
import SubscriptionCard from '../components/subscription/SubscriptionCard';
import EmptyState from '../components/common/EmptyState';
import Card from '../components/common/Card';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const subscriptions   = useSubscriptionStore((s) => s.subscriptions);
  const settings        = useSubscriptionStore((s) => s.settings);
  const loadFromStorage = useSubscriptionStore((s) => s.loadFromStorage);
  const stats = useSubscriptionStats();

  const [refreshing, setRefreshing] = useState(false);

  // Tab bar height is ~58px + bottom inset; FAB sits 16px above it
  const fabBottom = 58 + insets.bottom + 16;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFromStorage();
    setRefreshing(false);
  };

  const active   = subscriptions.filter((s) => s.isActive);
  const overdue  = active.filter((s) => isOverdue(s.renewalDate));
  const upcoming = active.filter((s) => isUpcoming(s.renewalDate) && !isOverdue(s.renewalDate));
  const rest     = active.filter((s) => !isOverdue(s.renewalDate) && !isUpcoming(s.renewalDate));

  const navigateToAdd  = () => navigation.navigate('AddEditSubscription', {});
  const navigateToEdit = (id: string) => navigation.navigate('AddEditSubscription', { subscriptionId: id });

  const renderSection = (title: string, icon: string, color: string, items: Subscription[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
            <Text style={[styles.badgeText, { color }]}>{items.length}</Text>
          </View>
        </View>
        {items.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onPress={() => navigateToEdit(sub.id)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>Dashboard</Text>
            <Text style={[styles.title, { color: colors.text }]}>My Subscriptions</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={navigateToAdd}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard} padding={16}>
            <MaterialCommunityIcons name="currency-inr" size={20} color={colors.primary} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatAmountCompact(stats.totalMonthly, settings.defaultCurrency)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Monthly</Text>
          </Card>

          <Card style={styles.summaryCard} padding={16}>
            <MaterialCommunityIcons name="calendar-check" size={20} color={colors.success} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {stats.activeCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active</Text>
          </Card>

          <Card style={styles.summaryCard} padding={16}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {stats.overdueCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Overdue</Text>
          </Card>
        </View>

        {/* Next Renewal Banner */}
        {stats.nextRenewal && (
          <Card style={[styles.nextRenewalCard, { borderColor: colors.primaryLight }]} padding={16}>
            <View style={styles.nextRenewalRow}>
              <View style={[styles.nextRenewalIcon, { backgroundColor: `${colors.primary}22` }]}>
                <MaterialCommunityIcons name="clock-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.nextRenewalLabel, { color: colors.textSecondary }]}>
                  Next Renewal
                </Text>
                <Text style={[styles.nextRenewalName, { color: colors.text }]}>
                  {stats.nextRenewal.name}
                </Text>
              </View>
              <Text style={[styles.nextRenewalDate, { color: colors.primary }]}>
                {formatDisplayDate(stats.nextRenewal.renewalDate)}
              </Text>
            </View>
          </Card>
        )}

        {/* Subscription Sections */}
        {active.length === 0 ? (
          <EmptyState
            icon="playlist-plus"
            title="No subscriptions yet"
            message="Tap the + button to add your first subscription and start tracking renewals."
          />
        ) : (
          <>
            {renderSection('Overdue', 'alert-circle', colors.error, overdue)}
            {renderSection('Due Soon', 'clock-alert', colors.warning, upcoming)}
            {renderSection('All Active', 'check-circle', colors.success, rest)}
          </>
        )}

        <View style={{ height: fabBottom + 20 }} />
      </ScrollView>

      {/* Floating Action Button — always above tab bar */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: fabBottom }]}
        onPress={navigateToAdd}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  title:    { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  nextRenewalCard: {
    marginBottom: 20,
    borderWidth: 1,
  },
  nextRenewalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextRenewalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextRenewalLabel: { fontSize: 11, fontWeight: '500' },
  nextRenewalName:  { fontSize: 15, fontWeight: '700' },
  nextRenewalDate:  { fontSize: 13, fontWeight: '600' },
  section: { marginBottom: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  fab: {
    position: 'absolute',
    // bottom is set dynamically via inline style using safe area insets
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
