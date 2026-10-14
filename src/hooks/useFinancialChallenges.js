import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

const STORAGE_KEY = '@challenges_v1';

export const PRESET_CHALLENGES = [
  {
    id: 'ch-coffee-14',
    title: '$5 Coffee Challenge',
    tagline: 'Brew at home for 14 days',
    icon: 'cafe-outline',
    color: '#F59E0B',
    durationDays: 14,
    estimatedDailySavings: 5.5,
    currentStreakDays: 3,
    isActive: true,
    isCompleted: false,
  },
  {
    id: 'ch-no-uber-weekend',
    title: 'No-Uber Weekend',
    tagline: 'Walk, cycle or use public transit',
    icon: 'walk-outline',
    color: '#10B981',
    durationDays: 3,
    estimatedDailySavings: 18.0,
    currentStreakDays: 1,
    isActive: false,
    isCompleted: false,
  },
  {
    id: 'ch-home-chef-7',
    title: 'Home-Chef Sprint',
    tagline: '7 days of 100% home cooked meals',
    icon: 'restaurant-outline',
    color: '#6366F1',
    durationDays: 7,
    estimatedDailySavings: 20.0,
    currentStreakDays: 0,
    isActive: false,
    isCompleted: false,
  },
  {
    id: 'ch-zero-spend-2',
    title: 'Zero-Spend Weekend',
    tagline: '48 hours with zero discretionary purchases',
    icon: 'lock-closed-outline',
    color: '#EC4899',
    durationDays: 2,
    estimatedDailySavings: 35.0,
    currentStreakDays: 0,
    isActive: false,
    isCompleted: false,
  },
];

export function useFinancialChallenges() {
  const [challenges, setChallenges] = useState(PRESET_CHALLENGES);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setChallenges(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load challenges:', e);
      }
    })();
  }, []);

  const saveChallenges = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save challenges:', e);
    }
  }, []);

  const joinChallenge = useCallback((id) => {
    audioEffects.cashChime();
    setChallenges((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, isActive: true, currentStreakDays: 1, isCompleted: false } : c
      );
      saveChallenges(updated);
      return updated;
    });
  }, [saveChallenges]);

  const logDayProgress = useCallback((id) => {
    audioEffects.coinClink();
    setChallenges((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== id) return c;
        const nextStreak = (c.currentStreakDays || 0) + 1;
        const isDone = nextStreak >= c.durationDays;
        return {
          ...c,
          currentStreakDays: nextStreak,
          isCompleted: isDone,
        };
      });
      saveChallenges(updated);
      return updated;
    });
  }, [saveChallenges]);

  const leaveChallenge = useCallback((id) => {
    hapticFeedback.medium();
    setChallenges((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, isActive: false, currentStreakDays: 0, isCompleted: false } : c
      );
      saveChallenges(updated);
      return updated;
    });
  }, [saveChallenges]);

  return {
    challenges,
    joinChallenge,
    logDayProgress,
    leaveChallenge,
  };
}
