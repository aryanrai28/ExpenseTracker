import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export function RadialSpeedDialFAB({
  onAddExpense,
  onScanReceipt,
  onTransfer,
}) {
  const { colors, shadows } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const toggleDial = () => {
    const toValue = isOpen ? 0 : 1;
    if (!isOpen) {
      hapticFeedback.medium();
      audioEffects.whoosh();
    } else {
      hapticFeedback.light();
    }

    Animated.spring(animValue, {
      toValue,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleAction = (actionFn) => {
    toggleDial();
    setTimeout(() => {
      actionFn?.();
    }, 180);
  };

  // Interpolations
  const rotation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  // Action 1: Quick Add Expense (Top-most)
  const action1Y = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -180],
  });
  const action1Scale = animValue.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.7, 1],
  });

  // Action 2: Scan Receipt OCR (Middle)
  const action2Y = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });
  const action2Scale = animValue.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 1],
  });

  // Action 3: Transfer Between Wallets (Lowest satellite)
  const action3Y = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  const action3Scale = animValue.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View style={styles.fabContainer} pointerEvents="box-none">
      {/* Dimmed Backdrop Dismiss Layer */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleDial}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity, backgroundColor: colors.black },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Satellite 1: Quick Add Expense */}
      <Animated.View
        style={[
          styles.actionWrap,
          {
            transform: [{ translateY: action1Y }, { scale: action1Scale }],
            opacity: animValue,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <View style={[styles.labelPill, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.labelText, { color: colors.textPrimary }]}>Quick Expense</Text>
        </View>
        <TouchableOpacity
          style={[styles.satelliteBtn, shadows.md, { backgroundColor: colors.expense }]}
          activeOpacity={0.8}
          onPress={() => handleAction(onAddExpense)}
        >
          <Ionicons name="flash" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Satellite 2: Scan Receipt OCR */}
      <Animated.View
        style={[
          styles.actionWrap,
          {
            transform: [{ translateY: action2Y }, { scale: action2Scale }],
            opacity: animValue,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <View style={[styles.labelPill, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.labelText, { color: colors.textPrimary }]}>Scan Receipt OCR</Text>
        </View>
        <TouchableOpacity
          style={[styles.satelliteBtn, shadows.md, { backgroundColor: colors.info }]}
          activeOpacity={0.8}
          onPress={() => handleAction(onScanReceipt)}
        >
          <Ionicons name="scan" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Satellite 3: Wallet Transfer */}
      <Animated.View
        style={[
          styles.actionWrap,
          {
            transform: [{ translateY: action3Y }, { scale: action3Scale }],
            opacity: animValue,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <View style={[styles.labelPill, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
          <Text style={[styles.labelText, { color: colors.textPrimary }]}>Transfer Wallets</Text>
        </View>
        <TouchableOpacity
          style={[styles.satelliteBtn, shadows.md, { backgroundColor: colors.income }]}
          activeOpacity={0.8}
          onPress={() => handleAction(onTransfer)}
        >
          <Ionicons name="swap-horizontal" size={20} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Primary Radial FAB Trigger */}
      <TouchableOpacity
        style={[styles.mainFab, shadows.lg, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={toggleDial}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={34} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
    zIndex: 99,
  },
  backdrop: {
    position: 'absolute',
    bottom: -24,
    right: -20,
    width: 600,
    height: 1200,
    zIndex: -1,
  },
  mainFab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionWrap: {
    position: 'absolute',
    bottom: 8,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  labelPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  satelliteBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
