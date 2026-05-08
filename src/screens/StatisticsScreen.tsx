import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSubscriptionStats } from '../hooks/useSubscriptionStats';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { formatAmountCompact } from '../utils/currencyUtils';
import Card from '../components/common/Card';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import EmptyState from '../components/common/EmptyState';

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const stats    = useSubscriptionStats();
  const settings = useSubscriptionStore((s) => s.settings);

  const currency = settings.defaultCurrency;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your spending overview
        </Text>

        {/* Summary Cards */}
        <View style={styles.grid}>
          <StatCard
            icon="calendar-month"
            label="Monthly Total"
            value={formatAmountCompact(stats.totalMonthly, currency)}
            color={colors.primary}
            colors={colors}
          />
          <StatCard
            icon="calendar-star"
            label="Yearly Estimate"
            value={formatAmountCompact(stats.totalYearly, currency)}
            color="#EC4899"
            colors={colors}
          />
          <StatCard
            icon="check-circle"
            label="Active Subs"
            value={String(stats.activeCount)}
            color={colors.success}
            colors={colors}
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={String(stats.overdueCount)}
            color={stats.overdueCount > 0 ? colors.error : colors.textTertiary}
            colors={colors}
          />
        </View>

        {/* Pie Chart */}
        <Card style={{ marginTop: 8 }} padding={16}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
          {stats.byCategory.length === 0 ? (
            <EmptyState
              icon="chart-donut"
              title="No data yet"
              message="Add subscriptions to see category breakdown."
            />
          ) : (
            <CategoryPieChart data={stats.byCategory} currency={currency} />
          )}
        </Card>

        {/* Per-category list */}
        {stats.byCategory.length > 0 && (
          <Card style={{ marginTop: 12 }} padding={16}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
            {stats.byCategory
              .sort((a, b) => b.total - a.total)
              .map((item) => (
                <View key={item.category} style={[styles.catRow, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.catLabel, { color: colors.text }]}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Text>
                  <Text style={[styles.catCount, { color: colors.textSecondary }]}>
                    {item.count} sub{item.count !== 1 ? 's' : ''}
                  </Text>
                  <Text style={[styles.catAmount, { color: colors.text }]}>
                    {formatAmountCompact(item.total, currency)}/mo
                  </Text>
                </View>
              ))}
          </Card>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── StatCard sub-component ───────────────────────────────────────────────────

function StatCard({ icon, label, value, color, colors }: {
  icon: string; label: string; value: string; color: string; colors: any;
}) {
  return (
    <Card style={styles.statCard} padding={14}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}22` }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll:    { padding: 16, paddingTop: 56 },
  title:     { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle:  { fontSize: 14, marginTop: 4, marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  statCard: {
    width: '47.5%',
    gap: 4,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  catLabel:  { flex: 1, fontSize: 14, fontWeight: '600' },
  catCount:  { fontSize: 13, marginRight: 12 },
  catAmount: { fontSize: 14, fontWeight: '700' },
});
