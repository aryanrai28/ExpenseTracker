import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function FinancialAuroraGlow({
  savingsRate = 0,
  budgetOverLimit = false,
  urgentBillDue = false,
  budgetNearThreshold = false,
}) {
  const pulseAnim = useRef(new Animated.Value(0.45)).current;

  // Pulse animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.45,
          duration: 3500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Determine ambient aurora color spectrum based on health state
  let auroraColors = ['rgba(16, 185, 129, 0.22)', 'rgba(52, 211, 153, 0.08)', 'transparent']; // Emerald

  if (budgetOverLimit || urgentBillDue) {
    // Neon Crimson Pulse
    auroraColors = ['rgba(244, 63, 94, 0.3)', 'rgba(251, 113, 133, 0.1)', 'transparent'];
  } else if (budgetNearThreshold || savingsRate < 10) {
    // Sunset Amber
    auroraColors = ['rgba(245, 158, 11, 0.25)', 'rgba(251, 191, 36, 0.08)', 'transparent'];
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.auroraContainer,
        {
          opacity: pulseAnim,
        },
      ]}
    >
      <LinearGradient
        colors={auroraColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  auroraContainer: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    height: 320,
    zIndex: 0,
  },
  gradient: {
    flex: 1,
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
  },
});
