import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PARTICLE_COUNT = 25;
const CONFETTI_COLORS = [
  '#6366F1', '#818CF8', '#10B981', '#34D399',
  '#F59E0B', '#EC4899', '#06B6D4', '#F43F5E',
  '#8B5CF6', '#FBBF24',
];

/**
 * ConfettiBurst — lightweight celebration particle animation.
 *
 * Props:
 *   visible   - whether the confetti is active
 *   onDone    - callback when animation finishes
 *   duration  - total animation duration (default 2200ms)
 */
export function ConfettiBurst({ visible = false, onDone, duration = 2200 }) {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 6,
      startX: SCREEN_W / 2 + (Math.random() - 0.5) * 40,
      startY: SCREEN_H * 0.35,
      velocityX: (Math.random() - 0.5) * 250,
      velocityY: -(150 + Math.random() * 200),
    }))
  ).current;

  useEffect(() => {
    if (!visible) return;

    const animations = particles.map((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.rotate.setValue(0);
      p.opacity.setValue(1);

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: p.velocityX,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.y, {
            toValue: p.velocityY,
            duration: duration * 0.4,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: SCREEN_H * 0.4,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.rotate, {
          toValue: (Math.random() - 0.5) * 720,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onDone?.();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.size * 0.6,
              borderRadius: p.size * 0.15,
              left: p.startX,
              top: p.startY,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [-720, 720],
                    outputRange: ['-720deg', '720deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
});
