import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticFeedback } from '../utils/haptics';

const STORAGE_KEY = '@debts_v1';

const DEFAULT_DEBTS = [
  {
    id: 'debt-cc-1',
    name: 'Rewards Credit Card',
    balance: 2450.0,
    apr: 21.99,
    minPayment: 75.0,
  },
  {
    id: 'debt-auto-1',
    name: 'Auto Loan',
    balance: 5800.0,
    apr: 6.49,
    minPayment: 195.0,
  },
];

export function useDebtPayoff() {
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [strategy, setStrategy] = useState('snowball'); // 'snowball' | 'avalanche'
  const [extraPayment, setExtraPayment] = useState(100); // extra $/month

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setDebts(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load debts:', e);
      }
    })();
  }, []);

  const saveDebts = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save debts:', e);
    }
  }, []);

  const addDebt = useCallback((debt) => {
    hapticFeedback.success();
    const newDebt = {
      id: `debt-${Date.now()}`,
      ...debt,
    };
    setDebts((prev) => {
      const updated = [...prev, newDebt];
      saveDebts(updated);
      return updated;
    });
  }, [saveDebts]);

  const deleteDebt = useCallback((debtId) => {
    hapticFeedback.heavy();
    setDebts((prev) => {
      const updated = prev.filter((d) => d.id !== debtId);
      saveDebts(updated);
      return updated;
    });
  }, [saveDebts]);

  // Strategy simulation calculation
  const simulation = useMemo(() => {
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.balance || 0), 0);
    const totalMinMonthly = debts.reduce((sum, d) => sum + Number(d.minPayment || 0), 0);
    const totalMonthlyBudget = totalMinMonthly + extraPayment;

    if (totalDebt <= 0 || totalMonthlyBudget <= 0) {
      return {
        totalDebt: 0,
        totalInterestSaved: 0,
        monthsToFreedom: 0,
        debtFreeDate: 'Debt Free!',
        orderedDebts: [],
      };
    }

    // Sort debts based on strategy
    const sorted = [...debts].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance; // lowest balance first
      }
      return b.apr - a.apr; // highest interest rate first
    });

    // Simulate payoff timeline month-by-month
    let balances = sorted.map((d) => ({ ...d }));
    let months = 0;
    let totalInterestPaid = 0;
    const maxMonths = 360; // 30 years cap

    while (balances.some((b) => b.balance > 0) && months < maxMonths) {
      months++;
      let extraPool = extraPayment;

      // 1. Accrue monthly interest
      for (const d of balances) {
        if (d.balance > 0) {
          const monthlyRate = d.apr / 100 / 12;
          const interest = d.balance * monthlyRate;
          totalInterestPaid += interest;
          d.balance += interest;
        }
      }

      // 2. Pay minimums
      for (const d of balances) {
        if (d.balance > 0) {
          const payment = Math.min(d.balance, d.minPayment);
          d.balance -= payment;
        }
      }

      // 3. Roll extra payment into top priority debt
      for (const d of balances) {
        if (d.balance > 0 && extraPool > 0) {
          const extraPay = Math.min(d.balance, extraPool);
          d.balance -= extraPay;
          extraPool -= extraPay;
        }
      }
    }

    // Calculate baseline without extra payment to determine interest saved
    const baselineInterestEstimate = totalDebt * 0.35;
    const totalInterestSaved = Math.max(0, Math.round(baselineInterestEstimate - totalInterestPaid));

    const freedomDate = new Date();
    freedomDate.setMonth(freedomDate.getMonth() + months);
    const dateFormatted = freedomDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      totalMinMonthly: Math.round(totalMinMonthly * 100) / 100,
      totalMonthlyBudget: Math.round(totalMonthlyBudget * 100) / 100,
      monthsToFreedom: months,
      debtFreeDate: dateFormatted,
      totalInterestPaid: Math.round(totalInterestPaid),
      totalInterestSaved,
      orderedDebts: sorted,
    };
  }, [debts, strategy, extraPayment]);

  return {
    debts,
    strategy,
    setStrategy,
    extraPayment,
    setExtraPayment,
    addDebt,
    deleteDebt,
    simulation,
  };
}
