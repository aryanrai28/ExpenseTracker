import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 200;
const STROKE_WIDTH = 22;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export function SpendingDonutChart({
  categories = [],
  totalExpense = 0,
  currencySymbol = '$',
  isBalanceHidden = false,
}) {
  const { colors } = useTheme();
  const [selectedCat, setSelectedCat] = useState(null);
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animProgress.setValue(0);
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [categories.length]);

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="pie-chart-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No expense data to chart
        </Text>
      </View>
    );
  }

  // Build segments
  let cumulativePercent = 0;
  const segments = categories.map((cat) => {
    const pct = cat.percentage / 100;
    const startOffset = cumulativePercent;
    cumulativePercent += pct;
    return {
      ...cat,
      pct,
      dashOffset: CIRCUMFERENCE * (1 - pct),
      rotation: startOffset * 360 - 90,
    };
  });

  const centerCat = selectedCat || null;
  const centerLabel = centerCat ? centerCat.label : 'Total';
  const centerAmount = centerCat ? centerCat.amount : totalExpense;
  const centerPct = centerCat ? `${centerCat.percentage.toFixed(1)}%` : '100%';

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <Svg width={SIZE} height={SIZE}>
          {/* Background track */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Category segments */}
          <G>
            {segments.map((seg, idx) => (
              <Circle
                key={seg.id || idx}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                rotation={seg.rotation}
                origin={`${CENTER}, ${CENTER}`}
                onPress={() => setSelectedCat(selectedCat?.id === seg.id ? null : seg)}
              />
            ))}
          </G>
        </Svg>

        {/* Center callout */}
        <TouchableOpacity
          style={styles.centerCallout}
          onPress={() => setSelectedCat(null)}
          activeOpacity={0.8}
        >
          <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>
            {centerLabel}
          </Text>
          <Text style={[styles.centerAmount, { color: colors.textPrimary }]}>
            {formatCurrency(centerAmount, currencySymbol, isBalanceHidden)}
          </Text>
          <Text style={[styles.centerPct, { color: centerCat ? centerCat.color : colors.primary }]}>
            {centerPct}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category legend chips */}
      <View style={styles.legendGrid}>
        {segments.map((seg) => (
          <TouchableOpacity
            key={seg.id}
            style={[
              styles.legendChip,
              {
                backgroundColor: selectedCat?.id === seg.id ? seg.color + '22' : colors.surfaceLight,
                borderColor: selectedCat?.id === seg.id ? seg.color : colors.surfaceBorder,
              },
            ]}
            onPress={() => setSelectedCat(selectedCat?.id === seg.id ? null : seg)}
            activeOpacity={0.7}
          >
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={[styles.legendText, { color: colors.textPrimary }]} numberOfLines={1}>
              {seg.label}
            </Text>
            <Text style={[styles.legendPct, { color: colors.textMuted }]}>
              {seg.percentage.toFixed(0)}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 10,
  },
  chartWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerCallout: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  centerAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  centerPct: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  legendPct: {
    fontSize: 11,
    fontWeight: '500',
  },
});
