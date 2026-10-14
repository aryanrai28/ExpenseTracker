import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { SpendingDonutChart } from './SpendingDonutChart';
import { CashflowTrendLine } from './CashflowTrendLine';
import { BudgetRingsChart } from './BudgetRingsChart';

export function SpendingChart({
  categoryBreakdown,
  totalIncome = 0,
  totalExpense = 0,
  currencySymbol = '$',
  isBalanceHidden = false,
  transactions = [],
}) {
  const { colors, shadows } = useTheme();
  const { categories, totalExpense: expenseSum } = categoryBreakdown;
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* Financial Health Summary Banner */}
      <View style={[styles.card, shadows.md, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
        <View style={styles.healthHeader}>
          <Text style={[styles.healthTitle, { color: colors.textPrimary }]}>Monthly Overview</Text>
          <View style={[styles.savingsRateBadge, { backgroundColor: colors.incomeBg }]}>
            <Ionicons name="trending-up" size={14} color={colors.income} style={{ marginRight: 4 }} />
            <Text style={[styles.savingsRateText, { color: colors.income }]}>{savingsRate}% Saved</Text>
          </View>
        </View>

        {/* Proportional Comparison Bar: Income vs Expense */}
        <View style={styles.ratioBarContainer}>
          <View
            style={[
              styles.ratioSegment,
              {
                flex: totalIncome > 0 ? totalIncome : 1,
                backgroundColor: colors.income,
                borderTopLeftRadius: 6,
                borderBottomLeftRadius: 6,
              },
            ]}
          />
          <View
            style={[
              styles.ratioSegment,
              {
                flex: totalExpense > 0 ? totalExpense : 0.01,
                backgroundColor: colors.expense,
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
              },
            ]}
          />
        </View>

        <View style={styles.ratioLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              Income: {formatCurrency(totalIncome, currencySymbol, isBalanceHidden)}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
              Expenses: {formatCurrency(totalExpense, currencySymbol, isBalanceHidden)}
            </Text>
          </View>
        </View>
      </View>

      {/* Apple-Style Concentric Activity Rings (50/30/20 Rule) */}
      <View style={[styles.card, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>50/30/20 Budget Rings</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Needs, Wants, and Savings Targets
            </Text>
          </View>
          <View style={[styles.ruleBadge, { backgroundColor: colors.primaryGlow }]}>
            <Text style={[styles.ruleBadgeText, { color: colors.primaryLight }]}>Activity Rings</Text>
          </View>
        </View>
        <BudgetRingsChart
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          categoryBreakdown={categoryBreakdown}
          currencySymbol={currencySymbol}
          isBalanceHidden={isBalanceHidden}
        />
      </View>

      {/* Cash Flow Trend Line */}
      <CashflowTrendLine
        transactions={transactions}
        currencySymbol={currencySymbol}
        isBalanceHidden={isBalanceHidden}
      />

      {/* Interactive Donut Chart */}
      {categories.length > 0 && (
        <View style={[styles.card, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Spending Distribution</Text>
          <SpendingDonutChart
            categories={categories}
            totalExpense={expenseSum}
            currencySymbol={currencySymbol}
            isBalanceHidden={isBalanceHidden}
          />
        </View>
      )}

      {/* Category Progress Bars */}
      {categories.length > 0 && (
        <View style={[styles.card, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Category Breakdown</Text>
          <View style={styles.catList}>
            {categories.map((cat) => (
              <View key={cat.id} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <View style={styles.catNameGroup}>
                    <View style={[styles.catIconWrap, { backgroundColor: cat.color + '22' }]}>
                      <Ionicons name={cat.icon} size={16} color={cat.color} />
                    </View>
                    <Text style={[styles.catLabel, { color: colors.textPrimary }]}>{cat.label}</Text>
                  </View>
                  <View style={styles.catAmountGroup}>
                    <Text style={[styles.catAmount, { color: colors.textPrimary }]}>
                      {formatCurrency(cat.amount, currencySymbol, isBalanceHidden)}
                    </Text>
                    <Text style={[styles.catPercentage, { color: colors.textMuted }]}>
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.surfaceLight }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: cat.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {categories.length === 0 && (
        <View style={styles.emptyAnalytics}>
          <Ionicons name="pie-chart-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyAnalyticsText, { color: colors.textMuted }]}>
            No expenses logged yet for analytics.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  savingsRateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  savingsRateText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratioBarContainer: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 14,
  },
  ratioSegment: {
    height: '100%',
  },
  ratioLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  ruleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ruleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  catList: {
    gap: 14,
  },
  catRow: {
    marginBottom: 2,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  catAmountGroup: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  catPercentage: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyAnalytics: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyAnalyticsText: {
    fontSize: 14,
    marginTop: 12,
  },
});
