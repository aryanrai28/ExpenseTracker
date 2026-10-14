import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

export function WidgetPreviewModal({
  visible,
  balance = 0,
  todaySpend = 0,
  upcomingBills = [],
  currencySymbol = '$',
  onClose,
}) {
  const { colors, shadows } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>OS Widget Hub</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Simulated Home Screen & Lock Screen widgets
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Medium Widget (4x2) */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>MEDIUM HOME SCREEN WIDGET (4x2)</Text>
            <LinearGradient
              colors={colors.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.mediumWidget, shadows.md]}
            >
              <View style={styles.widgetHeader}>
                <View style={styles.widgetBrand}>
                  <Ionicons name="wallet" size={14} color="#FFF" />
                  <Text style={styles.widgetBrandText}>EXPENSE TRACKER</Text>
                </View>
                <Text style={styles.widgetLiveDot}>● LIVE</Text>
              </View>

              <View style={styles.mediumContentRow}>
                <View>
                  <Text style={styles.widgetLabel}>Total Balance</Text>
                  <Text style={styles.widgetMainAmount}>{formatCurrency(balance, currencySymbol)}</Text>
                </View>
                <View style={styles.widgetDivider} />
                <View>
                  <Text style={styles.widgetLabel}>Today's Spending</Text>
                  <Text style={[styles.widgetMainAmount, { color: '#F43F5E' }]}>
                    {formatCurrency(todaySpend, currencySymbol)}
                  </Text>
                </View>
              </View>

              {upcomingBills.length > 0 && (
                <View style={styles.widgetUpcomingStrip}>
                  <Ionicons name="alarm-outline" size={13} color="#FFD700" />
                  <Text style={styles.widgetUpcomingText}>
                    Next Bill: {upcomingBills[0].name} ({formatCurrency(upcomingBills[0].amount, currencySymbol)})
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* Small Widget (2x2) & Lock Screen Complication */}
            <View style={styles.widgetsPairRow}>
              {/* Small Widget (2x2) */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SMALL (2x2)</Text>
                <LinearGradient
                  colors={['#171A2E', '#21253E']}
                  style={[styles.smallWidget, shadows.sm, { borderColor: colors.surfaceBorder }]}
                >
                  <Ionicons name="wallet-outline" size={20} color={colors.primaryLight} />
                  <Text style={styles.smallWidgetLabel}>Net Worth</Text>
                  <Text style={[styles.smallWidgetAmount, { color: '#FFF' }]}>
                    {formatCurrency(balance, currencySymbol)}
                  </Text>
                  <View style={styles.smallWidgetFooter}>
                    <Text style={[styles.smallWidgetToday, { color: colors.expense }]}>
                      -{formatCurrency(todaySpend, currencySymbol)} today
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Lock Screen Complication */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>LOCK SCREEN</Text>
                <View style={[styles.lockScreenWidget, { backgroundColor: '#000', borderColor: 'rgba(255,255,255,0.2)' }]}>
                  <View style={styles.lockRow}>
                    <Ionicons name="card" size={14} color="#FFF" />
                    <Text style={styles.lockBrand}>BALANCE</Text>
                  </View>
                  <Text style={styles.lockAmount}>{formatCurrency(balance, currencySymbol)}</Text>
                  <Text style={styles.lockSub}>TODAY -{formatCurrency(todaySpend, currencySymbol)}</Text>
                </View>
              </View>
            </View>

            {/* App Icon 3D Touch Quick Shortcuts */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary, marginTop: 14 }]}>
              3D TOUCH / LONG-PRESS SHORTCUTS
            </Text>
            <View style={[styles.shortcutsMenu, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
              <View style={styles.shortcutRow}>
                <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>Quick Add Expense</Text>
                <Ionicons name="add-circle-outline" size={20} color={colors.primaryLight} />
              </View>
              <View style={[styles.menuDivider, { backgroundColor: colors.surfaceHighlight }]} />
              <View style={styles.shortcutRow}>
                <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>Scan Receipt OCR</Text>
                <Ionicons name="camera-outline" size={20} color={colors.info} />
              </View>
              <View style={[styles.menuDivider, { backgroundColor: colors.surfaceHighlight }]} />
              <View style={styles.shortcutRow}>
                <Text style={[styles.shortcutTitle, { color: colors.textPrimary }]}>Check Bill Radar</Text>
                <Ionicons name="notifications-outline" size={20} color={colors.warning} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6,
  },
  mediumWidget: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetBrandText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  widgetLiveDot: {
    color: '#00FFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mediumContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  widgetLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  widgetMainAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 2,
  },
  widgetDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  widgetUpcomingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  widgetUpcomingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  widgetsPairRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallWidget: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    height: 140,
    justifyContent: 'space-between',
  },
  smallWidgetLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  smallWidgetAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  smallWidgetFooter: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  smallWidgetToday: {
    fontSize: 10,
    fontWeight: '700',
  },
  lockScreenWidget: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  lockBrand: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  lockAmount: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  lockSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
  },
  shortcutsMenu: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  shortcutTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 14,
  },
});
