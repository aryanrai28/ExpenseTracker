import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_CURRENCY, CURRENCIES } from '../constants/currencies';
import { hapticFeedback } from '../utils/haptics';

export function useAppSettings() {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isHardwareSupported, setIsHardwareSupported] = useState(false);

  // Load stored settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.currencyCode) {
            const found = CURRENCIES.find((c) => c.code === parsed.currencyCode);
            if (found) setCurrency(found);
          }
          if (typeof parsed.isBalanceHidden === 'boolean') {
            setIsBalanceHidden(parsed.isBalanceHidden);
          }
          if (typeof parsed.isBiometricEnabled === 'boolean') {
            setIsBiometricEnabled(parsed.isBiometricEnabled);
            if (parsed.isBiometricEnabled) {
              setIsUnlocked(false);
            }
          }
        }

        // Check biometric hardware support
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsHardwareSupported(compatible && enrolled);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Save changes to storage
  const persistSettings = useCallback(
    async (updates) => {
      try {
        const currentRaw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        const current = currentRaw ? JSON.parse(currentRaw) : {};
        const merged = { ...current, ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    },
    []
  );

  const toggleHideBalance = useCallback(() => {
    hapticFeedback.light();
    setIsBalanceHidden((prev) => {
      const next = !prev;
      persistSettings({ isBalanceHidden: next });
      return next;
    });
  }, [persistSettings]);

  const selectCurrency = useCallback(
    (newCurrency) => {
      hapticFeedback.medium();
      setCurrency(newCurrency);
      persistSettings({ currencyCode: newCurrency.code });
    },
    [persistSettings]
  );

  const toggleBiometric = useCallback(
    async (enable) => {
      hapticFeedback.medium();
      if (enable) {
        // Test biometric authentication first
        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric protection',
          fallbackLabel: 'Use Passcode',
        });
        if (auth.success) {
          setIsBiometricEnabled(true);
          setIsUnlocked(true);
          persistSettings({ isBiometricEnabled: true });
          hapticFeedback.success();
          return true;
        } else {
          hapticFeedback.error();
          return false;
        }
      } else {
        setIsBiometricEnabled(false);
        setIsUnlocked(true);
        persistSettings({ isBiometricEnabled: false });
        return true;
      }
    },
    [persistSettings]
  );

  const unlockWithBiometrics = useCallback(async () => {
    try {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Expense Tracker',
        fallbackLabel: 'Use Device Passcode',
      });
      if (auth.success) {
        setIsUnlocked(true);
        hapticFeedback.success();
      } else {
        hapticFeedback.error();
      }
    } catch {
      setIsUnlocked(true); // Fallback to avoid locking user out if error
    }
  }, []);

  return {
    currency,
    selectCurrency,
    isBalanceHidden,
    toggleHideBalance,
    isBiometricEnabled,
    toggleBiometric,
    isUnlocked,
    unlockWithBiometrics,
    isHardwareSupported,
  };
}
