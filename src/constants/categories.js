export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'cash-outline', color: '#10B981' },
  { id: 'freelance', label: 'Freelance', icon: 'laptop-outline', color: '#06B6D4' },
  { id: 'investments', label: 'Investments', icon: 'trending-up-outline', color: '#8B5CF6' },
  { id: 'business', label: 'Business', icon: 'briefcase-outline', color: '#F59E0B' },
  { id: 'bonus', label: 'Bonus / Gift', icon: 'gift-outline', color: '#EC4899' },
  { id: 'other_income', label: 'Other', icon: 'wallet-outline', color: '#64748B' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'restaurant-outline', color: '#F43F5E' },
  { id: 'transport', label: 'Transport', icon: 'car-outline', color: '#FB923C' },
  { id: 'housing', label: 'Rent / Housing', icon: 'home-outline', color: '#A855F7' },
  { id: 'utilities', label: 'Utilities', icon: 'flash-outline', color: '#FBBF24' },
  { id: 'entertainment', label: 'Entertainment', icon: 'game-controller-outline', color: '#38BDF8' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle-outline', color: '#EC4899' },
  { id: 'health', label: 'Health & Fitness', icon: 'heart-outline', color: '#10B981' },
  { id: 'education', label: 'Education', icon: 'book-outline', color: '#6366F1' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'repeat-outline', color: '#818CF8' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#64748B' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function getCategoryMeta(categoryId) {
  const found = ALL_CATEGORIES.find((c) => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId || 'other',
    label: categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#64748B',
  };
}
