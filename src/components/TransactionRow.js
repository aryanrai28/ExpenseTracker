import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getCategoryMeta } from '../constants/categories';
import { formatCurrency, getRelativeDateLabel } from '../utils/formatters';
import { hapticFeedback } from '../utils/haptics';
import { getMerchantMeta } from '../utils/merchantLogos';

export function TransactionRow({
  transaction,
  currencySymbol = '$',
  isBalanceHidden = false,
  onPress,
  onQuickAction,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const { colors, shadows } = useTheme();
  const swipeableRef = useRef(null);
  const { id, title, amount, type, category, date, isRecurring, receiptUri } = transaction;
  const isIncome = type === 'income';
  const cat = getCategoryMeta(category);
  const merchant = getMerchantMeta(title);

  const amountColor = isIncome ? colors.income : colors.expense;
  const badgeBg = merchant.isBrand ? merchant.glowColor : (isIncome ? colors.incomeBg : colors.expenseBg);
  const iconColor = merchant.isBrand ? merchant.brandColor : (cat.color || amountColor);

  const handleRowPress = () => {
    hapticFeedback.light();
    onPress(transaction);
  };

  const handleQuickAction = (e) => {
    e?.stopPropagation?.();
    hapticFeedback.light();
    onQuickAction(transaction);
  };

  // ── Swipe Right Actions (Edit, Duplicate) ───────────
  const renderLeftActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [0, 80, 160],
      outputRange: [-160, -80, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.leftActions, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            hapticFeedback.medium();
            swipeableRef.current?.close();
            onEdit?.(transaction);
          }}
        >
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <Text style={styles.swipeBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeBtn, { backgroundColor: colors.info }]}
          onPress={() => {
            hapticFeedback.light();
            swipeableRef.current?.close();
            onDuplicate?.(id);
          }}
        >
          <Ionicons name="copy-outline" size={20} color="#FFF" />
          <Text style={styles.swipeBtnText}>Copy</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ── Swipe Left Action (Delete) ──────────────────────
  const renderRightActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View style={[styles.rightActions, { transform: [{ translateX }] }]}>
        <TouchableOpacity
          style={[styles.swipeBtn, styles.deleteBtn]}
          onPress={() => {
            hapticFeedback.heavy();
            swipeableRef.current?.close();
            onDelete?.(id);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#FFF" />
          <Text style={styles.swipeBtnText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[
          styles.row,
          shadows.sm,
          {
            backgroundColor: colors.surface,
            borderColor: merchant.isBrand ? merchant.brandColor + '33' : colors.surfaceBorder,
          },
        ]}
        activeOpacity={0.7}
        onPress={handleRowPress}
      >
        {/* Merchant Brand / Category Icon Badge */}
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          {merchant.isBrand && merchant.icon ? (
            <Ionicons name={merchant.icon} size={20} color={iconColor} />
          ) : !isIncome && merchant.monogram && merchant.monogram.length > 0 && Math.random && false ? (
            <Text style={[styles.monogramText, { color: iconColor }]}>{merchant.monogram}</Text>
          ) : (
            <Ionicons name={cat.icon} size={20} color={iconColor} />
          )}
        </View>

        {/* Info Column */}
        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
            {merchant.isBrand && (
              <View style={[styles.brandPill, { backgroundColor: merchant.glowColor }]}>
                <Text style={[styles.brandPillText, { color: merchant.brandColor }]}>
                  {merchant.displayName}
                </Text>
              </View>
            )}
            {isRecurring && (
              <View style={[styles.recurringBadge, { backgroundColor: colors.primaryGlow }]}>
                <Ionicons name="repeat" size={12} color={colors.primaryLight} />
              </View>
            )}
            {Boolean(receiptUri) && (
              <View style={[styles.receiptBadge, { backgroundColor: colors.infoBg }]}>
                <Ionicons name="attach" size={12} color={colors.info} />
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.catLabel, { color: colors.textMuted }]}>{cat.label}</Text>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.dateLabel, { color: colors.textMuted }]}>
              {getRelativeDateLabel(date)}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountCol}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncome ? '+' : '-'}
            {formatCurrency(amount, currencySymbol, isBalanceHidden)}
          </Text>
        </View>

        {/* Quick action */}
        <TouchableOpacity
          style={[styles.moreBtn, { backgroundColor: colors.surfaceLight }]}
          onPress={handleQuickAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  brandPill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  monogramText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recurringBadge: {
    marginLeft: 6,
    padding: 3,
    borderRadius: 5,
  },
  receiptBadge: {
    marginLeft: 4,
    padding: 3,
    borderRadius: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountCol: {
    marginRight: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  moreBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Swipe Actions ──────────────────────
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
    paddingRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  swipeBtn: {
    width: 72,
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  swipeBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
