import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ACCOUNT_TYPES } from '../constants/accounts';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';
import { LiquidGlassModal } from './LiquidGlassModal';

export function AccountsModal({ visible, accounts, accountBalances, currencySymbol, onAddAccount, onDeleteAccount, onClose }) {
  const { colors } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('checking');

  const handleAdd = () => {
    if (!newName.trim()) { Alert.alert('Name Required', 'Enter an account name.'); return; }
    const typeMeta = ACCOUNT_TYPES.find(t => t.id === newType) || ACCOUNT_TYPES[0];
    onAddAccount({ name: newName.trim(), type: newType, icon: typeMeta.icon, color: typeMeta.defaultColor });
    setNewName(''); setIsAdding(false);
  };

  const totalBalance = Object.values(accountBalances).reduce((s, v) => s + v, 0);

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Accounts & Wallets"
      subtitle={`Total Net: ${formatCurrency(totalBalance, currencySymbol)}`}
      maxHeight="90%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {accounts.map(acc => (
          <View key={acc.id} style={[styles.accRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
            <View style={[styles.accIcon, { backgroundColor: (acc.color || colors.primary) + '22' }]}>
              <Ionicons name={acc.icon || 'wallet-outline'} size={22} color={acc.color || colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accName, { color: colors.textPrimary }]}>{acc.name}</Text>
              <Text style={[styles.accType, { color: colors.textMuted }]}>
                {ACCOUNT_TYPES.find(t => t.id === acc.type)?.label || acc.type}
              </Text>
            </View>
            <Text
              style={[
                styles.accBalance,
                {
                  color: (accountBalances[acc.id] || 0) >= 0 ? colors.income : colors.expense,
                  fontVariant: ['tabular-nums'],
                },
              ]}
            >
              {formatCurrency(accountBalances[acc.id] || 0, currencySymbol)}
            </Text>
            {!acc.isDefault && (
              <TouchableOpacity onPress={() => { hapticFeedback.heavy(); onDeleteAccount(acc.id); }} style={{ padding: 6 }}>
                <Ionicons name="trash-outline" size={16} color={colors.expense} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surface }]}
              placeholder="Account name..."
              placeholderTextColor={colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
              {ACCOUNT_TYPES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, { backgroundColor: newType === t.id ? colors.primary : colors.surface, borderColor: newType === t.id ? colors.primaryLight : colors.surfaceBorder }]}
                  onPress={() => setNewType(t.id)}
                >
                  <Ionicons name={t.icon} size={14} color={newType === t.id ? colors.white : colors.textSecondary} />
                  <Text style={[styles.typeChipText, { color: newType === t.id ? colors.white : colors.textSecondary }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAdd}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>Add Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.surfaceBorder }]} onPress={() => setIsAdding(false)}>
                <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addBtn, { borderColor: colors.primaryLight }]} onPress={() => setIsAdding(true)}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primaryLight} />
            <Text style={[styles.addBtnText, { color: colors.primaryLight }]}>Add New Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  accRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, gap: 10 },
  accIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  accName: { fontSize: 15, fontWeight: '700' },
  accType: { fontSize: 12, marginTop: 2 },
  accBalance: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  addCard: { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 8 },
  input: { fontSize: 15, fontWeight: '600', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 8, gap: 4 },
  typeChipText: { fontSize: 12, fontWeight: '600' },
  saveBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', gap: 6, marginTop: 4 },
  addBtnText: { fontSize: 14, fontWeight: '700' },
});
