import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING_H = 32;
const PADDING_V = 20;
const PLOT_W = CHART_WIDTH - PADDING_H * 2;
const PLOT_H = CHART_HEIGHT - PADDING_V * 2;

const TIMEFRAMES = [
  { days: 7, label: '7D' },
  { days: 30, label: '30D' },
  { days: 90, label: '90D' },
  { days: 365, label: '1Y' },
];

export function CashflowTrendLine({
  transactions = [],
  currencySymbol = '$',
  isBalanceHidden = false,
}) {
  const { colors } = useTheme();
  const [daysRange, setDaysRange] = useState(7);
  const [scrubIndex, setScrubIndex] = useState(null);

  // Morph opacity / scale animation on timeframe switch
  const morphAnim = useRef(new Animated.Value(1)).current;

  const handleTimeframeChange = (days) => {
    if (days === daysRange) return;
    hapticFeedback.light();
    setScrubIndex(null);

    // Fast organic cross-fade transition simulating morph
    Animated.sequence([
      Animated.timing(morphAnim, {
        toValue: 0.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(morphAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    setDaysRange(days);
  };

  // Compute daily balances
  const { dataPoints, minVal, maxVal, labels } = useMemo(() => {
    const now = new Date();
    const days = daysRange;
    const dailyNet = new Array(days).fill(0);
    const dayLabels = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      dayLabels.push(formatDayLabel(d, days));

      for (const tx of transactions) {
        const txDate = new Date(tx.date);
        if (
          txDate.getDate() === d.getDate() &&
          txDate.getMonth() === d.getMonth() &&
          txDate.getFullYear() === d.getFullYear()
        ) {
          dailyNet[i] += tx.type === 'income' ? tx.amount : -tx.amount;
        }
      }
    }

    // Cumulative
    const cumulative = [];
    let running = 0;
    for (let i = 0; i < days; i++) {
      running += dailyNet[i];
      cumulative.push(running);
    }

    const min = Math.min(0, ...cumulative);
    const max = Math.max(1, ...cumulative);

    return {
      dataPoints: cumulative,
      minVal: min,
      maxVal: max,
      labels: dayLabels,
    };
  }, [transactions, daysRange]);

  // Convert data to SVG coordinates
  const points = dataPoints.map((val, i) => ({
    x: PADDING_H + (i / Math.max(dataPoints.length - 1, 1)) * PLOT_W,
    y: PADDING_V + PLOT_H - ((val - minVal) / (maxVal - minVal || 1)) * PLOT_H,
    value: val,
  }));

  // Build smooth bezier path
  const linePath = buildSmoothPath(points);
  const fillPath = linePath +
    ` L ${points[points.length - 1].x} ${PADDING_V + PLOT_H}` +
    ` L ${points[0].x} ${PADDING_V + PLOT_H} Z`;

  // Zero line Y
  const zeroY = PADDING_V + PLOT_H - ((0 - minVal) / (maxVal - minVal || 1)) * PLOT_H;

  // Touch scrubbing
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
        onPanResponderRelease: () => setScrubIndex(null),
        onPanResponderTerminate: () => setScrubIndex(null),
      }),
    [points]
  );

  function handleTouch(evt) {
    const x = evt.nativeEvent.locationX;
    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - x);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    if (closest !== scrubIndex) {
      hapticFeedback.light();
    }
    setScrubIndex(closest);
  }

  const scrubPoint = scrubIndex !== null ? points[scrubIndex] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Cash Flow Trend</Text>
        <View style={styles.toggleRow}>
          {TIMEFRAMES.map((t) => (
            <TouchableOpacity
              key={t.days}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: daysRange === t.days ? colors.primary : colors.surfaceLight,
                },
              ]}
              onPress={() => handleTimeframeChange(t.days)}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: daysRange === t.days ? colors.white : colors.textMuted },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrub tooltip */}
      {scrubPoint && (
        <View style={[styles.tooltip, { left: Math.min(Math.max(scrubPoint.x - 45, 4), CHART_WIDTH - 90) }]}>
          <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
            {labels[scrubIndex]}
          </Text>
          <Text style={[styles.tooltipValue, { color: scrubPoint.value >= 0 ? colors.income : colors.expense }]}>
            {scrubPoint.value >= 0 ? '+' : ''}
            {formatCurrency(scrubPoint.value, currencySymbol, isBalanceHidden)}
          </Text>
        </View>
      )}

      {/* Animated SVG Chart */}
      <Animated.View style={{ opacity: morphAnim }} {...panResponder.panHandlers}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.income} stopOpacity="0.32" />
              <Stop offset="100%" stopColor={colors.income} stopOpacity="0.01" />
            </SvgLinearGradient>
            <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={colors.income} />
              <Stop offset="100%" stopColor={colors.primaryLight} />
            </SvgLinearGradient>
          </Defs>

          {/* Zero baseline */}
          <Line
            x1={PADDING_H}
            y1={zeroY}
            x2={CHART_WIDTH - PADDING_H}
            y2={zeroY}
            stroke={colors.divider}
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {/* Fill area */}
          <Path d={fillPath} fill="url(#fillGrad)" />

          {/* Line */}
          <Path d={linePath} stroke="url(#lineGrad)" strokeWidth={2.8} fill="none" strokeLinecap="round" />

          {/* Data dots (display sparse dots when many points) */}
          {points.map((p, i) => {
            const isSparse = points.length > 30 ? i % Math.ceil(points.length / 10) === 0 : true;
            if (!isSparse && scrubIndex !== i) return null;
            return (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={scrubIndex === i ? 5.5 : 2.5}
                fill={scrubIndex === i ? colors.income : colors.surface}
                stroke={colors.income}
                strokeWidth={2}
              />
            );
          })}

          {/* Scrub vertical line */}
          {scrubPoint && (
            <Line
              x1={scrubPoint.x}
              y1={PADDING_V}
              x2={scrubPoint.x}
              y2={PADDING_V + PLOT_H}
              stroke={colors.primary}
              strokeWidth={1.2}
              strokeDasharray="3,3"
            />
          )}
        </Svg>
      </Animated.View>

      {/* X-axis labels */}
      <View style={styles.xLabels}>
        {labels.filter((_, i) => {
          const step = daysRange <= 7 ? 1 : Math.ceil(daysRange / 5);
          return i % step === 0 || i === labels.length - 1;
        }).map((label, i) => (
          <Text key={i} style={[styles.xLabel, { color: colors.textMuted }]}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

// ── Helpers ─────────────────────────────────────────────

function buildSmoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const cpx = (prev.x + cur.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

function formatDayLabel(date, range) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (range <= 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  toggleBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    top: 6,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tooltipLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING_H - 8,
    marginTop: 4,
  },
  xLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
