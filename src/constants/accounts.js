import { Ionicons } from '@expo/vector-icons';

export const ACCOUNT_TYPES = [
  { id: 'checking', label: 'Checking', icon: 'card-outline', defaultColor: '#6366F1' },
  { id: 'credit_card', label: 'Credit Card', icon: 'card-outline', defaultColor: '#F43F5E' },
  { id: 'cash', label: 'Cash Wallet', icon: 'cash-outline', defaultColor: '#10B981' },
  { id: 'savings', label: 'Savings', icon: 'wallet-outline', defaultColor: '#F59E0B' },
  { id: 'crypto', label: 'Crypto', icon: 'logo-bitcoin', defaultColor: '#FF9500' },
  { id: 'investments', label: 'Investments', icon: 'trending-up-outline', defaultColor: '#8B5CF6' },
];

export const DEFAULT_ACCOUNTS = [
  {
    id: 'default',
    name: 'Main Wallet',
    type: 'checking',
    icon: 'wallet-outline',
    color: '#6366F1',
    isDefault: true,
  },
];

export function getAccountMeta(accountId, accounts = []) {
  const found = accounts.find((a) => a.id === accountId);
  if (found) return found;
  return {
    id: accountId || 'default',
    name: 'Main Wallet',
    type: 'checking',
    icon: 'wallet-outline',
    color: '#6366F1',
    isDefault: true,
  };
}
