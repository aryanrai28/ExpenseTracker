import React, { useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

export function LiquidGlassModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  headerRight,
  maxHeight = '90%',
}) {
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 1.2) {
          hapticFeedback.light();
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        {/* Ambient Mesh Gradient Orbs (Prismatic Light Refraction) */}
        <View style={styles.ambientOrbsContainer} pointerEvents="none">
          <LinearGradient
            colors={[colors.primaryLight + '44', 'transparent']}
            style={[styles.ambientOrb, styles.orbTopLeft]}
          />
          <LinearGradient
            colors={[colors.income + '33', 'transparent']}
            style={[styles.ambientOrb, styles.orbBottomRight]}
          />
        </View>

        {/* Liquid Glass Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              maxHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 70 : 85}
            tint={isDark ? 'systemUltraThinMaterialDark' : 'systemMaterialLight'}
            style={[
              styles.blurContent,
              {
                backgroundColor: isDark ? 'rgba(23, 26, 46, 0.82)' : 'rgba(255, 255, 255, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.16)',
              },
            ]}
          >
            {/* Gesture Grabber Bar Area */}
            <View {...panResponder.panHandlers} style={styles.grabberTouchArea}>
              <View
                style={[
                  styles.grabber,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)' },
                ]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitles}>
                {Boolean(title) && (
                  <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
                )}
                {Boolean(subtitle) && (
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {subtitle}
                  </Text>
                )}
              </View>

              <View style={styles.headerActions}>
                {headerRight}
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceLight }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sheet Body Content */}
            <View style={styles.body}>{children}</View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  ambientOrbsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientOrb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  orbTopLeft: {
    top: '30%',
    left: -60,
  },
  orbBottomRight: {
    bottom: 20,
    right: -40,
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  blurContent: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  grabberTouchArea: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 14,
  },
  headerTitles: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
});
