import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { computeCashflowForecast } from '../utils/cashFlowPredictor';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';
import { LiquidGlassModal } from './LiquidGlassModal';

export function CashflowForecasterModal({
  visible,
  currentBalance,
  transactions,
  subscriptions,
  currencySymbol = '$',
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [horizon, setHorizon] = useState(30); // 30 | 60 | 90 days

  const forecast = useMemo(() => {
    return computeCashflowForecast({
      currentBalance,
      transactions,
      subscriptions,
      daysAhead: horizon,
    });
  }, [currentBalance, transactions, subscriptions, horizon]);

  // Build SVG path for the forecast curve
  const svgWidth = 320;
  const svgHeight = 140;
  const padding = 16;

  const { pathData, areaData, points } = useMemo(() => {
    const pts = forecast.dataPoints || [];
    if (pts.length < 2) return { pathData: '', areaData: '', points: [] };

    const balances = pts.map((p) => p.balance);
    const min = Math.min(...balances, 0);
    const max = Math.max(...balances, 1);
    const range = max - min || 1;

    const coords = pts.map((p, i) => {
      const x = padding + (i / (pts.length - 1)) * (svgWidth - 2 * padding);
      const y = svgHeight - padding - ((p.balance - min) / range) * (svgHeight - 2 * padding);
      return { x, y, balance: p.balance, date: p.date };
    });

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const area = `${d} L ${last.x} ${svgHeight - padding} L ${first.x} ${svgHeight - padding} Z`;

    return { pathData: d, areaData: area, points: coords };
  }, [forecast.dataPoints]);

  const isNetPositive = forecast.projectedEndBalance >= currentBalance;

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Predictive Cash Flow"
      subtitle="Algorithmic 30/60/90-day balance forecast"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Horizon Selector */}
        <View style={[styles.horizonRow, { backgroundColor: colors.surfaceLight }]}>
          {[30, 60, 90].map((days) => (
            <TouchableOpacity
              key={days}
              style={[
                styles.horizonBtn,
                horizon === days && { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                hapticFeedback.light();
                setHorizon(days);
              }}
            >
              <Text
                style={[
                  styles.horizonText,
                  { color: horizon === days ? '#FFF' : colors.textSecondary },
                ]}
              >
                {days} Days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overdraft / Low Balance Alert */}
        {forecast.isOverdraftRisk ? (
          <View style={[styles.alertCard, { backgroundColor: colors.expenseBg, borderColor: colors.expenseBorder }]}>
            <Ionicons name="warning" size={20} color={colors.expense} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: colors.expense }]}>Overdraft Warning</Text>
              <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>
                Projected balance drops below $0 on {forecast.minBalanceDate}.
              </Text>
            </View>
          </View>
        ) : forecast.isLowBalanceWarning ? (
          <View style={[styles.alertCard, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: colors.warning }]}>Low Balance Alert</Text>
              <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>
                Projected minimum balance drops to {formatCurrency(forecast.minBalance, currencySymbol)} on {forecast.minBalanceDate}.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Projected Net Balance Card */}
        <View style={[styles.statCard, shadows.md, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Projected Balance in {horizon} Days
          </Text>
          <Text
            style={[
              styles.statAmount,
              { color: isNetPositive ? colors.income : colors.expense, fontVariant: ['tabular-nums'] },
            ]}
          >
            {formatCurrency(forecast.projectedEndBalance, currencySymbol)}
          </Text>
          <Text style={[styles.statSub, { color: colors.textMuted }]}>
            Current: {formatCurrency(currentBalance, currencySymbol)} · Net {isNetPositive ? '+' : ''}
            {formatCurrency(forecast.projectedEndBalance - currentBalance, currencySymbol)}
          </Text>

          {/* Forecast SVG Chart */}
          {pathData ? (
            <View style={styles.chartContainer}>
              <Svg width={svgWidth} height={svgHeight}>
                <Defs>
                  <LinearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <Stop
                      offset="0%"
                      stopColor={isNetPositive ? colors.income : colors.expense}
                      stopOpacity={0.3}
                    />
                    <Stop
                      offset="100%"
                      stopColor={isNetPositive ? colors.income : colors.expense}
                      stopOpacity={0.0}
                    />
                  </LinearGradient>
                </Defs>
                <Path d={areaData} fill="url(#forecastFill)" />
                <Path
                  d={pathData}
                  fill="none"
                  stroke={isNetPositive ? colors.income : colors.expense}
                  strokeWidth={3}
                />
                {points.length > 0 && (
                  <Circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r={5}
                    fill={isNetPositive ? colors.income : colors.expense}
                  />
                )}
              </Svg>
            </View>
          ) : null}
        </View>

        {/* Smart Allowance Pillars */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricBox, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primaryLight} style={{ marginBottom: 4 }} />
            <Text style={[styles.metricVal, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
              {formatCurrency(forecast.safeToSpendDaily, currencySymbol)}
            </Text>
            <Text style={[styles.metricLbl, { color: colors.textMuted }]}>Daily Safe-to-Spend</Text>
          </View>

          <View style={[styles.metricBox, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
            <Ionicons name="flame-outline" size={18} color={colors.warning} style={{ marginBottom: 4 }} />
            <Text style={[styles.metricVal, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
              {formatCurrency(forecast.dailyDiscretionaryBurn, currencySymbol)}
            </Text>
            <Text style={[styles.metricLbl, { color: colors.textMuted }]}>Average Daily Burn</Text>
          </View>
        </View>
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28,
  },
  horizonRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  horizonBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  horizonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  statCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
