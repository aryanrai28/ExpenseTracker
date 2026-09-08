import React, { useEffect, useRef } from 'react';
import { StatusBar, StyleSheet, AppState } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/theme';
import { useAppSettings } from './src/hooks/useAppSettings';
import { useTransactions } from './src/hooks/useTransactions';
import { useBudgets } from './src/hooks/useBudgets';
import { MainScreen } from './src/screens/MainScreen';
import { BiometricLockView } from './src/components/BiometricLockView';

export default function App() {
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
    totalBalance,
    totalIncome,
    totalExpense,
    categoryBreakdown,
    addTransaction,
    updateTransaction,
    duplicateTransaction,
    deleteTransaction,
    resetToDemo,
    clearAllTransactions,
  } = useTransactions();

  const { budgets, saveBudget, budgetReports } = useBudgets(transactions);

  // AppState listener for locking when minimized/backgrounded
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isBiometricEnabled
      ) {
        unlockWithBiometrics();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled, unlockWithBiometrics]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
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
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          categoryBreakdown={categoryBreakdown}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          onDuplicateTransaction={duplicateTransaction}
          onDeleteTransaction={deleteTransaction}
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
          budgets={budgets}
          budgetReports={budgetReports}
          onSaveBudget={saveBudget}
        />

        {/* Biometric Lock Fullscreen Protection */}
        {isBiometricEnabled && !isUnlocked && (
          <BiometricLockView onUnlock={unlockWithBiometrics} />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
