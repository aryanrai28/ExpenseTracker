import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { hapticFeedback } from './haptics';

let subscription = null;
let lastShakeTimestamp = 0;
const SHAKE_THRESHOLD = 1.75;
const SHAKE_COOLDOWN_MS = 900;

/**
 * Start listening for physical phone shake events.
 *
 * @param {Function} onShake - Callback triggered when phone is shaken
 * @returns {Function} unsubscribe - Call to cleanup listener
 */
export function startShakeDetection(onShake) {
  if (Platform.OS === 'web') {
    // Accelerometer often restricted on web browser without user gesture
    return () => {};
  }

  try {
    Accelerometer.setUpdateInterval(120);

    subscription = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      if (now - lastShakeTimestamp < SHAKE_COOLDOWN_MS) {
        return;
      }

      // Total G-force magnitude
      const totalAcc = Math.sqrt(x * x + y * y + z * z);

      if (totalAcc > SHAKE_THRESHOLD) {
        lastShakeTimestamp = now;
        hapticFeedback.heavy();
        onShake?.();
      }
    });

    return () => {
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    };
  } catch (err) {
    console.warn('Shake detection unavailable:', err.message);
    return () => {};
  }
}
