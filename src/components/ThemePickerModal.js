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
import { THEME_LIST, ACCENT_PRESETS } from '../constants/theme';

import { LiquidGlassModal } from './LiquidGlassModal';

export function ThemePickerModal({ visible, onClose }) {
  const { themeId, accentColor, selectTheme, selectAccent, colors } = useTheme();

  return (
    <LiquidGlassModal
      visible={visible}
      onClose={onClose}
      title="Appearance"
      subtitle="Themes & Custom Accents"
      maxHeight="88%"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Theme Cards */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SELECT THEME</Text>
        <View style={styles.themeGrid}>
          {THEME_LIST.map((theme) => {
            const isSelected = themeId === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  {
                    borderColor: isSelected ? theme.primary : colors.surfaceBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => selectTheme(theme.id)}
              >
                <LinearGradient
                  colors={theme.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.themePreview}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  )}
                </LinearGradient>
                <View style={[styles.themeInfoStrip, { backgroundColor: theme.background }]}>
                  {/* Mini color swatches */}
                  <View style={styles.swatchRow}>
                    <View style={[styles.swatch, { backgroundColor: theme.primary }]} />
                    <View style={[styles.swatch, { backgroundColor: theme.income }]} />
                    <View style={[styles.swatch, { backgroundColor: theme.expense }]} />
                    <View style={[styles.swatch, { backgroundColor: theme.warning }]} />
                  </View>
                </View>
                <Text style={[styles.themeName, { color: colors.textPrimary }]}>{theme.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Accent Color Picker */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ACCENT COLOR</Text>
        <Text style={[styles.sectionSubtext, { color: colors.textMuted }]}>
          Override the primary color. Tap again to reset to theme default.
        </Text>
        <View style={styles.accentGrid}>
          {ACCENT_PRESETS.map((color) => {
            const isActive = accentColor === color;
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.accentCircle,
                  {
                    backgroundColor: color,
                    borderWidth: isActive ? 3 : 0,
                    borderColor: colors.white,
                    transform: [{ scale: isActive ? 1.15 : 1 }],
                  },
                ]}
                onPress={() => selectAccent(isActive ? null : color)}
              >
                {isActive && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </TouchableOpacity>
            );
          })}
          {/* Reset */}
          <TouchableOpacity
            style={[
              styles.accentCircle,
              styles.resetCircle,
              {
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surfaceLight,
              },
            ]}
            onPress={() => selectAccent(null)}
          >
            <Ionicons name="refresh" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LiquidGlassModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    maxHeight: '88%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 20 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtext: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  themeCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  themePreview: {
    height: 70,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 8,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeInfoStrip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeName: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  accentCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCircle: {
    borderWidth: 1,
  },
});
