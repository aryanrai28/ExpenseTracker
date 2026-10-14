import { Platform } from 'react-native';
import { hapticFeedback } from './haptics';

let isSoundMuted = false;

export function setSoundMuted(muted) {
  isSoundMuted = muted;
}

export function getSoundMuted() {
  return isSoundMuted;
}

// ─── Web Audio API Procedural Synthesis Engine ─────────────────────────────
// Generates crystal-clear, zero-latency micro-sounds without needing asset files.
let audioCtx = null;

function getAudioContext() {
  if (Platform.OS !== 'web') return null;
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtx) {
        audioCtx = new AudioCtx();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }
  } catch (e) {
    // Web audio not permitted
  }
  return null;
}

/**
 * Play a high metallic coin clink on savings goal contribution.
 */
function playWebCoinClink() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Primary ping (1800Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1760, now);
  osc1.frequency.exponentialRampToValueAtTime(3520, now + 0.15);
  gain1.gain.setValueAtTime(0.12, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  // Harmonizing sparkle (2640Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(2640, now);
  gain2.gain.setValueAtTime(0.08, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.35);
  osc2.stop(now + 0.25);
}

/**
 * Play a joyful major triad chime on income or settled split.
 */
function playWebCashChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteTime = now + idx * 0.05;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gain.gain.setValueAtTime(0.1, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + 0.3);
  });
}

/**
 * Play a gentle swoop/whoosh on swipe actions.
 */
function playWebWhoosh() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.18);
}

/**
 * Play a crisp card slot click on inter-account transfer.
 */
function playWebCardSlot() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.08);
}

// ─── Public API ───────────────────────────────────────────────────────────

export const audioEffects = {
  coinClink: () => {
    hapticFeedback.success();
    if (!isSoundMuted) playWebCoinClink();
  },
  cashChime: () => {
    hapticFeedback.success();
    if (!isSoundMuted) playWebCashChime();
  },
  whoosh: () => {
    hapticFeedback.light();
    if (!isSoundMuted) playWebWhoosh();
  },
  cardSlot: () => {
    hapticFeedback.medium();
    if (!isSoundMuted) playWebCardSlot();
  },
};
