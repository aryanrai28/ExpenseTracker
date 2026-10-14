import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCard';
import { FilterSortBar } from '../components/FilterSortBar';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { AddEditTransactionModal } from '../components/AddEditTransactionModal';
import { SpendingChart } from '../components/SpendingChart';
import { BudgetModal } from '../components/BudgetModal';
import { SettingsModal } from '../components/SettingsModal';
import { ThemePickerModal } from '../components/ThemePickerModal';
import { AccountsModal } from '../components/AccountsModal';
import { SubscriptionsModal } from '../components/SubscriptionsModal';
import { SavingsGoalsModal } from '../components/SavingsGoalsModal';
import { SplitBillModal } from '../components/SplitBillModal';
import { FinancialAuroraGlow } from '../components/FinancialAuroraGlow';
import { DailySpendingHeatmap } from '../components/DailySpendingHeatmap';
import { FinancialHealthScoreModal } from '../components/FinancialHealthScoreModal';
import { CashflowForecasterModal } from '../components/CashflowForecasterModal';
import { MoneyRulesModal } from '../components/MoneyRulesModal';
import { DebtPayoffModal } from '../components/DebtPayoffModal';
import { ChallengesModal } from '../components/ChallengesModal';
import { WidgetPreviewModal } from '../components/WidgetPreviewModal';
import { RadialSpeedDialFAB } from '../components/RadialSpeedDialFAB';
import { DailyPulseCard } from '../components/DailyPulseCard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { EmptyState } from '../components/EmptyState';
import { computeFinancialHealthScore } from '../utils/financialHealthScore';
import { parseReceiptData } from '../utils/receiptOCR';
import { formatCurrency } from '../utils/formatters';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export function MainScreen({
  transactions = [],
  filteredTransactions = [],
  searchQuery = '',
  setSearchQuery,
  typeFilter = 'all',
  setTypeFilter,
  dateRangeFilter = 'all',
  setDateRangeFilter,
  sortBy = 'date_desc',
  setSortBy,
  accountFilter = 'all',
  setAccountFilter,
  totalBalance = 0,
  totalIncome = 0,
  totalExpense = 0,
  categoryBreakdown = { categories: [], totalExpense: 0 },
  onAddTransaction,
  onUpdateTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
  onTransfer,
  onResetDemo,
  onClearAll,
  // Settings & Budgets
  currency,
  onSelectCurrency,
  isBalanceHidden,
  onTogglePrivacy,
  isBiometricEnabled,
  onToggleBiometric,
  isHardwareSupported,
  isSoundMuted,
  onToggleSound,
  isShakeToHideEnabled,
  onToggleShakeToHide,
  decoyPin,
  onSetDecoyPin,
  budgets = {},
  budgetReports = [],
  onSaveBudget,
  // Multi-Account
  accounts = [],
  accountBalances = {},
  onAddAccount,
  onDeleteAccount,
  // Subscriptions
  subscriptions = [],
  monthlyBurnRate = 0,
  annualBurnRate = 0,
  upcomingBills = [],
  onAddSubscription,
  onToggleSubscription,
  onDeleteSubscription,
  // Savings Goals
  goals = [],
  roundUpSimulation,
  onAddGoal,
  onAddContribution,
  onDeleteGoal,
  // Split Bills
  splitBills = [],
  outstandingBalance = 0,
  onAddSplit,
  onSettleUp,
  onDeleteSplit,
  // v4.0 Managers
  moneyRulesManager,
  debtManager,
  challengesManager,
}) {
  const { colors, shadows } = useTheme();
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'analytics'

  // Modals state
  const [addEditModalVisible, setAddEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [accountsModalVisible, setAccountsModalVisible] = useState(false);
  const [subscriptionsModalVisible, setSubscriptionsModalVisible] = useState(false);
  const [savingsGoalsModalVisible, setSavingsGoalsModalVisible] = useState(false);
  const [splitBillModalVisible, setSplitBillModalVisible] = useState(false);

  // v4.0 Modals
  const [healthScoreModalVisible, setHealthScoreModalVisible] = useState(false);
  const [forecasterModalVisible, setForecasterModalVisible] = useState(false);
  const [moneyRulesModalVisible, setMoneyRulesModalVisible] = useState(false);
  const [debtPayoffModalVisible, setDebtPayoffModalVisible] = useState(false);
  const [challengesModalVisible, setChallengesModalVisible] = useState(false);
  const [widgetPreviewModalVisible, setWidgetPreviewModalVisible] = useState(false);

  // Financial Health Score calculation
  const healthData = useMemo(() => {
    return computeFinancialHealthScore({
      totalIncome,
      totalExpense,
      totalBalance,
      budgets,
      categoryBreakdown,
      monthlyBurnRate,
      goals,
    });
  }, [totalIncome, totalExpense, totalBalance, budgets, categoryBreakdown, monthlyBurnRate, goals]);

  // Today's spending
  const todaySpend = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return transactions
      .filter((t) => t.type === 'expense' && !t.isTransfer && t.date?.slice(0, 10) === todayStr)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions]);

  // Savings rate for ambient aurora
  const savingsRatePct = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const anyBudgetOver = budgetReports.some((b) => b.isOverBudget);
  const anyBudgetNear = budgetReports.some((b) => b.isNearLimit);
  const isUrgentBill = upcomingBills.some((b) => {
    if (!b.nextDueDate) return false;
    const diff = (new Date(b.nextDueDate) - new Date()) / 86400000;
    return diff <= 2 && diff >= 0;
  });

  // Scroll & Sticky Header Animation
  const scrollY = useRef(new Animated.Value(0)).current;

  const stickyHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 45, 90],
    outputRange: [-70, -70, 0],
    extrapolate: 'clamp',
  });

  const stickyHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 45, 90],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const cardScale = scrollY.interpolate({
    inputRange: [-120, 0, 160],
    outputRange: [1.06, 1, 0.94],
    extrapolate: 'clamp',
  });

  const cardOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // FAB / Add button with preset types
  const handleOpenAddModal = (presetType = null) => {
    audioEffects.whoosh();
    if (presetType === 'transfer') {
      setEditingTransaction({ type: 'transfer' });
    } else {
      setEditingTransaction(presetType ? { type: presetType } : null);
    }
    setAddEditModalVisible(true);
  };

  const handleScanReceipt = async () => {
    audioEffects.whoosh();
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.granted) {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!res.canceled && res.assets && res.assets[0]) {
          const parsed = parseReceiptData(res.assets[0].uri);
          setEditingTransaction({
            title: parsed.suggestedTitle,
            amount: parsed.suggestedAmount,
            category: parsed.suggestedCategory,
            receiptUri: res.assets[0].uri,
          });
          setAddEditModalVisible(true);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }
    handleOpenAddModal('expense');
  };

  // Tap row -> opens detail modal
  const handleSelectRow = (tx) => {
    audioEffects.whoosh();
    setSelectedTransaction(tx);
    setDetailModalVisible(true);
  };

  // Edit from detail view
  const handleEditFromDetail = (tx) => {
    setEditingTransaction(tx);
    setAddEditModalVisible(true);
  };

  // Quick 3-dot action on row
  const handleQuickAction = (tx) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'View Details', 'Edit', 'Duplicate', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleSelectRow(tx);
          if (buttonIndex === 2) handleEditFromDetail(tx);
          if (buttonIndex === 3) onDuplicateTransaction(tx.id);
          if (buttonIndex === 4) confirmDelete(tx);
        }
      );
    } else {
      Alert.alert(
        tx.title,
        'Choose an action for this transaction:',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Details', onPress: () => handleSelectRow(tx) },
          { text: 'Edit', onPress: () => handleEditFromDetail(tx) },
          { text: 'Duplicate', onPress: () => onDuplicateTransaction(tx.id) },
          { text: 'Delete', style: 'destructive', onPress: () => confirmDelete(tx) },
        ]
      );
    }
  };

  const confirmDelete = (tx) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to remove "${tx.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteTransaction(tx.id) },
      ]
    );
  };

  const handleAddEditSubmit = (txData) => {
    if (editingTransaction) {
      onUpdateTransaction(txData);
    } else {
      if (txData.type === 'income') {
        audioEffects.cashChime();
      } else {
        audioEffects.coinClink();
      }
      onAddTransaction(txData);
    }
    setAddEditModalVisible(false);
    setEditingTransaction(null);
  };

  const handleTransferSubmit = (fromId, toId, amount, notes) => {
    audioEffects.cardSlot();
    if (onTransfer) {
      onTransfer(fromId, toId, amount, notes);
    }
    setAddEditModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient Financial Status Aurora Glow */}
      <FinancialAuroraGlow
        savingsRate={savingsRatePct}
        budgetOverLimit={anyBudgetOver}
        budgetNearThreshold={anyBudgetNear}
        urgentBillDue={isUrgentBill}
      />

      {/* App Header */}
      <Header
        isBalanceHidden={isBalanceHidden}
        onTogglePrivacy={onTogglePrivacy}
        onOpenBudgets={() => setBudgetModalVisible(true)}
        onOpenSettings={() => setSettingsModalVisible(true)}
        onOpenSubscriptions={() => setSubscriptionsModalVisible(true)}
        upcomingBillCount={upcomingBills.length}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Sticky Liquid Glass Balance Pill on Scroll */}
      <Animated.View
        style={[
          styles.stickyBalanceBar,
          {
            opacity: stickyHeaderOpacity,
            transform: [{ translateY: stickyHeaderTranslateY }],
          },
        ]}
        pointerEvents="box-none"
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 85}
          tint={colors.isDark ? 'systemUltraThinMaterialDark' : 'systemMaterialLight'}
          style={[
            styles.stickyBlur,
            shadows.md,
            {
              backgroundColor: colors.isDark ? 'rgba(23, 26, 46, 0.88)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.14)',
            },
          ]}
        >
          <View style={styles.stickyLeft}>
            <Text style={[styles.stickyLabel, { color: colors.textSecondary }]}>Net Balance</Text>
            <AnimatedNumber
              value={totalBalance}
              prefix={currency.symbol}
              isHidden={isBalanceHidden}
              style={[styles.stickyAmount, { color: colors.textPrimary }]}
            />
          </View>
          <View style={styles.stickyRight}>
            <TouchableOpacity
              style={[styles.stickyTierBadge, { backgroundColor: healthData.tier.bg }]}
              onPress={() => setHealthScoreModalVisible(true)}
            >
              <Ionicons name="diamond" size={12} color={healthData.tier.color} />
              <Text style={[styles.stickyTierText, { color: healthData.tier.color }]}>
                {healthData.score}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyEyeBtn, { backgroundColor: colors.surfaceLight }]}
              onPress={onTogglePrivacy}
            >
              <Ionicons
                name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
                size={16}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Main Content by Tab */}
      {activeTab === 'transactions' ? (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <>
              {/* Account / Wallet Selector Strip */}
              {accounts.length > 0 && (
                <View style={styles.accountsStripWrap}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.accountsScroll}
                  >
                    {/* All Accounts Pill */}
                    <TouchableOpacity
                      style={[
                        styles.accountPill,
                        { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                        accountFilter === 'all' && {
                          backgroundColor: colors.primaryGlow,
                          borderColor: colors.primaryLight,
                        },
                      ]}
                      onPress={() => {
                        hapticFeedback.light();
                        setAccountFilter?.('all');
                      }}
                    >
                      <Ionicons
                        name="apps-outline"
                        size={15}
                        color={accountFilter === 'all' ? colors.primaryLight : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.accountPillText,
                          { color: colors.textSecondary },
                          accountFilter === 'all' && { color: colors.primaryLight, fontWeight: '700' },
                        ]}
                      >
                        All Wallets
                      </Text>
                    </TouchableOpacity>

                    {/* Individual Accounts */}
                    {accounts.map((acc) => {
                      const isSelected = accountFilter === acc.id;
                      const bal = accountBalances[acc.id] || 0;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          style={[
                            styles.accountPill,
                            { backgroundColor: colors.surface, borderColor: colors.surfaceBorder },
                            isSelected && {
                              backgroundColor: colors.primaryGlow,
                              borderColor: colors.primaryLight,
                            },
                          ]}
                          onPress={() => {
                            hapticFeedback.light();
                            setAccountFilter?.(acc.id);
                          }}
                        >
                          <Ionicons
                            name={acc.icon || 'card-outline'}
                            size={15}
                            color={isSelected ? colors.primaryLight : acc.color || colors.primary}
                          />
                          <Text
                            style={[
                              styles.accountPillText,
                              { color: colors.textSecondary },
                              isSelected && { color: colors.primaryLight, fontWeight: '700' },
                            ]}
                          >
                            {acc.name}
                          </Text>
                          <Text
                            style={[
                              styles.accountPillBalance,
                              { color: bal >= 0 ? colors.income : colors.expense },
                            ]}
                          >
                            {formatCurrency(bal, currency.symbol)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Manage Wallets Button */}
                    <TouchableOpacity
                      style={[styles.accountPill, styles.addAccountPill, { borderColor: colors.surfaceBorder }]}
                      onPress={() => {
                        hapticFeedback.light();
                        setAccountsModalVisible(true);
                      }}
                    >
                      <Ionicons name="settings-outline" size={14} color={colors.textMuted} />
                      <Text style={[styles.accountPillText, { color: colors.textMuted }]}>Manage</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}

              {/* AI Financial Morning Digest ("The Daily Pulse") */}
              <DailyPulseCard
                transactions={transactions}
                upcomingBills={upcomingBills}
                goals={goals}
                totalBalance={totalBalance}
                currencySymbol={currency.symbol}
                onPressBillRadar={() => setSubscriptionsModalVisible(true)}
                onPressGoals={() => setSavingsGoalsModalVisible(true)}
              />

              {/* 3D Summary Holographic Card with Parallax Depth */}
              <Animated.View style={{ transform: [{ scale: cardScale }], opacity: cardOpacity }}>
                <SummaryCards
                  balance={totalBalance}
                  income={totalIncome}
                  expense={totalExpense}
                  currencySymbol={currency.symbol}
                  isBalanceHidden={isBalanceHidden}
                  onTogglePrivacy={onTogglePrivacy}
                />
              </Animated.View>

              {/* Institutional FinTech Quick Hub */}
              <View style={styles.quickHubRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubScroll}>
                  {/* Wealth Score Pill */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: healthData.tier.color }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setHealthScoreModalVisible(true);
                    }}
                  >
                    <Ionicons name="diamond-outline" size={15} color={healthData.tier.color} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>
                      Score: {healthData.score}
                    </Text>
                    <View style={[styles.hubBadge, { backgroundColor: healthData.tier.bg }]}>
                      <Text style={[styles.hubBadgeText, { color: healthData.tier.color }]}>
                        {healthData.tier.label.split(' ')[0]}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Cash Flow Forecast Pill */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setForecasterModalVisible(true);
                    }}
                  >
                    <Ionicons name="pulse-outline" size={15} color={colors.income} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Forecast</Text>
                  </TouchableOpacity>

                  {/* Automated Money Rules */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setMoneyRulesModalVisible(true);
                    }}
                  >
                    <Ionicons name="flash-outline" size={15} color={colors.primaryLight} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Rules</Text>
                    <View style={[styles.hubBadge, { backgroundColor: colors.primaryGlow }]}>
                      <Text style={[styles.hubBadgeText, { color: colors.primaryLight }]}>
                        {moneyRulesManager?.rules?.filter((r) => r.isEnabled).length || 0}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Debt Freedom Payoff */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setDebtPayoffModalVisible(true);
                    }}
                  >
                    <Ionicons name="shield-outline" size={15} color={colors.warning} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Debts</Text>
                  </TouchableOpacity>

                  {/* Gamified Habits & Challenges */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setChallengesModalVisible(true);
                    }}
                  >
                    <Ionicons name="trophy-outline" size={15} color="#FFD700" />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Challenges</Text>
                  </TouchableOpacity>

                  {/* Radar */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setSubscriptionsModalVisible(true);
                    }}
                  >
                    <Ionicons name="alarm-outline" size={15} color={upcomingBills.length > 0 ? colors.warning : colors.primaryLight} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Radar</Text>
                    {upcomingBills.length > 0 && (
                      <View style={[styles.hubBadge, { backgroundColor: colors.warning }]}>
                        <Text style={[styles.hubBadgeText, { color: '#FFF' }]}>{upcomingBills.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Goals */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setSavingsGoalsModalVisible(true);
                    }}
                  >
                    <Ionicons name="flag-outline" size={15} color={colors.income} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Goals</Text>
                    {goals.length > 0 && (
                      <View style={[styles.hubBadge, { backgroundColor: colors.incomeBg }]}>
                        <Text style={[styles.hubBadgeText, { color: colors.income }]}>{goals.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Splits */}
                  <TouchableOpacity
                    style={[styles.hubChip, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
                    onPress={() => {
                      audioEffects.whoosh();
                      setSplitBillModalVisible(true);
                    }}
                  >
                    <Ionicons name="people-outline" size={15} color={colors.info} />
                    <Text style={[styles.hubChipText, { color: colors.textPrimary }]}>Splits</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* GitHub-Style Daily Spending Heatmap & Streaks */}
              <DailySpendingHeatmap
                transactions={transactions}
                currencySymbol={currency.symbol}
              />

              {/* Upcoming Bills Mini Radar Card (if bills due soon) */}
              {upcomingBills.length > 0 && (
                <TouchableOpacity
                  style={[styles.billAlertBanner, { backgroundColor: colors.surface, borderColor: colors.warningBorder }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    audioEffects.whoosh();
                    setSubscriptionsModalVisible(true);
                  }}
                >
                  <View style={styles.billAlertLeft}>
                    <Ionicons name="time" size={18} color={colors.warning} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={[styles.billAlertTitle, { color: colors.textPrimary }]}>
                        {upcomingBills.length} Bill{upcomingBills.length > 1 ? 's' : ''} Due in 7 Days
                      </Text>
                      <Text style={[styles.billAlertSubtitle, { color: colors.textMuted }]}>
                        Next: {upcomingBills[0].name} ({formatCurrency(upcomingBills[0].amount, currency.symbol)})
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}

              {/* Filter & Sort Controls */}
              <FilterSortBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                dateRangeFilter={dateRangeFilter}
                onDateRangeFilterChange={setDateRangeFilter}
                sortBy={sortBy}
                onSortByChange={setSortBy}
                totalResultsCount={filteredTransactions.length}
              />
            </>
          }
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              currencySymbol={currency.symbol}
              isBalanceHidden={isBalanceHidden}
              onPress={handleSelectRow}
              onQuickAction={handleQuickAction}
              onEdit={handleEditFromDetail}
              onDuplicate={onDuplicateTransaction}
              onDelete={confirmDelete}
            />
          )}
          ListEmptyStateComponent={
            <EmptyState
              isFiltered={Boolean(searchQuery) || typeFilter !== 'all' || dateRangeFilter !== 'all' || accountFilter !== 'all'}
              onAddPress={handleOpenAddModal}
              onLoadDemoPress={onResetDemo}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <SpendingChart
          categoryBreakdown={categoryBreakdown}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          currencySymbol={currency.symbol}
          isBalanceHidden={isBalanceHidden}
          transactions={transactions}
        />
      )}

      {/* Morphing Radial Speed-Dial FAB */}
      <RadialSpeedDialFAB
        onAddExpense={() => handleOpenAddModal('expense')}
        onScanReceipt={handleScanReceipt}
        onTransfer={() => handleOpenAddModal('transfer')}
      />

      {/* Add / Edit Transaction Modal (with OCR receipt parsing & accounts) */}
      <AddEditTransactionModal
        visible={addEditModalVisible}
        initialTransaction={editingTransaction}
        accounts={accounts}
        currencySymbol={currency.symbol}
        onClose={() => {
          setAddEditModalVisible(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleAddEditSubmit}
        onTransfer={handleTransferSubmit}
      />

      {/* Transaction Detail View Modal */}
      <TransactionDetailModal
        visible={detailModalVisible}
        transaction={selectedTransaction}
        currencySymbol={currency.symbol}
        isBalanceHidden={isBalanceHidden}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTransaction(null);
        }}
        onEdit={handleEditFromDetail}
        onDuplicate={onDuplicateTransaction}
        onDelete={onDeleteTransaction}
      />

      {/* Budget Limit & Alert Modal */}
      <BudgetModal
        visible={budgetModalVisible}
        budgetReports={budgetReports}
        budgets={budgets}
        currencySymbol={currency.symbol}
        onSaveBudget={onSaveBudget}
        onClose={() => setBudgetModalVisible(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsModalVisible}
        currency={currency}
        onSelectCurrency={onSelectCurrency}
        isBiometricEnabled={isBiometricEnabled}
        onToggleBiometric={onToggleBiometric}
        isHardwareSupported={isHardwareSupported}
        isSoundMuted={isSoundMuted}
        onToggleSound={onToggleSound}
        isShakeToHideEnabled={isShakeToHideEnabled}
        onToggleShakeToHide={onToggleShakeToHide}
        decoyPin={decoyPin}
        onSetDecoyPin={onSetDecoyPin}
        transactions={transactions}
        onResetDemo={onResetDemo}
        onClearAll={onClearAll}
        onOpenThemePicker={() => setThemePickerVisible(true)}
        onOpenWidgetPreview={() => setWidgetPreviewModalVisible(true)}
        onClose={() => setSettingsModalVisible(false)}
      />

      {/* Theme Picker Modal */}
      <ThemePickerModal
        visible={themePickerVisible}
        onClose={() => setThemePickerVisible(false)}
      />

      {/* Multi-Account Modal */}
      <AccountsModal
        visible={accountsModalVisible}
        accounts={accounts}
        accountBalances={accountBalances}
        currencySymbol={currency.symbol}
        onAddAccount={onAddAccount}
        onDeleteAccount={onDeleteAccount}
        onClose={() => setAccountsModalVisible(false)}
      />

      {/* Subscriptions & Bill Radar Modal */}
      <SubscriptionsModal
        visible={subscriptionsModalVisible}
        subscriptions={subscriptions}
        monthlyBurnRate={monthlyBurnRate}
        annualBurnRate={annualBurnRate}
        upcomingBills={upcomingBills}
        currencySymbol={currency.symbol}
        onAddSubscription={onAddSubscription}
        onToggleActive={onToggleSubscription}
        onDeleteSubscription={onDeleteSubscription}
        onClose={() => setSubscriptionsModalVisible(false)}
      />

      {/* Savings Goals Modal */}
      <SavingsGoalsModal
        visible={savingsGoalsModalVisible}
        goals={goals}
        roundUpSimulation={roundUpSimulation}
        currencySymbol={currency.symbol}
        onAddGoal={onAddGoal}
        onAddContribution={onAddContribution}
        onDeleteGoal={onDeleteGoal}
        onClose={() => setSavingsGoalsModalVisible(false)}
      />

      {/* Split Bills Modal */}
      <SplitBillModal
        visible={splitBillModalVisible}
        splitBills={splitBills}
        outstandingBalance={outstandingBalance}
        currencySymbol={currency.symbol}
        onAddSplit={onAddSplit}
        onSettleUp={onSettleUp}
        onDeleteSplit={onDeleteSplit}
        onClose={() => setSplitBillModalVisible(false)}
      />

      {/* v4.0 Modals */}
      <FinancialHealthScoreModal
        visible={healthScoreModalVisible}
        healthData={healthData}
        onClose={() => setHealthScoreModalVisible(false)}
      />

      <CashflowForecasterModal
        visible={forecasterModalVisible}
        currentBalance={totalBalance}
        transactions={transactions}
        subscriptions={subscriptions}
        currencySymbol={currency.symbol}
        onClose={() => setForecasterModalVisible(false)}
      />

      <MoneyRulesModal
        visible={moneyRulesModalVisible}
        rules={moneyRulesManager?.rules}
        onToggleRule={moneyRulesManager?.toggleRule}
        onAddRule={moneyRulesManager?.addRule}
        onDeleteRule={moneyRulesManager?.deleteRule}
        onClose={() => setMoneyRulesModalVisible(false)}
      />

      <DebtPayoffModal
        visible={debtPayoffModalVisible}
        debtManager={debtManager}
        currencySymbol={currency.symbol}
        onClose={() => setDebtPayoffModalVisible(false)}
      />

      <ChallengesModal
        visible={challengesModalVisible}
        challengesManager={challengesManager}
        currencySymbol={currency.symbol}
        onClose={() => setChallengesModalVisible(false)}
      />

      <WidgetPreviewModal
        visible={widgetPreviewModalVisible}
        balance={totalBalance}
        todaySpend={todaySpend}
        upcomingBills={upcomingBills}
        currencySymbol={currency.symbol}
        onClose={() => setWidgetPreviewModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  accountsStripWrap: {
    marginBottom: 10,
    marginTop: 2,
    zIndex: 2,
  },
  accountsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  addAccountPill: {
    borderStyle: 'dashed',
  },
  accountPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountPillBalance: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  quickHubRow: {
    marginVertical: 10,
    zIndex: 2,
  },
  hubScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 6,
  },
  hubChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hubBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hubBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  billAlertBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  billAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  billAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  billAlertSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickyBalanceBar: {
    position: 'absolute',
    top: 76,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  stickyBlur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  stickyLeft: {
    flex: 1,
  },
  stickyLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  stickyAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  stickyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stickyTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  stickyTierText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  stickyEyeBtn: {
    padding: 6,
    borderRadius: 8,
  },
});
