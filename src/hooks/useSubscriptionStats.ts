import { useMemo } from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { Subscription, SubscriptionStats, CategoryStat, SubscriptionCategory } from '../types';
import { toMonthlyAmount, isOverdue, isUpcoming } from '../utils/dateUtils';
import { UPCOMING_DAYS_THRESHOLD } from '../constants';

/**
 * Derives statistics from the current subscription list.
 * Memoized — only recomputes when subscriptions change.
 */
export const useSubscriptionStats = (): SubscriptionStats => {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  return useMemo(() => {
    const active = subscriptions.filter((s) => s.isActive);

    // Total monthly equivalent across all active subscriptions
    const totalMonthly = active.reduce(
      (sum, s) => sum + toMonthlyAmount(s.amount, s.billingCycle),
      0
    );

    const overdueList  = active.filter((s) => isOverdue(s.renewalDate));
    const upcomingList = active.filter((s) => isUpcoming(s.renewalDate, UPCOMING_DAYS_THRESHOLD));

    // Next renewal: earliest upcoming or overdue
    const sorted = [...active].sort(
      (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
    );
    const nextRenewal = sorted[0] ?? null;

    // Group by category for pie chart
    const categoryMap: Record<string, { total: number; count: number }> = {};
    for (const sub of active) {
      if (!categoryMap[sub.category]) {
        categoryMap[sub.category] = { total: 0, count: 0 };
      }
      categoryMap[sub.category].total += toMonthlyAmount(sub.amount, sub.billingCycle);
      categoryMap[sub.category].count += 1;
    }

    const byCategory: CategoryStat[] = Object.entries(categoryMap).map(([key, val]) => ({
      category: key as SubscriptionCategory,
      total: val.total,
      count: val.count,
      percentage: totalMonthly > 0 ? (val.total / totalMonthly) * 100 : 0,
    }));

    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeCount: active.length,
      overdueCount: overdueList.length,
      upcomingCount: upcomingList.length,
      byCategory,
      nextRenewal,
    };
  }, [subscriptions]);
};
