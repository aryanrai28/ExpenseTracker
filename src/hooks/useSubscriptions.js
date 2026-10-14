import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { hapticFeedback } from '../utils/haptics';

/**
 * useSubscriptions — manages recurring subscriptions and bills.
 *
 * Each subscription: { id, name, amount, category, frequency, nextDueDate, accountId, icon, color, isActive }
 * frequency: 'weekly' | 'monthly' | 'yearly'
 */
export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        if (raw) {
          setSubscriptions(JSON.parse(raw));
        }
      } catch (e) {
        console.error('Failed to load subscriptions:', e);
      }
    })();
  }, []);

  const saveSubs = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save subscriptions:', e);
    }
  }, []);

  const addSubscription = useCallback((sub) => {
    hapticFeedback.success();
    const newSub = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isActive: true,
      ...sub,
    };
    setSubscriptions((prev) => {
      const updated = [...prev, newSub];
      saveSubs(updated);
      return updated;
    });
  }, [saveSubs]);

  const updateSubscription = useCallback((subData) => {
    hapticFeedback.medium();
    setSubscriptions((prev) => {
      const updated = prev.map((s) => (s.id === subData.id ? { ...s, ...subData } : s));
      saveSubs(updated);
      return updated;
    });
  }, [saveSubs]);

  const deleteSubscription = useCallback((subId) => {
    hapticFeedback.heavy();
    setSubscriptions((prev) => {
      const updated = prev.filter((s) => s.id !== subId);
      saveSubs(updated);
      return updated;
    });
  }, [saveSubs]);

  const toggleActive = useCallback((subId) => {
    hapticFeedback.light();
    setSubscriptions((prev) => {
      const updated = prev.map((s) => (s.id === subId ? { ...s, isActive: !s.isActive } : s));
      saveSubs(updated);
      return updated;
    });
  }, [saveSubs]);

  // Monthly burn rate
  const monthlyBurnRate = useMemo(() => {
    return subscriptions
      .filter((s) => s.isActive)
      .reduce((sum, s) => {
        const amount = Number(s.amount) || 0;
        if (s.frequency === 'weekly') return sum + amount * 4.33;
        if (s.frequency === 'yearly') return sum + amount / 12;
        return sum + amount; // monthly
      }, 0);
  }, [subscriptions]);

  const annualBurnRate = useMemo(() => monthlyBurnRate * 12, [monthlyBurnRate]);

  // Upcoming bills in the next N days
  const getUpcomingBills = useCallback((daysAhead = 7) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 86400000);

    return subscriptions
      .filter((s) => {
        if (!s.isActive || !s.nextDueDate) return false;
        const due = new Date(s.nextDueDate);
        return due >= now && due <= cutoff;
      })
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
  }, [subscriptions]);

  const upcomingBills = useMemo(() => getUpcomingBills(7), [getUpcomingBills]);

  return {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    monthlyBurnRate,
    annualBurnRate,
    upcomingBills,
    getUpcomingBills,
  };
}
