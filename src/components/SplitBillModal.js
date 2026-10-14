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

export function SplitBillModal({
  visible,
  splitBills,
  outstandingBalance,
  currencySymbol = '$',
  onAddSplit,
  onSettleUp,
  onDeleteSplit,
  onClose,
}) {
  const { colors, shadows } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [friends, setFriends] = useState(''); // comma-separated names

  const handleAdd = () => {
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please name this split (e.g. Dinner with Friends).');
      return;
    }
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid total amount.');
      return;
    }
    const names = friends
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (names.length === 0) {
      Alert.alert('Add Friends', 'Enter at least one friend name (comma separated).');
      return;
    }

    // Include user in total party count (friends.length + 1)
    const partySize = names.length + 1;
    const splitPerPerson = Math.round((total / partySize) * 100) / 100;

    const splits = names.map((name) => ({
      personName: name,
      owedAmount: splitPerPerson,
      isPaid: false,
    }));

    onAddSplit({
      description: description.trim(),
      totalAmount: total,
      paidBy: 'You',
      splits,
    });

    setDescription('');
    setTotalAmount('');
    setFriends('');
    setIsAdding(false);
  };

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Split Bills & IOUs"
      subtitle="Track group expenses & settle balances"
      maxHeight="92%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Outstanding Owed Balance Card */}
        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balanceCard, shadows.md]}
        >
          <View style={styles.balanceHeader}>
            <Ionicons name="people" size={18} color="#FFF" />
            <Text style={styles.balanceLabel}>OUTSTANDING OWED TO YOU</Text>
          </View>
          <Text style={[styles.balanceAmount, { fontVariant: ['tabular-nums'] }]}>
            {formatCurrency(outstandingBalance, currencySymbol)}
          </Text>
          <Text style={styles.balanceSubtext}>
            Total unpaid share across all shared expenses
          </Text>
        </LinearGradient>

        {/* Split Bills List */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            ACTIVE SPLITS ({splitBills.length})
          </Text>

          {splitBills.length === 0 && !isAdding && (
            <View style={[styles.emptyBox, { backgroundColor: colors.surfaceLight }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No split bills recorded. Create one to easily split dinner, rent, or trips!
              </Text>
            </View>
          )}

          {splitBills.map((bill) => (
            <View
              key={bill.id}
              style={[
                styles.billCard,
                { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
              ]}
            >
              <View style={styles.billTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.billDesc, { color: colors.textPrimary }]}>{bill.description}</Text>
                  <Text style={[styles.billDate, { color: colors.textMuted }]}>
                    Total {formatCurrency(bill.totalAmount, currencySymbol)} · Paid by {bill.paidBy}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    hapticFeedback.heavy();
                    onDeleteSplit(bill.id);
                  }}
                  style={{ padding: 4 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.expense} />
                </TouchableOpacity>
              </View>

              {/* Friends share list */}
              <View style={styles.sharesList}>
                {bill.splits?.map((person, idx) => (
                  <View
                    key={`${bill.id}-${idx}`}
                    style={[
                      styles.personRow,
                      { borderTopColor: colors.surfaceHighlight },
                    ]}
                  >
                    <View style={styles.personLeft}>
                      <View
                        style={[
                          styles.avatarDot,
                          { backgroundColor: person.isPaid ? colors.income : colors.warning },
                        ]}
                      />
                      <Text style={[styles.personName, { color: colors.textPrimary }]}>
                        {person.personName}
                      </Text>
                    </View>

                    <View style={styles.personRight}>
                      <Text
                        style={[
                          styles.personOwed,
                          { color: person.isPaid ? colors.income : colors.expense, fontVariant: ['tabular-nums'] },
                        ]}
                      >
                        {formatCurrency(person.owedAmount, currencySymbol)}
                      </Text>

                      {person.isPaid ? (
                        <View style={[styles.settledBadge, { backgroundColor: colors.incomeBg }]}>
                          <Ionicons name="checkmark" size={12} color={colors.income} />
                          <Text style={[styles.settledText, { color: colors.income }]}>Paid</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.settleBtn, { backgroundColor: colors.primary }]}
                          onPress={() => onSettleUp(bill.id, person.personName)}
                        >
                          <Text style={styles.settleBtnText}>Settle</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Add New Split Bill */}
        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <Text style={[styles.addCardTitle, { color: colors.textPrimary }]}>New Split Bill</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Event / Bill (e.g. Sushi Dinner, Airbnb)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Total Amount (e.g. 120.00)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={totalAmount}
              onChangeText={setTotalAmount}
            />
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Friends (e.g. Alice, Bob, Charlie)"
              placeholderTextColor={colors.textMuted}
              value={friends}
              onChangeText={setFriends}
            />
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              Cost will be split equally between you and your friends.
            </Text>

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
                <Text style={{ color: '#FFF', fontWeight: '700' }}>Split It</Text>
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
            <Text style={[styles.addTriggerText, { color: colors.primaryLight }]}>Split a New Bill</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  balanceCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  balanceAmount: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  balanceSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
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
  billCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  billTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  billDesc: { fontSize: 15, fontWeight: '700' },
  billDate: { fontSize: 11, marginTop: 2 },
  sharesList: { marginTop: 4 },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  personLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarDot: { width: 8, height: 8, borderRadius: 4 },
  personName: { fontSize: 13, fontWeight: '600' },
  personRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personOwed: { fontSize: 13, fontWeight: '700' },
  settledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  settledText: { fontSize: 11, fontWeight: '700' },
  settleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settleBtnText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
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
  helperText: { fontSize: 11, marginBottom: 14 },
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
