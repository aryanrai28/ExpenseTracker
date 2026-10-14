import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { EXPENSE_CATEGORIES } from '../constants/categories';

export function useBudgets(transactions = []) {
  const [budgets, setBudgets] = useState({}); // { [categoryId]: number }

  useEffect(() => {
    async function loadBudgets() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
        if (raw) {
          setBudgets(JSON.parse(raw));
        } else {
          // Default initial budgets
          const initial = {
            food: 400,
            transport: 150,
            entertainment: 100,
            shopping: 200,
          };
          setBudgets(initial);
          await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(initial));
        }
      } catch (e) {
        console.error('Failed to load budgets:', e);
      }
    }
    loadBudgets();
  }, []);

  const saveBudget = useCallback(async (categoryId, limit) => {
    setBudgets((prev) => {
      const updated = { ...prev };
      if (limit <= 0) {
        delete updated[categoryId];
      } else {
        updated[categoryId] = limit;
      }
      AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updated)).catch(console.error);
      return updated;
    });
  }, []);

  // Calculate current month's spending for each category
  const budgetReports = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categorySpendMap = {};
    for (const t of currentMonthExpenses) {
      categorySpendMap[t.category] = (categorySpendMap[t.category] || 0) + t.amount;
    }

    return EXPENSE_CATEGORIES.map((cat) => {
      const limit = budgets[cat.id] || 0;
      const spent = categorySpendMap[cat.id] || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;

      let status = 'safe'; // < 70%
      if (limit > 0) {
        if (percentage >= 100) {
          status = 'exceeded'; // >= 100%
        } else if (percentage >= 70) {
          status = 'warning'; // 70-99%
        }
      }

      return {
        category: cat,
        limit,
        spent,
        percentage: Math.min(percentage, 100),
        rawPercentage: percentage,
        remaining: Math.max(0, limit - spent),
        isOverBudget: limit > 0 && spent > limit,
        overAmount: limit > 0 && spent > limit ? spent - limit : 0,
        status,
        hasBudget: limit > 0,
      };
    }).filter((r) => r.hasBudget || r.spent > 0);
  }, [transactions, budgets]);

  const totalBudgeted = useMemo(() => {
    return Object.values(budgets).reduce((sum, v) => sum + (v || 0), 0);
  }, [budgets]);

  const totalSpentInBudgeted = useMemo(() => {
    return budgetReports.reduce((sum, r) => sum + r.spent, 0);
  }, [budgetReports]);

  return {
    budgets,
    saveBudget,
    budgetReports,
    totalBudgeted,
    totalSpentInBudgeted,
  };
}
