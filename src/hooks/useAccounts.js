import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { DEFAULT_ACCOUNTS } from '../constants/accounts';
import { hapticFeedback } from '../utils/haptics';

export function useAccounts(transactions = []) {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACCOUNTS);
        if (raw) {
          setAccounts(JSON.parse(raw));
        } else {
          await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
        }
      } catch (e) {
        console.error('Failed to load accounts:', e);
      }
    })();
  }, []);

  const saveAccounts = useCallback(async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }, []);

  const addAccount = useCallback((account) => {
    hapticFeedback.success();
    const newAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isDefault: false,
      ...account,
    };
    setAccounts((prev) => {
      const updated = [...prev, newAccount];
      saveAccounts(updated);
      return updated;
    });
    return newAccount;
  }, [saveAccounts]);

  const updateAccount = useCallback((accountData) => {
    hapticFeedback.medium();
    setAccounts((prev) => {
      const updated = prev.map((a) => (a.id === accountData.id ? { ...a, ...accountData } : a));
      saveAccounts(updated);
      return updated;
    });
  }, [saveAccounts]);

  const deleteAccount = useCallback((accountId) => {
    hapticFeedback.heavy();
    setAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== accountId && !a.isDefault);
      saveAccounts(updated.length > 0 ? updated : DEFAULT_ACCOUNTS);
      return updated.length > 0 ? updated : DEFAULT_ACCOUNTS;
    });
  }, [saveAccounts]);

  // Compute balance per account from transactions
  const accountBalances = useMemo(() => {
    const balances = {};
    for (const acc of accounts) {
      balances[acc.id] = 0;
    }
    for (const tx of transactions) {
      const accId = tx.accountId || 'default';
      if (balances[accId] === undefined) balances[accId] = 0;
      if (tx.type === 'income') {
        balances[accId] += Number(tx.amount || 0);
      } else {
        balances[accId] -= Number(tx.amount || 0);
      }
    }
    return balances;
  }, [accounts, transactions]);

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    accountBalances,
  };
}
