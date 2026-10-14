import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

const STORAGE_KEY = '@money_rules_v1';

export const DEFAULT_MONEY_RULES = [
  {
    id: 'rule-save-difference',
    title: 'Save the Difference',
    description: 'When a Grocery expense is under $100, deposit the difference to Vacation Goal.',
    category: 'food',
    threshold: 100,
    actionType: 'deposit_goal',
    targetGoal: 'Vacation',
    isEnabled: true,
  },
  {
    id: 'rule-guilt-tax',
    title: 'Dining Guilt Tax',
    description: 'When Dining exceeds $150, deposit a $10 penalty to Emergency Fund.',
    category: 'food',
    threshold: 150,
    actionType: 'penalty_deposit',
    penaltyAmount: 10,
    isEnabled: true,
  },
  {
    id: 'rule-payday-split',
    title: 'Payday 20% Reserve',
    description: 'When salary income over $1,000 arrives, allocate 20% to savings.',
    category: 'salary',
    threshold: 1000,
    actionType: 'income_reserve',
    reservePercent: 20,
    isEnabled: false,
  },
];

export function useMoneyRules() {
  const [rules, setRules] = useState(DEFAULT_MONEY_RULES);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setRules(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load money rules:', e);
      }
    })();
  }, []);

  const saveRules = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save money rules:', e);
    }
  }, []);

  const toggleRule = useCallback((ruleId) => {
    hapticFeedback.light();
    setRules((prev) => {
      const updated = prev.map((r) =>
        r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r
      );
      saveRules(updated);
      return updated;
    });
  }, [saveRules]);

  const addRule = useCallback((newRule) => {
    hapticFeedback.success();
    const rule = {
      id: `rule-${Date.now()}`,
      isEnabled: true,
      ...newRule,
    };
    setRules((prev) => {
      const updated = [...prev, rule];
      saveRules(updated);
      return updated;
    });
  }, [saveRules]);

  const deleteRule = useCallback((ruleId) => {
    hapticFeedback.heavy();
    setRules((prev) => {
      const updated = prev.filter((r) => r.id !== ruleId);
      saveRules(updated);
      return updated;
    });
  }, [saveRules]);

  return {
    rules,
    toggleRule,
    addRule,
    deleteRule,
  };
}
