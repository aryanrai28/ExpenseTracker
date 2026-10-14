import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function Header({
  isBalanceHidden,
  onTogglePrivacy,
  onOpenBudgets,
  onOpenSettings,
  onOpenSubscriptions,
  upcomingBillCount = 0,
  activeTab,
  onSelectTab,
}) {
  const { colors, isDark, shadows } = useTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Expense Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Personal Finance</Text>
        </View>

        <View style={styles.actionsRow}>
          {/* Privacy Eye Toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            activeOpacity={0.7}
            onPress={onTogglePrivacy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isBalanceHidden ? colors.primaryLight : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Subscriptions / Bills Icon */}
          {onOpenSubscriptions && (
            <TouchableOpacity
              style={[styles.iconBtn, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={onOpenSubscriptions}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
              {upcomingBillCount > 0 && (
                <View style={[styles.badgeDot, { backgroundColor: colors.expense }]} />
              )}
            </TouchableOpacity>
          )}

          {/* Budgets Icon */}
          <TouchableOpacity
            style={[styles.iconBtn, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            activeOpacity={0.7}
            onPress={onOpenBudgets}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pie-chart-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Settings Icon */}
          <TouchableOpacity
            style={[styles.iconBtn, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            activeOpacity={0.7}
            onPress={onOpenSettings}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Liquid Glass Navigation Bar */}
      <View style={styles.tabBarWrapper}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 80}
          tint={isDark ? 'systemUltraThinMaterialDark' : 'systemMaterialLight'}
          style={[
            styles.tabBar,
            {
              backgroundColor: isDark ? 'rgba(23, 26, 46, 0.72)' : 'rgba(255, 255, 255, 0.75)',
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'transactions' && [
                styles.activeTabItem,
                { backgroundColor: colors.primary },
                shadows.sm,
              ],
            ]}
            activeOpacity={0.8}
            onPress={() => onSelectTab('transactions')}
          >
            <Ionicons
              name="receipt-outline"
              size={16}
              color={activeTab === 'transactions' ? colors.white : colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'transactions' ? colors.white : colors.textMuted },
                activeTab === 'transactions' && styles.activeTabText,
              ]}
            >
              Transactions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'analytics' && [
                styles.activeTabItem,
                { backgroundColor: colors.primary },
                shadows.sm,
              ],
            ]}
            activeOpacity={0.8}
            onPress={() => onSelectTab('analytics')}
          >
            <Ionicons
              name="analytics-outline"
              size={16}
              color={activeTab === 'analytics' ? colors.white : colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'analytics' ? colors.white : colors.textMuted },
                activeTab === 'analytics' && styles.activeTabText,
              ]}
            >
              Analytics & Trends
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabBarWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTabItem: {
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
});
