import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

const SIZE = 210;
const CENTER = SIZE / 2;
const STROKE_WIDTH = 14;
const GAP = 5;

// Radii for 3 concentric rings
const R1 = (SIZE - STROKE_WIDTH) / 2;          // Outer: Needs (~91)
const R2 = R1 - STROKE_WIDTH - GAP;            // Middle: Wants (~72)
const R3 = R2 - STROKE_WIDTH - GAP;            // Inner: Savings (~53)

const C1 = 2 * Math.PI * R1;
const C2 = 2 * Math.PI * R2;
const C3 = 2 * Math.PI * R3;

export function BudgetRingsChart({
  totalIncome = 0,
  totalExpense = 0,
  categoryBreakdown = { categories: [] },
  currencySymbol = '$',
  isBalanceHidden = false,
}) {
  const { colors, shadows } = useTheme();
  const [selectedRing, setSelectedRing] = useState(null); // 'needs' | 'wants' | 'savings' | null

  // 50/30/20 Rule Computation
  const needsBudget = totalIncome > 0 ? totalIncome * 0.5 : 2000;
  const wantsBudget = totalIncome > 0 ? totalIncome * 0.3 : 1200;
  const savingsBudget = totalIncome > 0 ? totalIncome * 0.2 : 800;

  // Categorize expenses
  const needsCats = ['housing', 'utilities', 'food', 'transport', 'health', 'education'];
  let spentNeeds = 0;
  let spentWants = 0;

  for (const cat of categoryBreakdown.categories || []) {
    if (needsCats.includes(cat.id)) {
      spentNeeds += cat.amount;
    } else {
      spentWants += cat.amount;
    }
  }

  const netSavings = Math.max(0, totalIncome - totalExpense);
  const pctNeeds = needsBudget > 0 ? Math.min(1.2, spentNeeds / needsBudget) : 0;
  const pctWants = wantsBudget > 0 ? Math.min(1.2, spentWants / wantsBudget) : 0;
  const pctSavings = savingsBudget > 0 ? Math.min(1.2, netSavings / savingsBudget) : 0;

  // Clamped display offsets (circle stroke-dashoffset)
  const offset1 = C1 * (1 - Math.min(1, pctNeeds));
  const offset2 = C2 * (1 - Math.min(1, pctWants));
  const offset3 = C3 * (1 - Math.min(1, pctSavings));

  const ringsData = {
    needs: {
      id: 'needs',
      label: 'Needs (50%)',
      spent: spentNeeds,
      budget: needsBudget,
      pct: pctNeeds * 100,
      color: '#10B981', // Emerald
      icon: 'home-outline',
    },
    wants: {
      id: 'wants',
      label: 'Wants (30%)',
      spent: spentWants,
      budget: wantsBudget,
      pct: pctWants * 100,
      color: '#06B6D4', // Cyan
      icon: 'sparkles-outline',
    },
    savings: {
      id: 'savings',
      label: 'Savings (20%)',
      spent: netSavings,
      budget: savingsBudget,
      pct: pctSavings * 100,
      color: '#F59E0B', // Amber
      icon: 'trending-up-outline',
    },
  };

  const activeRing = selectedRing ? ringsData[selectedRing] : null;

  const handleToggleRing = (ringKey) => {
    hapticFeedback.light();
    setSelectedRing((prev) => (prev === ringKey ? null : ringKey));
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="needsGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#059669" />
            </LinearGradient>
            <LinearGradient id="wantsGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#67E8F9" />
              <Stop offset="100%" stopColor="#0891B2" />
            </LinearGradient>
            <LinearGradient id="savingsGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          </Defs>

          {/* Background Tracks */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R1}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R2}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={R3}
            stroke={colors.surfaceLight}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Active Concentric Rings */}
          <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
            {/* Ring 1: Needs */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R1}
              stroke="url(#needsGrad)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${C1}`}
              strokeDashoffset={offset1}
              strokeLinecap="round"
              onPress={() => handleToggleRing('needs')}
            />
            {/* Ring 2: Wants */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R2}
              stroke="url(#wantsGrad)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${C2}`}
              strokeDashoffset={offset2}
              strokeLinecap="round"
              onPress={() => handleToggleRing('wants')}
            />
            {/* Ring 3: Savings */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R3}
              stroke="url(#savingsGrad)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${C3}`}
              strokeDashoffset={offset3}
              strokeLinecap="round"
              onPress={() => handleToggleRing('savings')}
            />
          </G>
        </Svg>

        {/* Center Callout */}
        <TouchableOpacity
          style={styles.centerCallout}
          onPress={() => setSelectedRing(null)}
          activeOpacity={0.8}
        >
          {activeRing ? (
            <>
              <Text style={[styles.centerRingLabel, { color: activeRing.color }]}>
                {activeRing.label.split(' ')[0]}
              </Text>
              <Text style={[styles.centerRingVal, { color: colors.textPrimary }]}>
                {activeRing.pct.toFixed(0)}%
              </Text>
              <Text style={[styles.centerRingSub, { color: colors.textMuted }]}>
                {formatCurrency(activeRing.spent, currencySymbol, isBalanceHidden)}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="pie-chart" size={20} color={colors.primaryLight} />
              <Text style={[styles.centerOverallVal, { color: colors.textPrimary }]}>50/30/20</Text>
              <Text style={[styles.centerOverallSub, { color: colors.textMuted }]}>Rule Rings</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Ring Legend Chips */}
      <View style={styles.legendRow}>
        {Object.values(ringsData).map((r) => {
          const isSelected = selectedRing === r.id;
          return (
            <TouchableOpacity
              key={r.id}
              style={[
                styles.legendChip,
                {
                  backgroundColor: isSelected ? r.color + '22' : colors.surface,
                  borderColor: isSelected ? r.color : colors.surfaceBorder,
                },
              ]}
              onPress={() => handleToggleRing(r.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.chipDot, { backgroundColor: r.color }]} />
              <Text style={[styles.chipLabel, { color: colors.textPrimary }]}>{r.label.split(' ')[0]}</Text>
              <Text style={[styles.chipPct, { color: r.color }]}>{r.pct.toFixed(0)}%</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  chartWrapper: {
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
  centerRingLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerRingVal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  centerRingSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  centerOverallVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  centerOverallSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipPct: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
