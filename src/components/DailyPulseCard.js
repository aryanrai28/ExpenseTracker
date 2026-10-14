import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

export function DailyPulseCard({
  transactions = [],
  upcomingBills = [],
  goals = [],
  totalBalance = 0,
  currencySymbol = '$',
  onPressBillRadar,
  onPressGoals,
}) {
  const { colors, shadows } = useTheme();
  const [pulseIndex, setPulseIndex] = useState(0);

  // Compute smart dynamic insights
  const insights = useMemo(() => {
    const list = [];

    // 1. Upcoming Bill Notice
    if (upcomingBills.length > 0) {
      const nextBill = upcomingBills[0];
      const safeToSpend = Math.max(0, totalBalance - nextBill.amount);
      list.push({
        id: 'bill',
        tag: 'RADAR ALERT',
        tagColor: colors.warning,
        tagBg: colors.warningBg,
        icon: 'alarm',
        iconColor: colors.warning,
        title: `${nextBill.name} (${formatCurrency(nextBill.amount, currencySymbol)}) due soon`,
        detail: `Safe-to-spend buffer: ${formatCurrency(safeToSpend, currencySymbol)} remaining.`,
        actionLabel: 'View Radar',
        onAction: onPressBillRadar,
      });
    }

    // 2. Spending Velocity Insight (This week vs last week)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    let thisWeekSpend = 0;
    let lastWeekSpend = 0;

    for (const tx of transactions) {
      if (tx.type === 'expense' && !tx.isTransfer && tx.date) {
        const d = new Date(tx.date);
        const amt = Number(tx.amount || 0);
        if (d >= sevenDaysAgo && d <= now) {
          thisWeekSpend += amt;
        } else if (d >= fourteenDaysAgo && d < sevenDaysAgo) {
          lastWeekSpend += amt;
        }
      }
    }

    if (lastWeekSpend > 0) {
      const diffPct = Math.round(((thisWeekSpend - lastWeekSpend) / lastWeekSpend) * 100);
      if (diffPct < 0) {
        list.push({
          id: 'velocity_down',
          tag: 'SMART INSIGHT',
          tagColor: colors.income,
          tagBg: colors.incomeBg,
          icon: 'trending-down',
          iconColor: colors.income,
          title: `You spent ${Math.abs(diffPct)}% less this week`,
          detail: `Great financial momentum! Keep this pace to maximize savings.`,
        });
      } else if (diffPct > 20) {
        list.push({
          id: 'velocity_up',
          tag: 'SPENDING VELOCITY',
          tagColor: colors.expense,
          tagBg: colors.expenseBg,
          icon: 'trending-up',
          iconColor: colors.expense,
          title: `Spending up ${diffPct}% this week`,
          detail: `Paced at ${formatCurrency(thisWeekSpend, currencySymbol)} over the past 7 days.`,
        });
      }
    }

    // 3. Goal Milestone
    const nearGoal = goals.find((g) => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return pct >= 50 && pct < 100;
    });

    if (nearGoal) {
      const pct = Math.round((nearGoal.currentAmount / nearGoal.targetAmount) * 100);
      list.push({
        id: 'goal',
        tag: 'GOAL MOMENTUM',
        tagColor: colors.primaryLight,
        tagBg: colors.primaryGlow,
        icon: 'trophy',
        iconColor: colors.primaryLight,
        title: `${pct}% to "${nearGoal.name}" milestone!`,
        detail: `Only ${formatCurrency(nearGoal.targetAmount - nearGoal.currentAmount, currencySymbol)} left to reach 100%.`,
        actionLabel: 'Add Funds',
        onAction: onPressGoals,
      });
    }

    // 4. Default Morning Briefing
    if (list.length === 0) {
      list.push({
        id: 'daily_health',
        tag: 'DAILY PULSE',
        tagColor: colors.income,
        tagBg: colors.incomeBg,
        icon: 'sparkles',
        iconColor: colors.income,
        title: 'All accounts synced & balanced',
        detail: `Net wealth stands at ${formatCurrency(totalBalance, currencySymbol)}. Safe for daily expenses.`,
      });
    }

    return list;
  }, [transactions, upcomingBills, goals, totalBalance, currencySymbol, colors]);

  const activeInsight = insights[pulseIndex % insights.length];

  const handleNext = () => {
    hapticFeedback.light();
    setPulseIndex((prev) => (prev + 1) % insights.length);
  };

  return (
    <TouchableOpacity
      style={[styles.container, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
      activeOpacity={0.85}
      onPress={handleNext}
    >
      <LinearGradient
        colors={[activeInsight.tagColor + '18', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.topRow}>
        <View style={styles.tagWrap}>
          <View style={[styles.tagPill, { backgroundColor: activeInsight.tagBg, borderColor: activeInsight.tagColor + '44' }]}>
            <Ionicons name={activeInsight.icon} size={11} color={activeInsight.tagColor} style={{ marginRight: 4 }} />
            <Text style={[styles.tagText, { color: activeInsight.tagColor }]}>
              {activeInsight.tag}
            </Text>
          </View>
        </View>

        {insights.length > 1 && (
          <View style={styles.dotsRow}>
            {insights.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === pulseIndex % insights.length ? activeInsight.tagColor : colors.textMuted + '44',
                    width: i === pulseIndex % insights.length ? 14 : 5,
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.contentRow}>
        <View style={[styles.iconCircle, { backgroundColor: activeInsight.tagColor + '22' }]}>
          <Ionicons name={activeInsight.icon} size={18} color={activeInsight.tagColor} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {activeInsight.title}
          </Text>
          <Text style={[styles.detail, { color: colors.textSecondary }]} numberOfLines={2}>
            {activeInsight.detail}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  detail: {
    fontSize: 11,
    lineHeight: 16,
  },
  chevron: {
    marginLeft: 4,
  },
});
