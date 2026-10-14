import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { hapticFeedback } from '../utils/haptics';

/**
 * useSplitBills — split-the-bill and IOU tracking.
 *
 * Each split: { id, description, totalAmount, paidBy, date, splits: [{personName, owedAmount, isPaid}] }
 */
export function useSplitBills(addTransaction) {
  const [splitBills, setSplitBills] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SPLITS);
        if (raw) setSplitBills(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load splits:', e);
      }
    })();
  }, []);

  const saveSplits = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SPLITS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save splits:', e);
    }
  }, []);

  const addSplit = useCallback((split) => {
    hapticFeedback.success();
    const newSplit = {
      id: `split-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
      ...split,
    };
    setSplitBills((prev) => {
      const updated = [...prev, newSplit];
      saveSplits(updated);
      return updated;
    });
  }, [saveSplits]);

  const deleteSplit = useCallback((splitId) => {
    hapticFeedback.heavy();
    setSplitBills((prev) => {
      const updated = prev.filter((s) => s.id !== splitId);
      saveSplits(updated);
      return updated;
    });
  }, [saveSplits]);

  // Settle up — mark a person as paid and optionally create income transaction
  const settleUp = useCallback((splitId, personName) => {
    hapticFeedback.success();
    setSplitBills((prev) => {
      const updated = prev.map((bill) => {
        if (bill.id !== splitId) return bill;
        const updatedSplits = bill.splits.map((s) => {
          if (s.personName === personName && !s.isPaid) {
            // Create income transaction for the settled amount
            if (addTransaction) {
              addTransaction({
                title: `Settled: ${personName} – ${bill.description}`,
                amount: s.owedAmount,
                type: 'income',
                category: 'other_income',
                notes: `Split bill settled by ${personName}`,
              });
            }
            return { ...s, isPaid: true };
          }
          return s;
        });
        return { ...bill, splits: updatedSplits };
      });
      saveSplits(updated);
      return updated;
    });
  }, [saveSplits, addTransaction]);

  // Outstanding balance — total money owed to user
  const outstandingBalance = useMemo(() => {
    let total = 0;
    for (const bill of splitBills) {
      for (const s of bill.splits || []) {
        if (!s.isPaid) {
          total += Number(s.owedAmount) || 0;
        }
      }
    }
    return total;
  }, [splitBills]);

  return {
    splitBills,
    addSplit,
    deleteSplit,
    settleUp,
    outstandingBalance,
  };
}
