import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

export function FilterSortBar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateRangeFilter,
  onDateRangeFilterChange,
  sortBy,
  onSortByChange,
  totalResultsCount,
}) {
  const { colors } = useTheme();

  const TYPE_OPTIONS = [
    { id: 'all', label: 'All Types' },
    { id: 'expense', label: 'Expenses' },
    { id: 'income', label: 'Income' },
    { id: 'recurring', label: 'Recurring' },
  ];

  const DATE_OPTIONS = [
    { id: 'all', label: 'All Dates' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
  ];

  const SORT_OPTIONS = [
    { id: 'date_desc', label: 'Newest', icon: 'time-outline' },
    { id: 'date_asc', label: 'Oldest', icon: 'hourglass-outline' },
    { id: 'amount_desc', label: 'Highest $', icon: 'arrow-up-outline' },
    { id: 'amount_asc', label: 'Lowest $', icon: 'arrow-down-outline' },
  ];

  const handleTypePress = (id) => {
    hapticFeedback.light();
    if (id === 'recurring') {
      onDateRangeFilterChange('recurring');
    } else {
      if (dateRangeFilter === 'recurring') onDateRangeFilterChange('all');
      onTypeFilterChange(id);
    }
  };

  const handleDatePress = (id) => {
    hapticFeedback.light();
    onDateRangeFilterChange(id);
  };

  const handleSortPress = (id) => {
    hapticFeedback.light();
    onSortByChange(id);
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={[styles.searchInputWrap, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by title, category, or note..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter & Sort Chips Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {/* Type Chips */}
        {TYPE_OPTIONS.map((opt) => {
          const isSelected =
            opt.id === 'recurring'
              ? dateRangeFilter === 'recurring'
              : typeFilter === opt.id && dateRangeFilter !== 'recurring';
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primaryLight : colors.surfaceBorder,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handleTypePress(opt.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? colors.white : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={[styles.chipDivider, { backgroundColor: colors.divider }]} />

        {/* Date Range Chips */}
        {dateRangeFilter !== 'recurring' &&
          DATE_OPTIONS.map((opt) => {
            const isSelected = dateRangeFilter === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primaryLight : colors.surfaceBorder,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => handleDatePress(opt.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? colors.white : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}

        <View style={[styles.chipDivider, { backgroundColor: colors.divider }]} />

        {/* Sort Chips */}
        {SORT_OPTIONS.map((opt) => {
          const isSelected = sortBy === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.chip,
                styles.chipSort,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primaryLight : colors.surfaceBorder,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handleSortPress(opt.id)}
            >
              <Ionicons
                name={opt.icon}
                size={14}
                color={isSelected ? colors.white : colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? colors.white : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results Count Line */}
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          {totalResultsCount} transaction{totalResultsCount !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  searchRow: {
    marginBottom: 10,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipSort: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 2,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
