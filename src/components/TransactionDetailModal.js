import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getCategoryMeta } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';

export function TransactionDetailModal({
  visible,
  transaction,
  currencySymbol = '$',
  isBalanceHidden = false,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const { colors } = useTheme();

  if (!transaction) return null;

  const { id, title, amount, type, category, date, isRecurring, notes, receiptUri } = transaction;
  const isIncome = type === 'income';
  const cat = getCategoryMeta(category);
  const amountColor = isIncome ? colors.income : colors.expense;

  const handleDeletePress = () => {
    hapticFeedback.medium();
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to permanently remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDuplicatePress = () => {
    onDuplicate(id);
    onClose();
  };

  const handleEditPress = () => {
    onEdit(transaction);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transaction Details</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Amount Banner */}
            <View style={[styles.amountBanner, { backgroundColor: colors.surfaceLight }]}>
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '22' }]}>
                <Ionicons name={cat.icon} size={28} color={cat.color} />
              </View>
              <Text style={[styles.amountText, { color: amountColor }]}>
                {isIncome ? '+' : '-'}
                {formatCurrency(amount, currencySymbol, isBalanceHidden)}
              </Text>
              <Text style={[styles.titleText, { color: colors.textSecondary }]}>{title}</Text>
            </View>

            {/* Details Table */}
            <View style={[styles.detailsGroup, { backgroundColor: colors.surfaceLight }]}>
              <View style={[styles.detailItem, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Type</Text>
                <View style={[styles.typeBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.typeText, { color: amountColor }]}>
                    {isIncome ? 'Income' : 'Expense'}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailItem, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Category</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{cat.label}</Text>
              </View>

              <View style={[styles.detailItem, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Date & Time</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formatDate(date)}</Text>
              </View>

              <View style={[styles.detailItem, { borderBottomColor: colors.divider }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Recurring</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {isRecurring ? 'Yes (Monthly)' : 'No (One-time)'}
                </Text>
              </View>

              {Boolean(notes) && (
                <View style={[styles.detailItem, styles.notesItem, { borderBottomColor: colors.divider }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Notes</Text>
                  <Text style={[styles.notesValue, { color: colors.textPrimary }]}>{notes}</Text>
                </View>
              )}
            </View>

            {/* Attached Receipt Image */}
            {Boolean(receiptUri) && (
              <View style={styles.receiptSection}>
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Attached Receipt</Text>
                <View style={[styles.receiptImageWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
                  <Image source={{ uri: receiptUri }} style={styles.receiptImage} resizeMode="cover" />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={handleEditPress}
              >
                <Ionicons name="create-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.white }]}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.primaryLight }]}
                activeOpacity={0.8}
                onPress={handleDuplicatePress}
              >
                <Ionicons name="copy-outline" size={18} color={colors.primaryLight} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.primaryLight }]}>Duplicate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderWidth: 1, borderColor: colors.expenseBorder }]}
                activeOpacity={0.8}
                onPress={handleDeletePress}
              >
                <Ionicons name="trash-outline" size={18} color={colors.expense} style={{ marginRight: 6 }} />
                <Text style={[styles.actionBtnText, { color: colors.expense }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, maxHeight: '88%', borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 20 },
  amountBanner: { alignItems: 'center', paddingVertical: 18, borderRadius: 20, marginBottom: 20 },
  categoryIconWrap: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  amountText: { fontSize: 32, fontWeight: '800', letterSpacing: -0.6, marginBottom: 4 },
  titleText: { fontSize: 17, fontWeight: '600' },
  detailsGroup: { borderRadius: 16, padding: 16, marginBottom: 16 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  notesItem: { flexDirection: 'column', alignItems: 'flex-start', borderBottomWidth: 0, paddingBottom: 4 },
  detailLabel: { fontSize: 13, fontWeight: '600' },
  detailValue: { fontSize: 14, fontWeight: '600' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { fontSize: 13, fontWeight: '700' },
  notesValue: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  receiptSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  receiptImageWrap: { height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  receiptImage: { width: '100%', height: '100%' },
  actionsContainer: { gap: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingVertical: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
});
