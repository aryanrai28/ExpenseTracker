import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

export function DailySpendingHeatmap({
  transactions = [],
  currencySymbol = '$',
}) {
  const { colors, shadows } = useTheme();
  const [selectedDay, setSelectedDay] = useState(null);

  // Group expenses by date (YYYY-MM-DD)
  const { dailyTotals, weeks, currentStreak, totalNoSpendDays } = useMemo(() => {
    const totals = {};
    for (const tx of transactions) {
      if (tx.type === 'expense' && !tx.isTransfer) {
        const dateStr = tx.date ? tx.date.slice(0, 10) : '';
        if (dateStr) {
          totals[dateStr] = (totals[dateStr] || 0) + Number(tx.amount || 0);
        }
      }
    }

    // Generate past 70 days (10 weeks)
    const today = new Date();
    const daysList = [];
    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      daysList.push({
        date: iso,
        dateObj: d,
        amount: totals[iso] || 0,
      });
    }

    // Chunk into 10 weeks of 7 days
    const chunkedWeeks = [];
    for (let i = 0; i < daysList.length; i += 7) {
      chunkedWeeks.push(daysList.slice(i, i + 7));
    }

    // Compute No-Spend Streak
    let streak = 0;
    let noSpendCount = 0;
    for (let i = daysList.length - 1; i >= 0; i--) {
      if (daysList[i].amount === 0) {
        noSpendCount++;
        streak++;
      } else {
        // Break current streak once spend occurs
        if (i === daysList.length - 1) {
          streak = 0;
        }
        break;
      }
    }

    return {
      dailyTotals: totals,
      weeks: chunkedWeeks,
      currentStreak: streak,
      totalNoSpendDays: noSpendCount,
    };
  }, [transactions]);

  const getHeatLevel = (amount) => {
    if (amount === 0) return 0; // No-spend
    if (amount < 30) return 1;
    if (amount < 100) return 2;
    return 3;
  };

  const getCellColor = (level) => {
    switch (level) {
      case 0:
        return colors.incomeBg; // Emerald subtle
      case 1:
        return colors.surfaceHighlight;
      case 2:
        return colors.warningBg;
      case 3:
        return colors.expenseBg;
      default:
        return colors.surfaceHighlight;
    }
  };

  const getCellBorder = (level) => {
    switch (level) {
      case 0:
        return colors.income;
      case 1:
        return colors.surfaceBorder;
      case 2:
        return colors.warning;
      case 3:
        return colors.expense;
      default:
        return colors.surfaceBorder;
    }
  };

  const flamePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentStreak > 0) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(flamePulse, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flamePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [currentStreak]);

  return (
    <View style={[styles.container, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      {/* Header with Glowing Ember Streak Counter */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="calendar-outline" size={17} color={colors.primaryLight} style={{ marginRight: 6 }} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>Daily Spending Heatmap</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Past 10 weeks of daily spending habits
          </Text>
        </View>

        {/* Pulsing Ember Streak Badge */}
        <Animated.View
          style={[
            styles.streakBadge,
            {
              backgroundColor: currentStreak > 0 ? 'rgba(245, 158, 11, 0.16)' : colors.surfaceLight,
              borderColor: currentStreak > 0 ? '#F59E0B' : colors.surfaceBorder,
              transform: [{ scale: currentStreak > 0 ? flamePulse : 1 }],
            },
          ]}
        >
          <Text style={{ fontSize: 13 }}>🔥</Text>
          <Text
            style={[
              styles.streakText,
              { color: currentStreak > 0 ? '#F59E0B' : colors.textMuted },
            ]}
          >
            {currentStreak}d Streak
          </Text>
        </Animated.View>
      </View>

      {/* Selected Day Callout */}
      {selectedDay && (
        <View style={[styles.callout, { backgroundColor: colors.surfaceHighlight, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.calloutDate, { color: colors.textSecondary }]}>{selectedDay.date}</Text>
          <Text style={[styles.calloutAmount, { color: selectedDay.amount === 0 ? colors.income : colors.textPrimary }]}>
            {selectedDay.amount === 0
              ? '✨ No-Spend Day!'
              : `${formatCurrency(selectedDay.amount, currencySymbol)} spent`}
          </Text>
        </View>
      )}

      {/* Heatmap Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gridScroll}>
        <View style={styles.grid}>
          {weeks.map((week, wIdx) => (
            <View key={`w-${wIdx}`} style={styles.weekColumn}>
              {week.map((day) => {
                const level = getHeatLevel(day.amount);
                const isSelected = selectedDay?.date === day.date;
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: getCellColor(level),
                        borderColor: isSelected ? colors.primary : getCellBorder(level),
                        borderWidth: isSelected ? 2 : level === 0 ? 1.2 : 0.8,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      hapticFeedback.light();
                      setSelectedDay(day);
                    }}
                  >
                    {level === 0 && <Ionicons name="star" size={7} color={colors.income} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.miniLegendCell, { backgroundColor: colors.incomeBg, borderColor: colors.income, borderWidth: 1 }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>Zero Spend</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.miniLegendCell, { backgroundColor: colors.surfaceHighlight }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>&lt;$30</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.miniLegendCell, { backgroundColor: colors.warningBg, borderColor: colors.warning, borderWidth: 1 }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>$30-$100</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.miniLegendCell, { backgroundColor: colors.expenseBg, borderColor: colors.expense, borderWidth: 1 }]} />
          <Text style={[styles.legendText, { color: colors.textMuted }]}>&gt;$100</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
  },
  callout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  calloutDate: {
    fontSize: 11,
    fontWeight: '600',
  },
  calloutAmount: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  gridScroll: {
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 5,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: 5,
  },
  cell: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniLegendCell: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
