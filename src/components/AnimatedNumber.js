import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

/**
 * AnimatedNumber — Odometer-style rolling number display.
 *
 * Smoothly animates between numeric values with a spring transition.
 * Falls back to plain text for hidden values or non-numeric content.
 *
 * Props:
 *   value       - the numeric value to display
 *   prefix      - string prepended (e.g. currency symbol)
 *   suffix      - string appended
 *   isHidden    - if true, shows masked placeholder
 *   style       - text style
 *   duration    - animation duration in ms (default 600)
 *   formatFn    - optional custom formatter(value) => string
 */
export function AnimatedNumber({
  value = 0,
  prefix = '',
  suffix = '',
  isHidden = false,
  style,
  duration = 600,
  formatFn,
}) {
  const animatedValue = useRef(new Animated.Value(value)).current;
  const displayValue = useRef(value);
  const textRef = useRef(null);
  const [displayText, setDisplayText] = React.useState(
    formatValue(value, prefix, suffix, isHidden, formatFn)
  );

  useEffect(() => {
    if (isHidden) {
      setDisplayText(`${prefix}••••••${suffix}`);
      return;
    }

    const numericVal = typeof value === 'number' && !isNaN(value) ? value : 0;

    Animated.timing(animatedValue, {
      toValue: numericVal,
      duration,
      useNativeDriver: false,
    }).start();

    // Listen to the animation and update text
    const listenerId = animatedValue.addListener(({ value: v }) => {
      displayValue.current = v;
      setDisplayText(formatValue(v, prefix, suffix, false, formatFn));
    });

    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, isHidden, prefix, suffix, duration]);

  return (
    <View style={styles.container}>
      <Text ref={textRef} style={[styles.text, style]} numberOfLines={1}>
        {displayText}
      </Text>
    </View>
  );
}

function formatValue(val, prefix, suffix, isHidden, formatFn) {
  if (isHidden) return `${prefix}••••••${suffix}`;
  if (formatFn) return formatFn(val);

  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  const formatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = num < 0 ? '-' : '';
  return `${sign}${prefix}${formatted}${suffix}`;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  text: {
    fontVariant: ['tabular-nums'],
  },
});
