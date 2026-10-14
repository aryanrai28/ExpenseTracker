import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CURRENCIES } from '../constants/currencies';
import { THEMES } from '../constants/theme';
import { exportTransactionsToCSV } from '../utils/exportData';
import { exportEncryptedBackup, importEncryptedBackup } from '../utils/backupUtils';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export function SettingsModal({
  visible,
  currency,
  onSelectCurrency,
  isBiometricEnabled,
  onToggleBiometric,
  isHardwareSupported,
  isSoundMuted = false,
  onToggleSound,
  isShakeToHideEnabled = true,
  onToggleShakeToHide,
  decoyPin = '9999',
  onSetDecoyPin,
  transactions,
  onResetDemo,
  onClearAll,
  onOpenThemePicker,
  onOpenWidgetPreview,
  onClose,
}) {
  const { themeId, colors } = useTheme();

  // Backup dialog states
  const [backupDialogMode, setBackupDialogMode] = useState(null); // 'export' | 'import' | null
  const [backupPassword, setBackupPassword] = useState('');
  const [importJsonText, setImportJsonText] = useState('');

  // Decoy PIN dialog state
  const [showDecoyPrompt, setShowDecoyPrompt] = useState(false);
  const [tempDecoyPin, setTempDecoyPin] = useState(decoyPin);

  const handleExportCSV = async () => {
    audioEffects.cashChime();
    await exportTransactionsToCSV(transactions, currency.symbol);
  };

  const handleStartExport = () => {
    hapticFeedback.light();
    setBackupPassword('');
    setBackupDialogMode('export');
  };

  const handleConfirmExport = async () => {
    if (!backupPassword || backupPassword.length < 4) {
      Alert.alert('Password too short', 'Please enter at least 4 characters.');
      return;
    }
    const success = await exportEncryptedBackup(backupPassword);
    if (success) {
      setBackupDialogMode(null);
      setBackupPassword('');
    }
  };

  const handleStartImport = () => {
    hapticFeedback.light();
    setBackupPassword('');
    setImportJsonText('');
    setBackupDialogMode('import');
  };

  const handleConfirmImport = async () => {
    if (!backupPassword) {
      Alert.alert('Password Required', 'Please enter your backup password.');
      return;
    }
    if (!importJsonText.trim()) {
      Alert.alert('Data Required', 'Please paste the backup file content.');
      return;
    }
    const success = await importEncryptedBackup(importJsonText.trim(), backupPassword);
    if (success) {
      setBackupDialogMode(null);
      setBackupPassword('');
      setImportJsonText('');
    }
  };

  const handleSaveDecoyPin = () => {
    if (tempDecoyPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Decoy PIN must be exactly 4 digits.');
      return;
    }
    onSetDecoyPin?.(tempDecoyPin);
    setShowDecoyPrompt(false);
    hapticFeedback.success();
  };

  const handleResetDemoConfirm = () => {
    hapticFeedback.medium();
    Alert.alert(
      'Reset Demo Data',
      'This will replace your current transactions with realistic demo transactions. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            onResetDemo();
            onClose();
          },
        },
      ]
    );
  };

  const handleClearAllConfirm = () => {
    hapticFeedback.heavy();
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to permanently delete ALL your transactions?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            onClearAll();
            onClose();
          },
        },
      ]
    );
  };

  const activeThemeMeta = THEMES[themeId] || THEMES.midnight;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings & Preferences</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Appearance Section */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APPEARANCE</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.light();
                onOpenThemePicker?.();
              }}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="color-palette-outline" size={20} color={colors.primaryLight} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Theme & Accent Colors</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Active: {activeThemeMeta.label}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.colorDot, { backgroundColor: colors.primary }]} />
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            {/* Sensory & Motion */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SENSORY & AUDIO EFFECTS</Text>
            <View style={[styles.settingRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
              <View style={styles.settingInfo}>
                <Ionicons
                  name={!isSoundMuted ? 'volume-high-outline' : 'volume-mute-outline'}
                  size={20}
                  color={colors.primaryLight}
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Sound Design & Audio Cues</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                    Coin clinks, cash chimes, and interaction sounds
                  </Text>
                </View>
              </View>
              <Switch
                value={!isSoundMuted}
                onValueChange={(val) => onToggleSound?.(!val)}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primaryLight }}
                thumbColor="#FFF"
              />
            </View>

            {/* Currency Selector */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DEFAULT CURRENCY</Text>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => {
                const isSelected = currency.code === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyPill,
                      { backgroundColor: colors.surfaceLight },
                      isSelected && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryLight, borderWidth: 1.5 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => onSelectCurrency(c)}
                  >
                    <Text
                      style={[
                        styles.currencySymbol,
                        { color: colors.textSecondary },
                        isSelected && { color: colors.primaryLight },
                      ]}
                    >
                      {c.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.currencyCode,
                        { color: colors.textMuted },
                        isSelected && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {c.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Security & Stealth Privacy */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SECURITY & STEALTH PRIVACY</Text>
            <View style={[styles.settingRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="finger-print-outline" size={22} color={colors.primaryLight} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Biometric & PIN Lock</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                    {isHardwareSupported
                      ? 'Lock app with Face ID, Fingerprint or PIN'
                      : 'Protected with 4-digit PIN'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={(val) => onToggleBiometric(val)}
                disabled={!isHardwareSupported}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primaryLight }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.settingRow, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.info} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Shake to Hide (Stealth Mode)</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                    Physically shake device to redact balances in public
                  </Text>
                </View>
              </View>
              <Switch
                value={isShakeToHideEnabled}
                onValueChange={(val) => onToggleShakeToHide?.(val)}
                trackColor={{ false: colors.surfaceHighlight, true: colors.primaryLight }}
                thumbColor="#FFF"
              />
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={() => setShowDecoyPrompt(true)}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="key-outline" size={20} color={colors.warning} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Duress Decoy PIN</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Configured: **** · Unlocks harmless decoy numbers
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Decoy PIN Dialog */}
            {showDecoyPrompt && (
              <View style={[styles.backupModalCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.warning }]}>
                <Text style={[styles.backupTitle, { color: colors.textPrimary }]}>Configure Duress Decoy PIN</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>
                  Entering this 4-digit PIN on the lock screen loads harmless demo numbers instead of your real net worth.
                </Text>
                <TextInput
                  style={[styles.backupInput, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                  placeholder="4-Digit Decoy PIN (e.g. 9999)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                  value={tempDecoyPin}
                  onChangeText={setTempDecoyPin}
                />
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={[styles.dialogBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => setShowDecoyPrompt(false)}
                  >
                    <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogBtn, { backgroundColor: colors.primary }]}
                    onPress={handleSaveDecoyPin}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Save Decoy PIN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* OS Integrations */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>OS INTEGRATIONS & WIDGETS</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={() => {
                hapticFeedback.light();
                onOpenWidgetPreview?.();
              }}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="albums-outline" size={20} color={colors.primaryLight} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Lock & Home Screen Widgets</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Preview iOS/Android widgets & 3D touch shortcuts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Encrypted Backup */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ENCRYPTED BACKUP & RESTORE</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={handleStartExport}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.income} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Export Encrypted Backup</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Password-protected .etbak bundle of all data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={handleStartImport}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.info} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Restore from Backup</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Decrypt and restore your full account history
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Backup Dialog In-line */}
            {backupDialogMode && (
              <View style={[styles.backupModalCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.primaryLight }]}>
                <Text style={[styles.backupTitle, { color: colors.textPrimary }]}>
                  {backupDialogMode === 'export' ? 'Encrypt & Export Backup' : 'Restore from Backup'}
                </Text>

                {backupDialogMode === 'import' && (
                  <TextInput
                    style={[styles.backupInput, { backgroundColor: colors.surface, color: colors.textPrimary, height: 60 }]}
                    placeholder="Paste backup JSON text here..."
                    placeholderTextColor={colors.textMuted}
                    value={importJsonText}
                    onChangeText={setImportJsonText}
                    multiline
                  />
                )}

                <TextInput
                  style={[styles.backupInput, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                  placeholder="Enter encryption password..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  value={backupPassword}
                  onChangeText={setBackupPassword}
                />

                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={[styles.dialogBtn, { backgroundColor: colors.surfaceLight }]}
                    onPress={() => setBackupDialogMode(null)}
                  >
                    <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogBtn, { backgroundColor: colors.primary }]}
                    onPress={backupDialogMode === 'export' ? handleConfirmExport : handleConfirmImport}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>
                      {backupDialogMode === 'export' ? 'Export' : 'Restore'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Export & Data Management */}
            <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DATA MANAGEMENT</Text>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={handleExportCSV}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="document-text-outline" size={20} color={colors.primaryLight} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Export to CSV</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Export spreadsheet for Excel / Google Sheets
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              activeOpacity={0.7}
              onPress={handleResetDemoConfirm}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="refresh-outline" size={20} color={colors.primaryLight} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Load Demo Transactions</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
                    Populate sample data for testing
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.dangerBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.expenseBorder }]}
              activeOpacity={0.7}
              onPress={handleClearAllConfirm}
            >
              <View style={styles.actionInfo}>
                <Ionicons name="trash-outline" size={20} color={colors.expense} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[styles.actionTitle, { color: colors.expense }]}>Clear All Transactions</Text>
                  <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Permanently wipe all records</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.versionFooter}>
              <Text style={[styles.versionText, { color: colors.textMuted }]}>
                Expense Tracker v4.0 · Institutional FinTech Edition
              </Text>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 16,
    letterSpacing: 0.6,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minWidth: '22%',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 6,
  },
  currencyCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 11,
    marginTop: 2,
    marginRight: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  dangerBtn: {
    borderWidth: 1,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  backupModalCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  backupTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  backupInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dialogBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
