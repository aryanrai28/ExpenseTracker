import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { hapticFeedback } from '../utils/haptics';

/**
 * useSavingsGoals — savings goal management.
 *
 * Each goal: { id, name, targetAmount, currentAmount, deadline, icon, color, contributions: [{date, amount}] }
 */
export function useSavingsGoals(transactions = []) {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
        if (raw) setGoals(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load goals:', e);
      }
    })();
  }, []);

  const saveGoals = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
  }, []);

  const addGoal = useCallback((goal) => {
    hapticFeedback.success();
    const newGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      currentAmount: 0,
      contributions: [],
      icon: 'flag-outline',
      color: '#6366F1',
      ...goal,
    };
    setGoals((prev) => {
      const updated = [...prev, newGoal];
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  const updateGoal = useCallback((goalData) => {
    hapticFeedback.medium();
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === goalData.id ? { ...g, ...goalData } : g));
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  const deleteGoal = useCallback((goalId) => {
    hapticFeedback.heavy();
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== goalId);
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  const addContribution = useCallback((goalId, amount) => {
    hapticFeedback.success();
    setGoals((prev) => {
      const updated = prev.map((g) => {
        if (g.id !== goalId) return g;
        const newContribution = { date: new Date().toISOString(), amount: Number(amount) };
        return {
          ...g,
          currentAmount: (g.currentAmount || 0) + Number(amount),
          contributions: [...(g.contributions || []), newContribution],
        };
      });
      saveGoals(updated);
      return updated;
    });
  }, [saveGoals]);

  // Round-up simulation: how much you'd save by rounding each expense to nearest dollar
  const roundUpSimulation = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    let totalRoundUp = 0;
    for (const tx of expenses) {
      const amount = Number(tx.amount) || 0;
      const rounded = Math.ceil(amount);
      totalRoundUp += rounded - amount;
    }
    return {
      totalRoundUp: Math.round(totalRoundUp * 100) / 100,
      transactionCount: expenses.length,
      avgRoundUp: expenses.length > 0 ? Math.round((totalRoundUp / expenses.length) * 100) / 100 : 0,
    };
  }, [transactions]);

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    roundUpSimulation,
  };
}
