import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';
import { LiquidGlassModal } from './LiquidGlassModal';

export function DebtPayoffModal({
  visible,
  debtManager,
  currencySymbol = '$',
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');

  if (!debtManager) return null;
  const {
    debts,
    strategy,
    setStrategy,
    extraPayment,
    setExtraPayment,
    addDebt,
    deleteDebt,
    simulation,
  } = debtManager;

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Enter a name for this debt account.');
      return;
    }
    const bVal = parseFloat(balance) || 0;
    const aVal = parseFloat(apr) || 0;
    const mVal = parseFloat(minPayment) || 25;

    if (bVal <= 0) {
      Alert.alert('Invalid Balance', 'Balance must be greater than zero.');
      return;
    }

    addDebt({
      name: name.trim(),
      balance: bVal,
      apr: aVal,
      minPayment: mVal,
    });

    setName('');
    setBalance('');
    setApr('');
    setMinPayment('');
    setIsAdding(false);
  };

  const EXTRA_PRESETS = [0, 50, 100, 200, 350, 500];

  // ── Debt Melt SVG Curve Generator ──────────────────────
  const curveW = 300;
  const curveH = 80;
  const totalMonths = Math.max(1, simulation.monthsToFreedom || 1);
  const curvePoints = [0, 0.2, 0.4, 0.6, 0.8, 1].map((r) => {
    const x = 16 + r * (curveW - 32);
    // Acceleration exponent based on extra payment (makes curve bow downward)
    const factor = 1 + (extraPayment / 250);
    const remainingRatio = Math.pow(1 - r, factor);
    const y = 14 + (1 - remainingRatio) * (curveH - 28);
    return { x, y };
  });

  let meltSvgPath = `M ${curvePoints[0].x} ${curvePoints[0].y}`;
  for (let i = 1; i < curvePoints.length; i++) {
    const prev = curvePoints[i - 1];
    const cur = curvePoints[i];
    const cpx = (prev.x + cur.x) / 2;
    meltSvgPath += ` C ${cpx} ${prev.y}, ${cpx} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  const meltSvgFill = `${meltSvgPath} L ${curvePoints[curvePoints.length - 1].x} ${curveH} L ${curvePoints[0].x} ${curveH} Z`;

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Debt Freedom Planner"
      subtitle="Accelerated Snowball & Avalanche Payoff"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Freedom Countdown Card */}
        <LinearGradient
          colors={['#0F2027', '#203A43', '#2C5364']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.freedomCard, shadows.md]}
        >
          <View style={styles.cardTop}>
            <Ionicons name="shield-checkmark" size={18} color="#00FFFF" />
            <Text style={styles.cardTopLabel}>PROJECTED DEBT-FREE DATE</Text>
          </View>
          <Text style={styles.freedomDate}>{simulation.debtFreeDate}</Text>
          <View style={styles.cardStatsRow}>
            <View>
              <Text style={styles.statVal}>{formatCurrency(simulation.totalDebt, currencySymbol)}</Text>
              <Text style={styles.statLbl}>Total Balance</Text>
            </View>
            <View style={styles.cardDivider} />
            <View>
              <Text style={[styles.statVal, { color: '#34D399' }]}>
                {simulation.monthsToFreedom} mos
              </Text>
              <Text style={styles.statLbl}>Timeline</Text>
            </View>
            <View style={styles.cardDivider} />
            <View>
              <Text style={[styles.statVal, { color: '#FBBF24' }]}>
                {formatCurrency(simulation.totalInterestSaved, currencySymbol)}
              </Text>
              <Text style={styles.statLbl}>Est. Saved</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Strategy Selector */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PAYOFF STRATEGY</Text>
        <View style={styles.stratRow}>
          <TouchableOpacity
            style={[
              styles.stratBtn,
              { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
              strategy === 'snowball' && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight },
            ]}
            onPress={() => {
              audioEffects.whoosh();
              setStrategy('snowball');
            }}
          >
            <Ionicons
              name="snow-outline"
              size={18}
              color={strategy === 'snowball' ? colors.primaryLight : colors.textMuted}
            />
            <Text
              style={[
                styles.stratTitle,
                { color: strategy === 'snowball' ? colors.primaryLight : colors.textPrimary },
              ]}
            >
              Snowball
            </Text>
            <Text style={[styles.stratSub, { color: colors.textMuted }]}>Lowest balance first</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stratBtn,
              { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
              strategy === 'avalanche' && { backgroundColor: colors.incomeBg, borderColor: colors.income },
            ]}
            onPress={() => {
              audioEffects.whoosh();
              setStrategy('avalanche');
            }}
          >
            <Ionicons
              name="trending-down"
              size={18}
              color={strategy === 'avalanche' ? colors.income : colors.textMuted}
            />
            <Text
              style={[
                styles.stratTitle,
                { color: strategy === 'avalanche' ? colors.income : colors.textPrimary },
              ]}
            >
              Avalanche
            </Text>
            <Text style={[styles.stratSub, { color: colors.textMuted }]}>Highest APR first</Text>
          </TouchableOpacity>
        </View>

        {/* ── Interactive "Debt Melt" Real-Time Curve ────────────────── */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          REAL-TIME DEBT MELT ACCELERATOR (+{formatCurrency(extraPayment, currencySymbol)}/MO)
        </Text>
        <View style={[styles.meltCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
          <View style={styles.meltHeader}>
            <View style={styles.meltBadge}>
              <Ionicons name="flame" size={13} color="#F59E0B" />
              <Text style={styles.meltBadgeText}>Melts debt {simulation.monthsToFreedom} months faster</Text>
            </View>
            <Text style={[styles.meltSavingsText, { color: colors.income }]}>
              +{formatCurrency(simulation.totalInterestSaved, currencySymbol)} Saved
            </Text>
          </View>

          {/* SVG Amortization Melting Curve */}
          <Svg width={curveW} height={curveH} style={{ alignSelf: 'center' }}>
            <Defs>
              <SvgGradient id="meltGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
              </SvgGradient>
            </Defs>
            <Path d={meltSvgFill} fill="url(#meltGrad)" />
            <Path d={meltSvgPath} stroke="#10B981" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {curvePoints.map((pt, i) => (
              <Circle key={i} cx={pt.x} cy={pt.y} r={3} fill="#10B981" />
            ))}
          </Svg>

          {/* Preset Buttons */}
          <View style={styles.presetsRow}>
            {EXTRA_PRESETS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.presetBtn,
                  { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                  extraPayment === amt && { backgroundColor: colors.primary, borderColor: colors.primaryLight },
                ]}
                onPress={() => {
                  hapticFeedback.light();
                  audioEffects.coinClink();
                  setExtraPayment(amt);
                }}
              >
                <Text
                  style={[
                    styles.presetText,
                    { color: extraPayment === amt ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  +{currencySymbol}{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debts Priority List */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
          DEBT PRIORITY ORDER ({simulation.orderedDebts.length})
        </Text>
        {simulation.orderedDebts.map((d, idx) => (
          <View
            key={d.id}
            style={[styles.debtCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
          >
            <View style={styles.debtOrderBadge}>
              <Text style={styles.orderNum}>#{idx + 1}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={[styles.debtName, { color: colors.textPrimary }]}>{d.name}</Text>
              <Text style={[styles.debtMeta, { color: colors.textMuted }]}>
                APR: {d.apr}% · Min: {formatCurrency(d.minPayment, currencySymbol)}/mo
              </Text>
            </View>
            <Text style={[styles.debtBalance, { color: colors.expense }]}>
              {formatCurrency(d.balance, currencySymbol)}
            </Text>
            <TouchableOpacity
              onPress={() => deleteDebt(d.id)}
              style={{ padding: 6, marginLeft: 6 }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.expense} />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Debt Card */}
        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <Text style={[styles.addTitle, { color: colors.textPrimary }]}>Add Debt or Credit Account</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
              placeholder="Account Name (e.g. Chase Sapphire, Car Loan)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
              placeholder="Outstanding Balance ($)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={balance}
              onChangeText={setBalance}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.textPrimary }]}
                placeholder="APR % (e.g. 19.99)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={apr}
                onChangeText={setApr}
              />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.surface, color: colors.textPrimary }]}
                placeholder="Min Payment ($)"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={minPayment}
                onChangeText={setMinPayment}
              />
            </View>
            <View style={styles.addActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.surfaceBorder }]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save Debt</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addTriggerBtn, { borderColor: colors.primaryLight }]}
            onPress={() => {
              hapticFeedback.light();
              setIsAdding(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
            <Text style={[styles.addTriggerText, { color: colors.primaryLight }]}>Add Debt Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  freedomCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTopLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  freedomDate: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    fontVariant: ['tabular-nums'],
  },
  statLbl: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    fontWeight: '600',
  },
  cardDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 10,
  },
  stratRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  stratBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  stratTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  stratSub: {
    fontSize: 10,
    marginTop: 2,
  },
  meltCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  meltHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  meltBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  meltBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  meltSavingsText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  debtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  debtOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  debtName: {
    fontSize: 13,
    fontWeight: '700',
  },
  debtMeta: {
    fontSize: 10,
    marginTop: 1,
  },
  debtBalance: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addTriggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    gap: 8,
  },
  addTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
