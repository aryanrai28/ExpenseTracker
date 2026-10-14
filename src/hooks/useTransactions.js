import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getCategoryMeta } from '../constants/categories';
import { hapticFeedback } from '../utils/haptics';

function createInitialSeedData() {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: `seed-1-${now}`,
      title: 'Monthly Salary',
      amount: 4500.0,
      type: 'income',
      category: 'salary',
      date: new Date(now - 3 * day).toISOString(),
      isRecurring: true,
      notes: 'Company direct deposit',
      accountId: 'default',
    },
    {
      id: `seed-2-${now}`,
      title: 'Whole Foods Grocery',
      amount: 114.5,
      type: 'expense',
      category: 'food',
      date: new Date(now - 2 * day).toISOString(),
      isRecurring: false,
      notes: 'Weekly fresh groceries',
      accountId: 'default',
    },
    {
      id: `seed-3-${now}`,
      title: 'Apartment Rent',
      amount: 1400.0,
      type: 'expense',
      category: 'housing',
      date: new Date(now - 5 * day).toISOString(),
      isRecurring: true,
      notes: 'Monthly apartment lease',
      accountId: 'default',
    },
    {
      id: `seed-4-${now}`,
      title: 'Freelance Web Design',
      amount: 850.0,
      type: 'income',
      category: 'freelance',
      date: new Date(now - 1 * day).toISOString(),
      isRecurring: false,
      notes: 'Client landing page completion',
      accountId: 'default',
    },
    {
      id: `seed-5-${now}`,
      title: 'Uber Ride Downtown',
      amount: 28.75,
      type: 'expense',
      category: 'transport',
      date: new Date(now - 8 * 3600000).toISOString(),
      isRecurring: false,
      notes: 'Ride to client meeting',
      accountId: 'default',
    },
    {
      id: `seed-6-${now}`,
      title: 'Netflix & Spotify',
      amount: 27.98,
      type: 'expense',
      category: 'subscriptions',
      date: new Date(now - 6 * 3600000).toISOString(),
      isRecurring: true,
      notes: 'Monthly media subscriptions',
      accountId: 'default',
    },
  ];
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // 'all' | 'this_month' | 'last_month' | 'recurring'
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
  const [accountFilter, setAccountFilter] = useState('all'); // 'all' | specific accountId

  // Load and auto-migrate from AsyncStorage
  const loadTransactions = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        // Migration: Ensure every transaction has an accountId
        const migrated = parsed.map((t) => ({
          ...t,
          accountId: t.accountId || 'default',
        }));
        setTransactions(migrated);
        if (JSON.stringify(migrated) !== raw) {
          await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(migrated));
        }
      } else {
        const seed = createInitialSeedData();
        setTransactions(seed);
        await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(seed));
      }
    } catch (e) {
      console.error('Failed to load transactions:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const saveToStorage = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save transactions:', e);
    }
  }, []);

  // CRUD Actions
  const addTransaction = useCallback(
    (txData) => {
      hapticFeedback.success();
      const newTx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        accountId: txData.accountId || 'default',
        ...txData,
      };
      setTransactions((prev) => {
        const updated = [newTx, ...prev];
        saveToStorage(updated);
        return updated;
      });
      return newTx;
    },
    [saveToStorage]
  );

  const updateTransaction = useCallback(
    (txData) => {
      hapticFeedback.medium();
      setTransactions((prev) => {
        const updated = prev.map((t) => (t.id === txData.id ? { ...t, ...txData } : t));
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const duplicateTransaction = useCallback(
    (id) => {
      hapticFeedback.light();
      setTransactions((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        const duplicated = {
          ...target,
          id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: `${target.title} (Copy)`,
          date: new Date().toISOString(),
        };
        const updated = [duplicated, ...prev];
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const deleteTransaction = useCallback(
    (id) => {
      hapticFeedback.heavy();
      setTransactions((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  // Transfer between accounts
  const transferBetweenAccounts = useCallback(
    (fromAccountId, toAccountId, amount, notes = '') => {
      hapticFeedback.success();
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) return;

      const now = new Date().toISOString();
      const transferId = `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const outTx = {
        id: `tx-${Date.now()}-out`,
        title: `Transfer to Account`,
        amount: numAmount,
        type: 'expense',
        category: 'other_expense',
        accountId: fromAccountId,
        date: now,
        isRecurring: false,
        isTransfer: true,
        transferId,
        notes: notes || `Transfer out`,
      };

      const inTx = {
        id: `tx-${Date.now()}-in`,
        title: `Transfer from Account`,
        amount: numAmount,
        type: 'income',
        category: 'other_income',
        accountId: toAccountId,
        date: now,
        isRecurring: false,
        isTransfer: true,
        transferId,
        notes: notes || `Transfer in`,
      };

      setTransactions((prev) => {
        const updated = [outTx, inTx, ...prev];
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  const resetToDemo = useCallback(() => {
    hapticFeedback.medium();
    const seed = createInitialSeedData();
    setTransactions(seed);
    saveToStorage(seed);
  }, [saveToStorage]);

  const clearAllTransactions = useCallback(() => {
    hapticFeedback.heavy();
    setTransactions([]);
    saveToStorage([]);
  }, [saveToStorage]);

  // Overall Financial Totals (unfiltered, excluding internal transfers from spending totals)
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && !t.isTransfer && (accountFilter === 'all' || t.accountId === accountFilter))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions, accountFilter]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && !t.isTransfer && (accountFilter === 'all' || t.accountId === accountFilter))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [transactions, accountFilter]);

  const totalBalance = useMemo(() => {
    // For specific account, balance also accounts for transfers
    if (accountFilter !== 'all') {
      const inc = transactions
        .filter((t) => t.type === 'income' && t.accountId === accountFilter)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const exp = transactions
        .filter((t) => t.type === 'expense' && t.accountId === accountFilter)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      return inc - exp;
    }
    return totalIncome - totalExpense;
  }, [transactions, accountFilter, totalIncome, totalExpense]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let result = transactions.filter((t) => {
      // 0. Account filter
      if (accountFilter !== 'all' && t.accountId !== accountFilter) {
        return false;
      }

      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (t.title || '').toLowerCase().includes(query);
        const matchesCat = (t.category || '').toLowerCase().includes(query);
        const matchesNotes = (t.notes || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesCat && !matchesNotes) return false;
      }

      // 2. Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // 3. Date range filter
      if (dateRangeFilter === 'recurring') {
        if (!t.isRecurring) return false;
      } else if (dateRangeFilter === 'this_month') {
        const d = new Date(t.date);
        if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) {
          return false;
        }
      } else if (dateRangeFilter === 'last_month') {
        const d = new Date(t.date);
        if (d.getMonth() !== lastMonth || d.getFullYear() !== lastMonthYear) {
          return false;
        }
      }

      return true;
    });

    // 4. Sort
    result.sort((a, b) => {
      if (sortBy === 'date_asc') {
        return new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      // default 'date_desc'
      return new Date(b.date) - new Date(a.date);
    });

    return result;
  }, [transactions, searchQuery, typeFilter, dateRangeFilter, sortBy, accountFilter]);

  // Category Spending Breakdown (for Analytics)
  const categoryBreakdown = useMemo(() => {
    const expenses = transactions.filter(
      (t) => t.type === 'expense' && !t.isTransfer && (accountFilter === 'all' || t.accountId === accountFilter)
    );
    const totalExp = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const map = {};
    for (const t of expenses) {
      map[t.category] = (map[t.category] || 0) + Number(t.amount || 0);
    }

    const categories = Object.keys(map).map((catId) => {
      const meta = getCategoryMeta(catId);
      const amount = map[catId];
      const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
      return {
        ...meta,
        amount,
        percentage,
      };
    });

    categories.sort((a, b) => b.amount - a.amount);
    return {
      categories,
      totalExpense: totalExp,
    };
  }, [transactions, accountFilter]);

  return {
    transactions,
    filteredTransactions,
    isLoading,
    // Filters & Sorting
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
    // Aggregates
    totalBalance,
    totalIncome,
    totalExpense,
    categoryBreakdown,
    // Actions
    addTransaction,
    updateTransaction,
    duplicateTransaction,
    deleteTransaction,
    transferBetweenAccounts,
    resetToDemo,
    clearAllTransactions,
  };
}
