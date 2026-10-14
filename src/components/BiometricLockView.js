import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export function BiometricLockView({
  onUnlock,
  onUnlockDecoy,
  decoyPin = '9999',
}) {
  const { colors, isDark } = useTheme();
  const [pin, setPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Cyber Laser Scan Line Animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    hapticFeedback.light();
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setTimeout(() => {
        if (nextPin === decoyPin) {
          audioEffects.whoosh();
          onUnlockDecoy?.();
        } else {
          audioEffects.cashChime();
          onUnlock?.();
        }
        setPin('');
      }, 150);
    }
  };

  const handleDeleteDigit = () => {
    hapticFeedback.light();
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometricPress = () => {
    hapticFeedback.medium();
    setIsScanning(true);
    audioEffects.whoosh();

    setTimeout(() => {
      setIsScanning(false);
      audioEffects.cashChime();
      onUnlock?.();
    }, 600);
  };

  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-36, 36],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Cyber Laser Target Glyphs */}
        <View style={styles.targetWrapper}>
          <View style={[styles.targetCorner, styles.cornerTL, { borderColor: colors.primaryLight }]} />
          <View style={[styles.targetCorner, styles.cornerTR, { borderColor: colors.primaryLight }]} />
          <View style={[styles.targetCorner, styles.cornerBL, { borderColor: colors.primaryLight }]} />
          <View style={[styles.targetCorner, styles.cornerBR, { borderColor: colors.primaryLight }]} />

          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceLight, borderColor: colors.surfaceBorder }]}>
            {/* Animated Laser Scanning Line */}
            <Animated.View
              style={[
                styles.laserLine,
                {
                  transform: [{ translateY: laserTranslateY }],
                  backgroundColor: isScanning ? '#10B981' : '#00FFFF',
                  shadowColor: isScanning ? '#10B981' : '#00FFFF',
                },
              ]}
            />
            <Ionicons
              name={isScanning ? 'finger-print' : 'lock-closed'}
              size={40}
              color={isScanning ? '#10B981' : colors.primaryLight}
            />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>Expense Tracker Protected</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isScanning ? 'Verifying biometric sensor...' : 'Enter 4-digit security PIN or tap Biometrics'}
        </Text>

        {/* PIN Indicator Dots */}
        <View style={styles.pinDotsRow}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <View
                key={idx}
                style={[
                  styles.pinDot,
                  { borderColor: colors.primaryLight },
                  isFilled && { backgroundColor: colors.primaryLight },
                ]}
              />
            );
          })}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['bio', '0', 'del'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((val) => {
                if (val === 'bio') {
                  return (
                    <TouchableOpacity
                      key={val}
                      style={[styles.keyBtn, styles.specialKey]}
                      onPress={handleBiometricPress}
                    >
                      <Ionicons name="finger-print" size={26} color={colors.primaryLight} />
                    </TouchableOpacity>
                  );
                }
                if (val === 'del') {
                  return (
                    <TouchableOpacity
                      key={val}
                      style={[styles.keyBtn, styles.specialKey]}
                      onPress={handleDeleteDigit}
                    >
                      <Ionicons name="backspace-outline" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.keyBtn, { backgroundColor: colors.surfaceLight }]}
                    activeOpacity={0.7}
                    onPress={() => handleDigit(val)}
                  >
                    <Text style={[styles.keyText, { color: colors.textPrimary }]}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Biometric Secondary Action Button */}
        <TouchableOpacity style={styles.unlockBtn} activeOpacity={0.8} onPress={handleBiometricPress}>
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.unlockGradient}
          >
            <Ionicons name="scan-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.unlockBtnText}>Biometric Instant Unlock</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  targetWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  targetCorner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderWidth: 2,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  keypad: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keyBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialKey: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unlockBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  unlockGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  unlockBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
