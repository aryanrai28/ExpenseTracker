import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { useTheme } from '../context/ThemeContext';
import { AnimatedNumber } from './AnimatedNumber';
import { audioEffects } from '../utils/audioEffects';
import { hapticFeedback } from '../utils/haptics';

export const CARD_SKINS = [
  {
    id: 'titanium',
    label: 'Matte Titanium',
    icon: 'cube-outline',
    gradient: ['#1C1E26', '#2A2E3D', '#12141B'],
    border: 'rgba(255, 215, 0, 0.25)',
    accent: '#FFD700',
    chipColor: '#D4AF37',
  },
  {
    id: 'iridescent',
    label: 'Holo Iridescent',
    icon: 'sparkles-outline',
    gradient: ['#4F46E5', '#9333EA', '#EC4899', '#06B6D4'],
    border: 'rgba(255, 255, 255, 0.3)',
    accent: '#00FFFF',
    chipColor: 'rgba(255, 215, 0, 0.75)',
  },
  {
    id: 'liquid_glass',
    label: 'Liquid Glass',
    icon: 'water-outline',
    gradient: ['#0A2540', '#134E5E', '#71B280'],
    border: 'rgba(6, 182, 212, 0.4)',
    accent: '#67E8F9',
    chipColor: '#A7F3D0',
  },
  {
    id: 'carbon',
    label: 'Carbon Fiber',
    icon: 'speedometer-outline',
    gradient: ['#0D0D11', '#1B1D26', '#09090C'],
    border: 'rgba(255, 255, 255, 0.15)',
    accent: '#F43F5E',
    chipColor: '#E2E8F0',
  },
];

