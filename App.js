import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, AppState, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAppSettings } from './src/hooks/useAppSettings';
import { useTransactions } from './src/hooks/useTransactions';
import { useBudgets } from './src/hooks/useBudgets';
import { useAccounts } from './src/hooks/useAccounts';
import { useSubscriptions } from './src/hooks/useSubscriptions';
import { useSavingsGoals } from './src/hooks/useSavingsGoals';
import { useSplitBills } from './src/hooks/useSplitBills';
import { useMoneyRules } from './src/hooks/useMoneyRules';
import { useDebtPayoff } from './src/hooks/useDebtPayoff';
import { useFinancialChallenges } from './src/hooks/useFinancialChallenges';
import { MainScreen } from './src/screens/MainScreen';
import { BiometricLockView } from './src/components/BiometricLockView';
import { ConfettiBurst } from './src/components/ConfettiBurst';
import { startShakeDetection } from './src/utils/shakeDetector';
import { setSoundMuted, getSoundMuted, audioEffects } from './src/utils/audioEffects';

function AppContent() {
  const { colors, isDark } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);

  // Sensory & Audio Settings
  const [isSoundMutedState, setIsSoundMutedState] = useState(getSoundMuted());
  const [isShakeToHideEnabled, setIsShakeToHideEnabled] = useState(true);
  const [decoyPin, setDecoyPin] = useState('9999');
  const [isDecoyMode, setIsDecoyMode] = useState(false);

  // Settings & Security
  const {
    currency,
    selectCurrency,
    isBalanceHidden,
    toggleHideBalance,
    isBiometricEnabled,
    toggleBiometric,
    isUnlocked,
    unlockWithBiometrics,
    isHardwareSupported,
  } = useAppSettings();

  // Core Transactions (with multi-account & transfers support)
  const {
    transactions,
    filteredTransactions,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    sortBy,
    setSortBy,
    accountFilter,
    setAccountFilter,
    totalBalance,
    totalIncome,
    totalExpense,
    categoryBreakdown,
    addTransaction,
    updateTransaction,
    duplicateTransaction,
    deleteTransaction,
    transferBetweenAccounts,
    resetToDemo,
    clearAllTransactions,
  } = useTransactions();

  // Budgets
  const { budgets, saveBudget, budgetReports } = useBudgets(transactions);

  // Accounts / Wallets
  const {
    accounts,
    accountBalances,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts(transactions);

  // Subscriptions & Bill Radar
  const {
    subscriptions,
    monthlyBurnRate,
    annualBurnRate,
    upcomingBills,
    addSubscription,
    toggleActive: toggleSubscription,
    deleteSubscription,
  } = useSubscriptions();

  // Savings Goals & Micro-Savings Round-Up
  const {
    goals,
    roundUpSimulation,
    addGoal,
    addContribution,
    deleteGoal,
  } = useSavingsGoals(transactions);

  // Split Bills & IOUs
  const {
    splitBills,
    outstandingBalance,
    addSplit,
    settleUp,
    deleteSplit,
  } = useSplitBills(addTransaction);

  // v4.0 Managers
  const moneyRulesManager = useMoneyRules();
  const debtManager = useDebtPayoff();
  const challengesManager = useFinancialChallenges();

  // Shake to Hide (Stealth Mode) accelerometer listener
  useEffect(() => {
    if (isShakeToHideEnabled) {
      const unsubscribe = startShakeDetection(() => {
        toggleHideBalance();
      });
      return unsubscribe;
    }
  }, [isShakeToHideEnabled, toggleHideBalance]);

  // Sound toggle helper
  const handleToggleSound = (muted) => {
    setSoundMuted(muted);
    setIsSoundMutedState(muted);
  };

  // Duress Decoy PIN unlock handler
  const handleUnlockDecoy = () => {
    setIsDecoyMode(true);
    unlockWithBiometrics();
  };

  // AppState listener for locking when minimized/backgrounded
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isBiometricEnabled
      ) {
        setIsDecoyMode(false);
        unlockWithBiometrics();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled, unlockWithBiometrics]);

  // In Decoy Mode: display realistic harmless small numbers
  const displayBalance = isDecoyMode ? 142.5 : totalBalance;
  const displayIncome = isDecoyMode ? 350.0 : totalIncome;
  const displayExpense = isDecoyMode ? 207.5 : totalExpense;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Main Application Dashboard */}
      <MainScreen
        transactions={transactions}
        filteredTransactions={filteredTransactions}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        accountFilter={accountFilter}
        setAccountFilter={setAccountFilter}
        totalBalance={displayBalance}
        totalIncome={displayIncome}
        totalExpense={displayExpense}
        categoryBreakdown={categoryBreakdown}
        onAddTransaction={addTransaction}
        onUpdateTransaction={updateTransaction}
        onDuplicateTransaction={duplicateTransaction}
        onDeleteTransaction={deleteTransaction}
        onTransfer={transferBetweenAccounts}
        onResetDemo={resetToDemo}
        onClearAll={clearAllTransactions}
        // Settings & Budgets
        currency={currency}
        onSelectCurrency={selectCurrency}
        isBalanceHidden={isBalanceHidden}
        onTogglePrivacy={toggleHideBalance}
        isBiometricEnabled={isBiometricEnabled}
        onToggleBiometric={toggleBiometric}
        isHardwareSupported={isHardwareSupported}
        isSoundMuted={isSoundMutedState}
        onToggleSound={handleToggleSound}
        isShakeToHideEnabled={isShakeToHideEnabled}
        onToggleShakeToHide={setIsShakeToHideEnabled}
        decoyPin={decoyPin}
        onSetDecoyPin={setDecoyPin}
        budgets={budgets}
        budgetReports={budgetReports}
        onSaveBudget={saveBudget}
        // Multi-Account
        accounts={accounts}
        accountBalances={accountBalances}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
        // Subscriptions
        subscriptions={subscriptions}
        monthlyBurnRate={monthlyBurnRate}
        annualBurnRate={annualBurnRate}
        upcomingBills={upcomingBills}
        onAddSubscription={addSubscription}
        onToggleSubscription={toggleSubscription}
        onDeleteSubscription={deleteSubscription}
        // Savings Goals
        goals={goals}
        roundUpSimulation={roundUpSimulation}
        onAddGoal={(g) => {
          audioEffects.coinClink();
          addGoal(g);
          setShowConfetti(true);
        }}
        onAddContribution={(id, amt) => {
          audioEffects.coinClink();
          addContribution(id, amt);
          setShowConfetti(true);
        }}
        onDeleteGoal={deleteGoal}
        // Split Bills
        splitBills={splitBills}
        outstandingBalance={outstandingBalance}
        onAddSplit={addSplit}
        onSettleUp={(billId, name) => {
          audioEffects.cashChime();
          settleUp(billId, name);
        }}
        onDeleteSplit={deleteSplit}
        // v4.0 Managers
        moneyRulesManager={moneyRulesManager}
        debtManager={debtManager}
        challengesManager={challengesManager}
      />

      {/* Celebration Confetti Burst */}
      <ConfettiBurst
        visible={showConfetti}
        onDone={() => setShowConfetti(false)}
      />

      {/* Biometric & Keypad PIN Lock Screen */}
      {isBiometricEnabled && !isUnlocked && (
        <BiometricLockView
          onUnlock={unlockWithBiometrics}
          onUnlockDecoy={handleUnlockDecoy}
          decoyPin={decoyPin}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
