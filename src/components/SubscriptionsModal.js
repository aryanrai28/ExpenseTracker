import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';
import { LiquidGlassModal } from './LiquidGlassModal';

const FREQUENCIES = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export function SubscriptionsModal({
  visible,
  subscriptions,
  monthlyBurnRate,
  annualBurnRate,
  upcomingBills,
  currencySymbol = '$',
  onAddSubscription,
  onToggleActive,
  onDeleteSubscription,
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a subscription name.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const dueDate = nextDueDate.trim() || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    onAddSubscription({
      name: name.trim(),
      amount: numAmount,
      frequency,
      nextDueDate: dueDate,
      icon: 'repeat-outline',
      color: colors.primary,
    });

    setName('');
    setAmount('');
    setFrequency('monthly');
    setNextDueDate('');
    setIsAdding(false);
  };

  const getDaysUntil = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const now = new Date();
    const diff = Math.ceil((due - now) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `in ${diff} days`;
  };

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Subscriptions & Bills"
      subtitle="Recurring burn rate & renewal radar"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Burn Rate Card */}
        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.burnCard, shadows.md]}
        >
          <View style={styles.burnHeader}>
            <Ionicons name="flame" size={20} color="#FFD700" />
            <Text style={styles.burnLabel}>BURNOUT RUNRATE</Text>
          </View>
          <View style={styles.burnRow}>
            <View>
              <Text style={[styles.burnAmount, { fontVariant: ['tabular-nums'] }]}>
                {formatCurrency(monthlyBurnRate, currencySymbol)}
              </Text>
              <Text style={styles.burnSubtext}>Monthly Cost</Text>
            </View>
            <View style={styles.burnDivider} />
            <View>
              <Text style={[styles.burnAmount, { fontVariant: ['tabular-nums'] }]}>
                {formatCurrency(annualBurnRate, currencySymbol)}
              </Text>
              <Text style={styles.burnSubtext}>Annual Projected</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Upcoming Bills Radar */}
        {upcomingBills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="alarm-outline" size={16} color={colors.warning} />
              <Text style={[styles.sectionHeader, { color: colors.warning }]}>DUE IN NEXT 7 DAYS</Text>
            </View>
            {upcomingBills.map((bill) => (
              <View
                key={`up-${bill.id}`}
                style={[styles.billAlertRow, { backgroundColor: colors.surfaceLight, borderColor: colors.warningBorder }]}
              >
                <View style={styles.billAlertLeft}>
                  <Text style={[styles.subName, { color: colors.textPrimary }]}>{bill.name}</Text>
                  <Text style={[styles.badgeText, { color: colors.warning }]}>
                    {getDaysUntil(bill.nextDueDate)}
                  </Text>
                </View>
                <Text style={[styles.billAlertAmount, { color: colors.expense, fontVariant: ['tabular-nums'] }]}>
                  {formatCurrency(bill.amount, currencySymbol)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Subscriptions List */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
              ALL SUBSCRIPTIONS ({subscriptions.length})
            </Text>
          </View>

          {subscriptions.length === 0 && !isAdding && (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recurring subscriptions tracked yet.
              </Text>
            </View>
          )}

          {subscriptions.map((sub) => {
            const badge = getDaysUntil(sub.nextDueDate);
            return (
              <View
                key={sub.id}
                style={[
                  styles.subRow,
                  { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                  !sub.isActive && { opacity: 0.5 },
                ]}
              >
                <View style={[styles.subIcon, { backgroundColor: colors.primaryGlow }]}>
                  <Ionicons name={sub.icon || 'card-outline'} size={20} color={colors.primaryLight} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.subName, { color: colors.textPrimary }]}>{sub.name}</Text>
                  <View style={styles.subMeta}>
                    <Text style={[styles.subFrequency, { color: colors.textMuted }]}>
                      {sub.frequency.charAt(0).toUpperCase() + sub.frequency.slice(1)}
                    </Text>
                    {badge && (
                      <Text style={[styles.dueBadge, { color: colors.info }]}>• {badge}</Text>
                    )}
                  </View>
                </View>

                <Text style={[styles.subAmount, { color: colors.textPrimary, fontVariant: ['tabular-nums'] }]}>
                  {formatCurrency(sub.amount, currencySymbol)}
                </Text>

                <Switch
                  value={sub.isActive}
                  onValueChange={() => onToggleActive(sub.id)}
                  trackColor={{ false: colors.surfaceHighlight, true: colors.primaryLight }}
                  thumbColor="#FFF"
                  style={{ transform: [{ scale: 0.8 }], marginLeft: 8 }}
                />

                <TouchableOpacity
                  onPress={() => {
                    hapticFeedback.heavy();
                    onDeleteSubscription(sub.id);
                  }}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.expense} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Add New Subscription Form */}
        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <Text style={[styles.addCardTitle, { color: colors.textPrimary }]}>New Subscription</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Service (e.g. Netflix, Spotify, Gym)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Amount (e.g. 15.99)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Next Due Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textMuted}
              value={nextDueDate}
              onChangeText={setNextDueDate}
            />

            {/* Frequency selector */}
            <View style={styles.freqRow}>
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.freqBtn,
                    { backgroundColor: colors.surface },
                    frequency === f.id && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setFrequency(f.id)}
                >
                  <Text
                    style={[
                      styles.freqText,
                      { color: frequency === f.id ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Save Subscription</Text>
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
            <Text style={[styles.addTriggerText, { color: colors.primaryLight }]}>Add Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  burnCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  burnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  burnLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  burnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  burnAmount: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  burnSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 2 },
  burnDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  section: { marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 6 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  billAlertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  billAlertLeft: { flex: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  billAlertAmount: { fontSize: 15, fontWeight: '700' },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  subIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subName: { fontSize: 14, fontWeight: '700' },
  subMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  subFrequency: { fontSize: 11 },
  dueBadge: { fontSize: 11, marginLeft: 6 },
  subAmount: { fontSize: 15, fontWeight: '700', marginHorizontal: 8 },
  deleteBtn: { padding: 6, marginLeft: 2 },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    gap: 8,
  },
  emptyText: { fontSize: 13, textAlign: 'center' },
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
  freqRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  freqBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  freqText: { fontSize: 12, fontWeight: '600' },
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