export function SummaryCards({
  balance,
  income,
  expense,
  currencySymbol = '$',
  isBalanceHidden = false,
  onTogglePrivacy,
}) {
  const { colors, shadows } = useTheme();
  const [skinIndex, setSkinIndex] = useState(0);

  // 3D Parallax Tilt Values
  const tiltX = useRef(new Animated.Value(0)).current; // rotateX
  const tiltY = useRef(new Animated.Value(0)).current; // rotateY

  // Automatic Sheen Loop
  const sheenAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3500),
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(sheenAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Accelerometer 3D Parallax subscription
  useEffect(() => {
    let sub = null;
    if (Platform.OS !== 'web') {
      try {
        Accelerometer.setUpdateInterval(60);
        sub = Accelerometer.addListener(({ x, y }) => {
          // Map x and y acceleration to small degrees of tilt
          const targetY = Math.max(-14, Math.min(14, x * 18));
          const targetX = Math.max(-14, Math.min(14, -y * 18));

          Animated.spring(tiltX, {
            toValue: targetX,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start();

          Animated.spring(tiltY, {
            toValue: targetY,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          }).start();
        });
      } catch (e) {
        // Gyroscope unavailable
      }
    }
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  const activeSkin = CARD_SKINS[skinIndex];

  const handleCycleSkin = () => {
    audioEffects.cardSlot();
    setSkinIndex((prev) => (prev + 1) % CARD_SKINS.length);
  };

  const sheenTranslate = sheenAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 420],
  });

  const rotateXStr = tiltX.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const rotateYStr = tiltY.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  return (
    <View style={styles.container}>
      {/* ── 3D Holographic Card ───────────────────────────────── */}
      <Animated.View
        style={[
          styles.card3dWrap,
          {
            transform: [
              { perspective: 900 },
              { rotateX: rotateXStr },
              { rotateY: rotateYStr },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={activeSkin.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.glassCard,
            shadows.lg,
            { borderColor: activeSkin.border, borderWidth: 1.2 },
          ]}
        >
          {/* Specular Top Edge Light Refraction */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specularTopEdge}
          />

          {/* Translucent Frosted Glass Mesh Layer */}
          <View style={styles.glassMeshLayer} />

          {/* Specular Sheen Sweep */}
          <Animated.View
            style={[
              styles.sheenOverlay,
              { transform: [{ translateX: sheenTranslate }] },
            ]}
          />

          {/* Top Row: Chip, Skin Badge, and Wireless Icon */}
          <View style={styles.topCardRow}>
            <TouchableOpacity
              style={[styles.chip, { backgroundColor: activeSkin.chipColor }]}
              activeOpacity={0.8}
              onPress={handleCycleSkin}
            >
              <View style={styles.chipLine} />
              <View style={[styles.chipLine, { width: 16 }]} />
              <View style={styles.chipLine} />
            </TouchableOpacity>

            {/* Material Skin Selector Badge */}
            <TouchableOpacity
              style={[styles.skinBadge, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: activeSkin.border }]}
              activeOpacity={0.8}
              onPress={handleCycleSkin}
            >
              <Ionicons name={activeSkin.icon} size={12} color={activeSkin.accent} />
              <Text style={[styles.skinBadgeText, { color: activeSkin.accent }]}>
                {activeSkin.label}
              </Text>
              <Ionicons name="swap-horizontal" size={11} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <Ionicons
              name="wifi-outline"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={{ transform: [{ rotate: '90deg' }] }}
            />
          </View>

          {/* Card Number Mask */}
          <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>

          {/* Balance Row */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceTitleGroup}>
              <View style={styles.balanceIconWrap}>
                <Ionicons name="wallet-outline" size={17} color="rgba(255,255,255,0.85)" />
              </View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => {
                hapticFeedback.light();
                onTogglePrivacy();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isBalanceHidden ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          <AnimatedNumber
            value={Math.abs(balance)}
            prefix={balance < 0 ? `-${currencySymbol}` : currencySymbol}
            isHidden={isBalanceHidden}
            style={styles.balanceAmount}
          />

          {/* Card Brand Badge Graphic */}
          <View style={styles.brandBadge}>
            <View style={[styles.brandCircle, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
            <View style={[styles.brandCircle, { backgroundColor: activeSkin.accent + '66', marginLeft: -9 }]} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Income & Expense Duo Cards ──────────────────────────── */}
      <View style={styles.duoRow}>
        {/* Income Card */}
        <View
          style={[
            styles.miniCard,
            shadows.sm,
            { backgroundColor: colors.surface, borderColor: colors.incomeBorder },
          ]}
        >
          <View style={[styles.miniIconWrap, { backgroundColor: colors.incomeBg }]}>
            <Ionicons name="arrow-down-circle" size={20} color={colors.income} />
          </View>
          <View style={styles.miniTextWrap}>
            <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Income</Text>
            <AnimatedNumber
              value={income}
              prefix={currencySymbol}
              isHidden={isBalanceHidden}
              style={[styles.miniAmount, { color: colors.income }]}
            />
          </View>
        </View>

        {/* Expense Card */}
        <View
          style={[
            styles.miniCard,
            shadows.sm,
            { backgroundColor: colors.surface, borderColor: colors.expenseBorder },
          ]}
        >
          <View style={[styles.miniIconWrap, { backgroundColor: colors.expenseBg }]}>
            <Ionicons name="arrow-up-circle" size={20} color={colors.expense} />
          </View>
          <View style={styles.miniTextWrap}>
            <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Expenses</Text>
            <AnimatedNumber
              value={expense}
              prefix={currencySymbol}
              isHidden={isBalanceHidden}
              style={[styles.miniAmount, { color: colors.expense }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card3dWrap: {
    marginBottom: 12,
  },
  glassCard: {
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    minHeight: 198,
    justifyContent: 'space-between',
  },
  specularTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  glassMeshLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  sheenOverlay: {
    position: 'absolute',
    top: -30,
    width: 90,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '18deg' }],
  },
  topCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    gap: 2,
  },
  chipLine: {
    width: 22,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  skinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  skinBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 3,
    marginBottom: 14,
    fontVariant: ['tabular-nums'],
  },
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  eyeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  brandBadge: {
    position: 'absolute',
    bottom: 18,
    right: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  // ── Duo Cards ──────────────────────────────────────────
  duoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  miniCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  miniIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  miniTextWrap: {
    flex: 1,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniAmount: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
});
