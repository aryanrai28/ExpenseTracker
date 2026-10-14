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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';
import { LiquidGlassModal } from './LiquidGlassModal';

export function SavingsGoalsModal({
  visible,
  goals,
  roundUpSimulation,
  currencySymbol = '$',
  onAddGoal,
  onAddContribution,
  onDeleteGoal,
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Quick contribute state
  const [contributingGoalId, setContributingGoalId] = useState(null);
  const [contribAmount, setContribAmount] = useState('');

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a goal name.');
      return;
    }
    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target amount.');
      return;
    }

    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      deadline: deadline.trim() || undefined,
      color: colors.primary,
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setIsAdding(false);
  };

  const handleContributeSubmit = (goalId) => {
    const amount = parseFloat(contribAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a positive contribution.');
      return;
    }
    onAddContribution(goalId, amount);
    setContributingGoalId(null);
    setContribAmount('');
  };

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Savings Targets"
      subtitle="Visual progress & round-up micro-savings"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Round-Up Simulator Card */}
        {roundUpSimulation && (
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.simCard, shadows.md]}
          >
            <View style={styles.simHeader}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
              <Text style={styles.simLabel}>ROUND-UP SAVINGS RADAR</Text>
            </View>
            <Text style={[styles.simHeadline, { fontVariant: ['tabular-nums'] }]}>
              Save {formatCurrency(roundUpSimulation.totalRoundUp, currencySymbol)} effortlessly
            </Text>
            <Text style={styles.simDesc}>
              By rounding up {roundUpSimulation.transactionCount} recent purchases to the nearest dollar, you'd automatically save spare change.
            </Text>
          </LinearGradient>
        )}

        {/* Goals List */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            ACTIVE GOALS ({goals.length})
          </Text>

          {goals.length === 0 && !isAdding && (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="flag-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No savings goals yet. Create a goal to start tracking progress!
              </Text>
            </View>
          )}

          {goals.map((goal) => {
            const current = Number(goal.currentAmount || 0);
            const target = Number(goal.targetAmount || 1);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const isCompleted = current >= target;

            return (
              <View
                key={goal.id}
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.surfaceLight, borderColor: isCompleted ? colors.income : colors.surfaceBorder },
                ]}
              >
                <View style={styles.goalTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.goalName, { color: colors.textPrimary }]}>{goal.name}</Text>
                      {isCompleted && (
                        <View style={[styles.completedBadge, { backgroundColor: colors.incomeBg }]}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.income} />
                          <Text style={[styles.completedText, { color: colors.income }]}>Achieved!</Text>
                        </View>
                      )}
                    </View>
                    {goal.deadline && (
                      <Text style={[styles.goalDeadline, { color: colors.textMuted }]}>
                        Target: {goal.deadline}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      hapticFeedback.heavy();
                      onDeleteGoal(goal.id);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.expense} />
                  </TouchableOpacity>
                </View>

                {/* Progress Track */}
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceHighlight }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${pct}%`,
                        backgroundColor: isCompleted ? colors.income : colors.primary,
                      },
                    ]}
                  />
                </View>

                <View style={styles.goalMetaRow}>
                  <Text style={[styles.amountLabel, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
                    {formatCurrency(current, currencySymbol)}{' '}
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontVariant: ['tabular-nums'] }}>
                      of {formatCurrency(target, currencySymbol)}
                    </Text>
                  </Text>
                  <Text style={[styles.pctLabel, { color: isCompleted ? colors.income : colors.primaryLight, fontVariant: ['tabular-nums'] }]}>
                    {pct}%
                  </Text>
                </View>

                {/* Contribution Input / Trigger */}
                {contributingGoalId === goal.id ? (
                  <View style={styles.contribBox}>
                    <TextInput
                      style={[styles.contribInput, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                      placeholder="Deposit amount (e.g. 50)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={contribAmount}
                      onChangeText={setContribAmount}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[styles.contribActionBtn, { backgroundColor: colors.income }]}
                      onPress={() => handleContributeSubmit(goal.id)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.contribActionBtn, { backgroundColor: colors.surfaceBorder }]}
                      onPress={() => setContributingGoalId(null)}
                    >
                      <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.depositBtn, { backgroundColor: colors.primaryGlow }]}
                    onPress={() => {
                      hapticFeedback.light();
                      setContributingGoalId(goal.id);
                    }}
                  >
                    <Ionicons name="add" size={16} color={colors.primaryLight} style={{ marginRight: 4 }} />
                    <Text style={[styles.depositBtnText, { color: colors.primaryLight }]}>Add Savings Deposit</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Add New Goal */}
        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <Text style={[styles.addCardTitle, { color: colors.textPrimary }]}>New Savings Goal</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Goal (e.g. Emergency Fund, Vacation, Car)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Target Amount (e.g. 5000)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Deadline (optional, e.g. Dec 2026)"
              placeholderTextColor={colors.textMuted}
              value={deadline}
              onChangeText={setDeadline}
            />

            <View style={styles.addActions}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.surfaceBorder }]}
                onPress={() => setIsAdding(false)}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Create Goal</Text>
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
            <Text style={[styles.addTriggerText, { color: colors.primaryLight }]}>Create New Goal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  simCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  simHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  simLabel: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  simHeadline: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  simDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    gap: 8,
  },
  emptyText: { fontSize: 13, textAlign: 'center' },
  goalCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  goalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  goalName: { fontSize: 15, fontWeight: '700' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 3 },
  completedText: { fontSize: 11, fontWeight: '700' },
  goalDeadline: { fontSize: 11, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', borderRadius: 4 },
  goalMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  amountLabel: { fontSize: 13, fontWeight: '700' },
  pctLabel: { fontSize: 13, fontWeight: '800' },
  depositBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  depositBtnText: { fontSize: 12, fontWeight: '700' },
  contribBox: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  contribInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 13,
  },
  contribActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 8,
  },
  addCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 6,
  },
  addTriggerText: { fontSize: 14, fontWeight: '700' },
});
