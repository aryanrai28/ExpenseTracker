import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { suggestCategory } from '../constants/merchantMap';
import { parseReceiptData } from '../utils/receiptOCR';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export function AddEditTransactionModal({
  visible,
  initialTransaction, // if provided, we are in EDIT mode!
  accounts = [],
  currencySymbol = '$',
  onClose,
  onSubmit,
  onTransfer,
}) {
  const { colors } = useTheme();
  const isEditMode = Boolean(initialTransaction);

  const [type, setType] = useState('expense'); // 'expense' | 'income' | 'transfer'
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [manualCategorySelected, setManualCategorySelected] = useState(false);
  const [autoCategoryMatch, setAutoCategoryMatch] = useState(null);

  const [accountId, setAccountId] = useState('default');
  const [toAccountId, setToAccountId] = useState('');

  const [datePreset, setDatePreset] = useState('today'); // 'today' | 'yesterday' | 'custom'
  const [customDate, setCustomDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [receiptUri, setReceiptUri] = useState(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Initialize form
  useEffect(() => {
    if (visible) {
      if (initialTransaction) {
        setType(initialTransaction.type || 'expense');
        setTitle(initialTransaction.title || '');
        setAmount(initialTransaction.amount ? initialTransaction.amount.toString() : '');
        setCategory(initialTransaction.category || (initialTransaction.type === 'income' ? 'salary' : 'food'));
        setManualCategorySelected(true);
        setAutoCategoryMatch(null);
        setAccountId(initialTransaction.accountId || 'default');
        setIsRecurring(Boolean(initialTransaction.isRecurring));
        setNotes(initialTransaction.notes || '');
        setReceiptUri(initialTransaction.receiptUri || null);

        // Date check
        const txDate = new Date(initialTransaction.date);
        const today = new Date();
        if (
          txDate.getDate() === today.getDate() &&
          txDate.getMonth() === today.getMonth() &&
          txDate.getFullYear() === today.getFullYear()
        ) {
          setDatePreset('today');
        } else {
          setDatePreset('custom');
          setCustomDate(initialTransaction.date.slice(0, 10));
        }
      } else {
        // New transaction defaults
        setType('expense');
        setTitle('');
        setAmount('');
        setCategory('food');
        setManualCategorySelected(false);
        setAutoCategoryMatch(null);
        setAccountId(accounts.length > 0 ? accounts[0].id : 'default');
        if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
        }
        setDatePreset('today');
        setCustomDate(new Date().toISOString().slice(0, 10));
        setIsRecurring(false);
        setNotes('');
        setReceiptUri(null);
      }
    }
  }, [visible, initialTransaction, accounts]);

  // When switching type, update default category
  const handleTypeChange = (newType) => {
    hapticFeedback.light();
    setType(newType);
    if (newType !== 'transfer') {
      setCategory(newType === 'income' ? 'salary' : 'food');
      setManualCategorySelected(false);
      setAutoCategoryMatch(null);
    }
  };

  // Title change with auto-categorization
  const handleTitleChange = (text) => {
    setTitle(text);
    if (!isEditMode && !manualCategorySelected && type === 'expense') {
      const suggestion = suggestCategory(text);
      if (suggestion) {
        setCategory(suggestion.categoryId);
        setAutoCategoryMatch(suggestion);
      } else {
        setAutoCategoryMatch(null);
      }
    }
  };

  // Quick Amount Add Chips
  const handleQuickAddAmount = (addVal) => {
    hapticFeedback.light();
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toFixed(2));
  };

  // Receipt image picker
  const handlePickReceipt = async () => {
    hapticFeedback.light();
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permissions are needed to attach a receipt.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const pickedUri = result.assets[0].uri;
        setReceiptUri(pickedUri);
        hapticFeedback.success();

        // Run smart heuristic OCR parser
        const parsed = await parseReceiptData(pickedUri);
        if (parsed.amount && !amount) {
          setAmount(parsed.amount.toFixed(2));
        }
        if (parsed.merchant && !title) {
          setTitle(parsed.merchant);
          const suggestion = suggestCategory(parsed.merchant);
          if (suggestion) {
            setCategory(suggestion.categoryId);
            setAutoCategoryMatch(suggestion);
          }
        }
      }
    } catch (e) {
      console.error('Image picker error:', e);
      Alert.alert('Photo Error', 'Could not open image library.');
    }
  };

  const handleRemoveReceipt = () => {
    hapticFeedback.light();
    setReceiptUri(null);
  };

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      hapticFeedback.error();
      Alert.alert('Invalid Amount', 'Please enter an amount greater than zero.');
      return;
    }

    // Handle Transfer submit
    if (type === 'transfer') {
      if (!accountId || !toAccountId || accountId === toAccountId) {
        Alert.alert('Invalid Accounts', 'Please select two different accounts for transfer.');
        return;
      }
      if (onTransfer) {
        onTransfer(accountId, toAccountId, parsedAmount, notes.trim());
      }
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      hapticFeedback.error();
      Alert.alert('Missing Title', 'Please enter a title for the transaction.');
      return;
    }

    if (!category) {
      hapticFeedback.error();
      Alert.alert('Category Required', 'Please choose a category.');
      return;
    }

    // Resolve date
    let finalDate = new Date().toISOString();
    if (datePreset === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      finalDate = y.toISOString();
    } else if (datePreset === 'custom' && customDate) {
      const parsed = new Date(customDate);
      if (!isNaN(parsed.getTime())) {
        finalDate = parsed.toISOString();
      }
    }

    onSubmit({
      ...(initialTransaction || {}),
      title: trimmedTitle,
      amount: parsedAmount,
      type,
      category,
      accountId: accountId || 'default',
      date: initialTransaction && datePreset === 'custom' ? finalDate : finalDate,
      isRecurring,
      notes: notes.trim(),
      receiptUri,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  {isEditMode ? 'Edit Transaction' : 'New Transaction'}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formScroll}
                keyboardShouldPersistTaps="handled"
              >
                {/* Type Toggle: Expense / Income / Transfer */}
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      { backgroundColor: colors.surfaceLight },
                      type === 'expense' && { backgroundColor: colors.expenseBg, borderColor: colors.expense, borderWidth: 1 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleTypeChange('expense')}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={17}
                      color={type === 'expense' ? colors.expense : colors.textMuted}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.toggleText, { color: type === 'expense' ? colors.expense : colors.textSecondary }]}>
                      Expense
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      { backgroundColor: colors.surfaceLight },
                      type === 'income' && { backgroundColor: colors.incomeBg, borderColor: colors.income, borderWidth: 1 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleTypeChange('income')}
                  >
                    <Ionicons
                      name="arrow-down-circle"
                      size={17}
                      color={type === 'income' ? colors.income : colors.textMuted}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[styles.toggleText, { color: type === 'income' ? colors.income : colors.textSecondary }]}>
                      Income
                    </Text>
                  </TouchableOpacity>

                  {!isEditMode && onTransfer && accounts.length > 1 && (
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        { backgroundColor: colors.surfaceLight },
                        type === 'transfer' && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight, borderWidth: 1 },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleTypeChange('transfer')}
                    >
                      <Ionicons
                        name="swap-horizontal"
                        size={17}
                        color={type === 'transfer' ? colors.primaryLight : colors.textMuted}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={[styles.toggleText, { color: type === 'transfer' ? colors.primaryLight : colors.textSecondary }]}>
                        Transfer
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Amount Input with Currency Symbol */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Amount ({currencySymbol})
                </Text>
                <View style={[styles.amountInputWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
                  <Text style={[styles.currencyPrefix, { color: colors.primaryLight }]}>{currencySymbol}</Text>
                  <TextInput
                    style={[styles.amountInput, { color: colors.textPrimary }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    maxLength={10}
                  />
                </View>

                {/* Quick Add Chips */}
                <View style={styles.quickChipsRow}>
                  {[10, 50, 100, 500].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.quickChip, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
                      activeOpacity={0.7}
                      onPress={() => handleQuickAddAmount(val)}
                    >
                      <Text style={[styles.quickChipText, { color: colors.textPrimary }]}>
                        +{currencySymbol}{val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Transfer View Mode */}
                {type === 'transfer' ? (
                  <View style={styles.transferSection}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>From Account</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountPillsRow}>
                      {accounts.map((acc) => (
                        <TouchableOpacity
                          key={`from-${acc.id}`}
                          style={[
                            styles.accPill,
                            { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                            accountId === acc.id && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight },
                          ]}
                          onPress={() => setAccountId(acc.id)}
                        >
                          <Ionicons name={acc.icon || 'card-outline'} size={14} color={accountId === acc.id ? colors.primaryLight : colors.textMuted} />
                          <Text style={[styles.accPillText, { color: accountId === acc.id ? colors.primaryLight : colors.textSecondary }]}>
                            {acc.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>To Account</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountPillsRow}>
                      {accounts.map((acc) => (
                        <TouchableOpacity
                          key={`to-${acc.id}`}
                          style={[
                            styles.accPill,
                            { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                            toAccountId === acc.id && { backgroundColor: colors.incomeBg, borderColor: colors.income },
                          ]}
                          onPress={() => setToAccountId(acc.id)}
                        >
                          <Ionicons name={acc.icon || 'card-outline'} size={14} color={toAccountId === acc.id ? colors.income : colors.textMuted} />
                          <Text style={[styles.accPillText, { color: toAccountId === acc.id ? colors.income : colors.textSecondary }]}>
                            {acc.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <>
                    {/* Account Selector Strip */}
                    {accounts.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Account / Wallet</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.accountPillsRow}>
                          {accounts.map((acc) => {
                            const isAccActive = accountId === acc.id;
                            return (
                              <TouchableOpacity
                                key={acc.id}
                                style={[
                                  styles.accPill,
                                  { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                                  isAccActive && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight },
                                ]}
                                onPress={() => setAccountId(acc.id)}
                              >
                                <Ionicons
                                  name={acc.icon || 'card-outline'}
                                  size={14}
                                  color={isAccActive ? colors.primaryLight : colors.textMuted}
                                />
                                <Text
                                  style={[
                                    styles.accPillText,
                                    { color: isAccActive ? colors.primaryLight : colors.textSecondary },
                                  ]}
                                >
                                  {acc.name}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}

                    {/* Title Input */}
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Title</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
                      placeholder="e.g. Starbucks, Uber, Grocery"
                      placeholderTextColor={colors.textMuted}
                      value={title}
                      onChangeText={handleTitleChange}
                      maxLength={50}
                    />

                    {/* Category Grid with Auto-Categorize Badge */}
                    <View style={styles.categoryHeaderRow}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
                      {autoCategoryMatch && (
                        <View style={[styles.autoBadge, { backgroundColor: colors.primaryGlow }]}>
                          <Text style={[styles.autoBadgeText, { color: colors.primaryLight }]}>
                            ✨ Auto-categorized
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.categoryGrid}>
                      {categories.map((cat) => {
                        const isSelected = category === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              styles.categoryPill,
                              { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                              isSelected && {
                                backgroundColor: cat.color + '22',
                                borderColor: cat.color,
                              },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              hapticFeedback.light();
                              setCategory(cat.id);
                              setManualCategorySelected(true);
                              setAutoCategoryMatch(null);
                            }}
                          >
                            <Ionicons
                              name={cat.icon}
                              size={16}
                              color={isSelected ? cat.color : colors.textSecondary}
                              style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.categoryText, { color: colors.textSecondary }, isSelected && { color: cat.color }]}>
                              {cat.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Date Presets */}
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
                    <View style={styles.datePresetRow}>
                      {[
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'custom', label: 'Custom' },
                      ].map((p) => {
                        const isSelected = datePreset === p.id;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[
                              styles.datePresetBtn,
                              { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder },
                              isSelected && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              hapticFeedback.light();
                              setDatePreset(p.id);
                            }}
                          >
                            <Text style={[styles.datePresetText, { color: colors.textSecondary }, isSelected && { color: colors.primaryLight }]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {datePreset === 'custom' && (
                      <TextInput
                        style={[styles.textInput, { marginTop: 8, backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
                        placeholder="YYYY-MM-DD (e.g. 2026-09-08)"
                        placeholderTextColor={colors.textMuted}
                        value={customDate}
                        onChangeText={setCustomDate}
                        maxLength={10}
                      />
                    )}

                    {/* Recurring Checkbox Toggle */}
                    <TouchableOpacity
                      style={[styles.recurringToggleRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
                      activeOpacity={0.8}
                      onPress={() => {
                        hapticFeedback.light();
                        setIsRecurring(!isRecurring);
                      }}
                    >
                      <View style={styles.recurringLabelGroup}>
                        <Ionicons name="repeat-outline" size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
                        <View>
                          <Text style={[styles.recurringTitle, { color: colors.textPrimary }]}>Monthly Recurring</Text>
                          <Text style={[styles.recurringSubtitle, { color: colors.textMuted }]}>Bill, subscription, or recurring salary</Text>
                        </View>
                      </View>
                      <Ionicons
                        name={isRecurring ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isRecurring ? colors.primaryLight : colors.textMuted}
                      />
                    </TouchableOpacity>
                  </>
                )}

                {/* Notes Input */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
                  placeholder="Add additional memo or notes..."
                  placeholderTextColor={colors.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                  maxLength={150}
                />

                {/* Receipt Photo Attachment (Expense only) */}
                {type !== 'transfer' && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Receipt Photo</Text>
                    {receiptUri ? (
                      <View style={styles.receiptPreviewWrap}>
                        <Image source={{ uri: receiptUri }} style={styles.receiptPreviewImg} />
                        <TouchableOpacity style={styles.removeReceiptBtn} onPress={handleRemoveReceipt}>
                          <Ionicons name="trash-outline" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.attachReceiptBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
                        activeOpacity={0.7}
                        onPress={handlePickReceipt}
                      >
                        <Ionicons name="camera-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={[styles.attachReceiptText, { color: colors.textSecondary }]}>Attach Receipt Image</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Submit Action Button */}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    {
                      backgroundColor:
                        type === 'income'
                          ? colors.income
                          : type === 'transfer'
                          ? colors.primary
                          : colors.primary,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={handleSubmit}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>
                    {isEditMode
                      ? 'Save Changes'
                      : type === 'transfer'
                      ? 'Complete Transfer'
                      : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    paddingBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: 12,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 14,
  },
  accountPillsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  accPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  accPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  transferSection: {
    marginBottom: 14,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  autoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  datePresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  datePresetBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  datePresetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recurringToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  recurringLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recurringSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  attachReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  attachReceiptText: {
    fontSize: 13,
    fontWeight: '600',
  },
  receiptPreviewWrap: {
    position: 'relative',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  receiptPreviewImg: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F43F5E',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
