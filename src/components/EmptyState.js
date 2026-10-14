import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

export function EmptyState({ isFiltered = false, onAddPress, onLoadDemoPress }) {
  const { colors } = useTheme();

  const handleAdd = () => {
    hapticFeedback.light();
    onAddPress?.();
  };

  const handleLoadDemo = () => {
    hapticFeedback.medium();
    onLoadDemoPress?.();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
        <Ionicons
          name={isFiltered ? 'search-outline' : 'receipt-outline'}
          size={48}
          color={colors.textMuted}
        />
      </View>

      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {isFiltered ? 'No Matching Transactions' : 'No Transactions Recorded'}
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isFiltered
          ? 'Try adjusting your search keywords, filter chips, or date range.'
          : 'Start tracking your spending and income, or load realistic sample transactions to explore features.'}
      </Text>

      {!isFiltered && (
        <View style={styles.actionsGroup}>
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8} onPress={handleAdd}>
            <Ionicons name="add-circle-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={[styles.primaryBtnText, { color: colors.white }]}>Add Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}
            activeOpacity={0.8}
            onPress={handleLoadDemo}
          >
            <Ionicons name="sparkles-outline" size={18} color={colors.primaryLight} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryBtnText, { color: colors.primaryLight }]}>Load Demo Data</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
