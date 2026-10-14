import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

import { LiquidGlassModal } from './LiquidGlassModal';

export function BudgetModal({
  visible,
  budgetReports,
  budgets,
  currencySymbol = '$',
  onSaveBudget,
  onClose,
}) {
  const { colors } = useTheme();
  const [editingCategory, setEditingCategory] = useState(null);
  const [inputLimit, setInputLimit] = useState('');

  const handleStartEdit = (cat) => {
    hapticFeedback.light();
    setEditingCategory(cat);
    const existing = budgets[cat.id] || 0;
    setInputLimit(existing > 0 ? existing.toString() : '');
  };

  const handleSaveCategoryLimit = () => {
    if (!editingCategory) return;
    const parsed = parseFloat(inputLimit) || 0;
    onSaveBudget(editingCategory.id, parsed);
    hapticFeedback.success();
    setEditingCategory(null);
    setInputLimit('');
  };

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Monthly Budgets"
      subtitle="Set spending thresholds and alerts"
      maxHeight="88%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Edit Budget Input */}
        {editingCategory && (
          <View style={[styles.editCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
            <View style={styles.editHeader}>
              <Text style={[styles.editTitle, { color: colors.textPrimary }]}>Set Budget: {editingCategory.label}</Text>
              <TouchableOpacity onPress={() => setEditingCategory(null)}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.editInputRow}>
              <Text style={[styles.currencyPrefix, { color: colors.primaryLight }]}>{currencySymbol}</Text>
              <TextInput
                style={[styles.editInput, { color: colors.textPrimary, backgroundColor: colors.surface }]}
                placeholder="e.g. 500"
                placeholderTextColor={colors.textMuted}
                value={inputLimit}
                onChangeText={setInputLimit}
                keyboardType="numeric"
                autoFocus
              />
              <TouchableOpacity style={[styles.saveLimitBtn, { backgroundColor: colors.primary }]} onPress={handleSaveCategoryLimit}>
                <Text style={[styles.saveLimitBtnText, { color: colors.white }]}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Category Budget List */}
        {EXPENSE_CATEGORIES.map((cat) => {
          const report = budgetReports.find((r) => r.category.id === cat.id);
          const limit = budgets[cat.id] || 0;
          const spent = report ? report.spent : 0;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = limit > 0 && spent > limit;

          let barColor = colors.income;
          if (limit > 0) {
            if (spent >= limit) barColor = colors.expense;
            else if (spent / limit >= 0.7) barColor = colors.warning;
          }

          return (
            <View key={cat.id} style={[styles.budgetRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
              <View style={styles.budgetRowTop}>
                <View style={styles.categoryInfoGroup}>
                  <View style={[styles.catIconWrap, { backgroundColor: cat.color + '22' }]}>
                    <Ionicons name={cat.icon} size={18} color={cat.color} />
                  </View>
                  <View>
                    <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.label}</Text>
                    <Text style={[styles.catBudgetSub, { color: colors.textSecondary }]}>
                      {limit > 0
                        ? `Spent ${formatCurrency(spent, currencySymbol)} of ${formatCurrency(limit, currencySymbol)}`
                        : `Spent ${formatCurrency(spent, currencySymbol)} (No limit)`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.editBudgetBtn, { backgroundColor: colors.surface }]}
                  onPress={() => handleStartEdit(cat)}
                >
                  <Ionicons name="pencil" size={14} color={colors.primaryLight} />
                </TouchableOpacity>
              </View>

              {limit > 0 && (
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.surface }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${percentage}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                  <View style={styles.progressFooter}>
                    <Text style={[styles.statusText, { color: barColor }]}>
                      {isOver
                        ? `Exceeded by ${formatCurrency(spent - limit, currencySymbol)}`
                        : `${percentage.toFixed(0)}% used · ${formatCurrency(limit - spent, currencySymbol)} left`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, maxHeight: '88%', borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 24 },
  editCard: { borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1 },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  editTitle: { fontSize: 14, fontWeight: '700' },
  editInputRow: { flexDirection: 'row', alignItems: 'center' },
  currencyPrefix: { fontSize: 18, fontWeight: '700', marginRight: 6 },
  editInput: { flex: 1, fontSize: 16, fontWeight: '600', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  saveLimitBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 10 },
  saveLimitBtnText: { fontSize: 14, fontWeight: '700' },
  budgetRow: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  budgetRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryInfoGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  catName: { fontSize: 14, fontWeight: '700' },
  catBudgetSub: { fontSize: 12, marginTop: 2 },
  editBudgetBtn: { padding: 8, borderRadius: 10 },
  progressContainer: { marginTop: 10 },
  progressBarBg: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressFooter: { marginTop: 5, flexDirection: 'row', justifyContent: 'flex-end' },
  statusText: { fontSize: 11, fontWeight: '600' },
});
