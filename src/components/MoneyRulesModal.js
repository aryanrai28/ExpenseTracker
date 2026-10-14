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
import { hapticFeedback } from '../utils/haptics';

export function MoneyRulesModal({
  visible,
  rules = [],
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onClose,
}) {
  const { colors } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a rule name.');
      return;
    }
    const tVal = parseFloat(threshold) || 0;
    onAddRule({
      title: title.trim(),
      description: desc.trim() || 'Custom automated condition rule.',
      threshold: tVal,
      actionType: 'custom_alert',
    });
    setTitle('');
    setDesc('');
    setThreshold('');
    setIsAdding(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Automated Money Rules</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Behavioral triggers & IFTTT micro-transfers
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
            {/* Rules List */}
            {rules.map((rule) => (
              <View
                key={rule.id}
                style={[styles.ruleCard, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}
              >
                <View style={styles.ruleInfo}>
                  <View style={[styles.ruleIconWrap, { backgroundColor: rule.isEnabled ? colors.primaryGlow : colors.surfaceHighlight }]}>
                    <Ionicons
                      name="flash-outline"
                      size={18}
                      color={rule.isEnabled ? colors.primaryLight : colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ruleTitle, { color: colors.textPrimary }]}>{rule.title}</Text>
                    <Text style={[styles.ruleDesc, { color: colors.textSecondary }]}>{rule.description}</Text>
                  </View>
                </View>

                <View style={styles.ruleActionRow}>
                  <Switch
                    value={rule.isEnabled}
                    onValueChange={() => onToggleRule(rule.id)}
                    trackColor={{ false: colors.surfaceHighlight, true: colors.primaryLight }}
                    thumbColor="#FFF"
                  />
                  {onDeleteRule && (
                    <TouchableOpacity
                      onPress={() => onDeleteRule(rule.id)}
                      style={{ padding: 6, marginLeft: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.expense} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Add Custom Rule Form */}
            {isAdding ? (
              <View style={[styles.addCard, { backgroundColor: colors.surfaceLight, borderColor: colors.primaryLight }]}>
                <Text style={[styles.addTitle, { color: colors.textPrimary }]}>Create Custom Trigger</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                  placeholder="Rule Name (e.g. Weekend Coffee Cap)"
                  placeholderTextColor={colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                  placeholder="Spend Threshold (e.g. 50)"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={threshold}
                  onChangeText={setThreshold}
                />
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]}
                  placeholder="Action Description"
                  placeholderTextColor={colors.textMuted}
                  value={desc}
                  onChangeText={setDesc}
                />

                <View style={styles.addActions}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.surfaceBorder }]}
                    onPress={() => setIsAdding(false)}
                  >
                    <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary }]}
                    onPress={handleAdd}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Activate Rule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addTriggerBtn, { borderColor: colors.primaryLight }]}
                onPress={() => {
                  hapticFeedback.light();
                  setIsAdding(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primaryLight} style={{ marginRight: 8 }} />
                <Text style={[styles.addTriggerText, { color: colors.primaryLight }]}>Add Custom Money Rule</Text>
              </TouchableOpacity>
            )}
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
    paddingBottom: 20,
  },
  ruleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  ruleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  ruleActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 10,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addTriggerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
