// ─── Theme Palette Definitions ────────────────────────────────────────────
// Each theme defines a complete set of design tokens so the entire app
// can be re-skinned by switching a single ID.

const MIDNIGHT_OBSIDIAN = {
  id: 'midnight',
  label: 'Midnight Obsidian',
  // Base background & surfaces
  background: '#0D0F1D',
  surface: '#171A2E',
  surfaceLight: '#21253E',
  surfaceHighlight: '#2C3152',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',

  // Primary brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  // Semantic
  income: '#10B981',
  incomeBg: 'rgba(16, 185, 129, 0.12)',
  incomeBorder: 'rgba(16, 185, 129, 0.3)',

  expense: '#F43F5E',
  expenseBg: 'rgba(244, 63, 94, 0.12)',
  expenseBorder: 'rgba(244, 63, 94, 0.3)',

  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',

  info: '#06B6D4',
  infoBg: 'rgba(6, 182, 212, 0.12)',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  divider: 'rgba(255, 255, 255, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.75)',
  cardShadow: '#000000',

  // Gradients
  cardGradient: ['#4F46E5', '#7C3AED', '#6366F1'],
  headerGradient: ['#0D0F1D', '#171A2E'],
  accentGradient: ['#6366F1', '#818CF8'],
};

const CYBERPUNK_NEON = {
  id: 'cyberpunk',
  label: 'Cyberpunk Neon',
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceLight: '#1A1A26',
  surfaceHighlight: '#242436',
  surfaceBorder: 'rgba(0, 255, 255, 0.08)',

  primary: '#00FFFF',
  primaryLight: '#67FFFF',
  primaryDark: '#00CCCC',
  primaryGlow: 'rgba(0, 255, 255, 0.2)',

  income: '#00FF88',
  incomeBg: 'rgba(0, 255, 136, 0.1)',
  incomeBorder: 'rgba(0, 255, 136, 0.3)',

  expense: '#FF0066',
  expenseBg: 'rgba(255, 0, 102, 0.1)',
  expenseBorder: 'rgba(255, 0, 102, 0.3)',

  warning: '#FFD600',
  warningBg: 'rgba(255, 214, 0, 0.1)',
  warningBorder: 'rgba(255, 214, 0, 0.3)',

  info: '#BF00FF',
  infoBg: 'rgba(191, 0, 255, 0.1)',

  textPrimary: '#EAEAFF',
  textSecondary: '#8888AA',
  textMuted: '#555577',
  textInverse: '#0A0A0F',

  white: '#FFFFFF',
  black: '#000000',
  divider: 'rgba(0, 255, 255, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.8)',
  cardShadow: '#000000',

  cardGradient: ['#00CCCC', '#BF00FF', '#FF0066'],
  headerGradient: ['#0A0A0F', '#12121A'],
  accentGradient: ['#00FFFF', '#BF00FF'],
};

const NORDIC_MINIMAL = {
  id: 'nordic',
  label: 'Nordic Minimal',
  background: '#F5F5F0',
  surface: '#FFFFFF',
  surfaceLight: '#EEEEE8',
  surfaceHighlight: '#E0E0D8',
  surfaceBorder: 'rgba(0, 0, 0, 0.08)',

  primary: '#2D3436',
  primaryLight: '#636E72',
  primaryDark: '#1E2527',
  primaryGlow: 'rgba(45, 52, 54, 0.12)',

  income: '#00B894',
  incomeBg: 'rgba(0, 184, 148, 0.08)',
  incomeBorder: 'rgba(0, 184, 148, 0.25)',

  expense: '#E17055',
  expenseBg: 'rgba(225, 112, 85, 0.08)',
  expenseBorder: 'rgba(225, 112, 85, 0.25)',

  warning: '#FDCB6E',
  warningBg: 'rgba(253, 203, 110, 0.1)',
  warningBorder: 'rgba(253, 203, 110, 0.3)',

  info: '#74B9FF',
  infoBg: 'rgba(116, 185, 255, 0.08)',

  textPrimary: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  textInverse: '#FFFFFF',

  white: '#FFFFFF',
  black: '#000000',
  divider: 'rgba(0, 0, 0, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  cardShadow: 'rgba(0,0,0,0.08)',

  cardGradient: ['#2D3436', '#636E72', '#74B9FF'],
  headerGradient: ['#F5F5F0', '#FFFFFF'],
  accentGradient: ['#2D3436', '#636E72'],
};

const FOREST_EMERALD = {
  id: 'forest',
  label: 'Forest Emerald',
  background: '#0B1A14',
  surface: '#122A1F',
  surfaceLight: '#1A3A2A',
  surfaceHighlight: '#244D38',
  surfaceBorder: 'rgba(16, 185, 129, 0.1)',

  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primaryGlow: 'rgba(16, 185, 129, 0.25)',

  income: '#34D399',
  incomeBg: 'rgba(52, 211, 153, 0.12)',
  incomeBorder: 'rgba(52, 211, 153, 0.3)',

  expense: '#FB7185',
  expenseBg: 'rgba(251, 113, 133, 0.12)',
  expenseBorder: 'rgba(251, 113, 133, 0.3)',

  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.12)',
  warningBorder: 'rgba(251, 191, 36, 0.3)',

  info: '#67E8F9',
  infoBg: 'rgba(103, 232, 249, 0.12)',

  textPrimary: '#ECFDF5',
  textSecondary: '#A7F3D0',
  textMuted: '#6EE7B7',
  textInverse: '#0B1A14',

  white: '#FFFFFF',
  black: '#000000',
  divider: 'rgba(16, 185, 129, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardShadow: '#000000',

  cardGradient: ['#059669', '#10B981', '#34D399'],
  headerGradient: ['#0B1A14', '#122A1F'],
  accentGradient: ['#10B981', '#34D399'],
};

// ─── Exports ──────────────────────────────────────────────────────────────

export const THEMES = {
  midnight: MIDNIGHT_OBSIDIAN,
  cyberpunk: CYBERPUNK_NEON,
  nordic: NORDIC_MINIMAL,
  forest: FOREST_EMERALD,
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(themeId) {
  return THEMES[themeId] || MIDNIGHT_OBSIDIAN;
}

// Backward-compatible default — will be overridden by ThemeContext at runtime
export let COLORS = { ...MIDNIGHT_OBSIDIAN };
export let SHADOWS = buildShadows(MIDNIGHT_OBSIDIAN);

export function buildShadows(theme) {
  return {
    sm: {
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: theme.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
  };
}

// Helper: check if a theme is light-mode
export function isLightTheme(themeId) {
  return themeId === 'nordic';
}

// Accent color presets for the accent color picker
export const ACCENT_PRESETS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F59E0B', '#10B981', '#06B6D4', '#3B82F6',
  '#14B8A6', '#F97316', '#EF4444', '#84CC16',
];
