import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../hooks/useTheme';
import { CategoryStat } from '../../types';
import { getCategoryMeta } from '../../constants/categories';
import { formatAmountCompact } from '../../utils/currencyUtils';

interface CategoryPieChartProps {
  data: CategoryStat[];
  currency: string;
}

const screenWidth = Dimensions.get('window').width;

export default function CategoryPieChart({ data, currency }: CategoryPieChartProps) {
  const { colors, isDark } = useTheme();

  if (data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: colors.textSecondary }}>No data to display</Text>
      </View>
    );
  }

  const chartData = data.map((item) => {
    const meta = getCategoryMeta(item.category);
    return {
      name: meta.label,
      population: parseFloat(item.total.toFixed(2)),
      color: meta.color,
      legendFontColor: colors.text,
      legendFontSize: 12,
    };
  });

  return (
    <View>
      <PieChart
        data={chartData}
        width={screenWidth - 32}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(${isDark ? '255,255,255' : '0,0,0'},${opacity})`,
          labelColor: (opacity = 1) => colors.text,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />

      {/* Legend rows with amount */}
      {data.map((item) => {
        const meta = getCategoryMeta(item.category);
        return (
          <View key={item.category} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: meta.color }]} />
            <Text style={[styles.legendLabel, { color: colors.text }]}>{meta.label}</Text>
            <Text style={[styles.legendAmount, { color: colors.textSecondary }]}>
              {formatAmountCompact(item.total, currency)}/mo
            </Text>
            <Text style={[styles.legendPct, { color: meta.color }]}>
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  legendAmount: {
    fontSize: 13,
    marginRight: 8,
  },
  legendPct: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 42,
    textAlign: 'right',
  },
});
