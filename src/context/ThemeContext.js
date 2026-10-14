import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, getTheme, buildShadows, ACCENT_PRESETS } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/storageKeys';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('midnight');
  const [accentColor, setAccentColor] = useState(null); // null = use theme default

  // Load persisted theme on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.themeId && THEMES[parsed.themeId]) {
            setThemeId(parsed.themeId);
          }
          if (parsed.accentColor) {
            setAccentColor(parsed.accentColor);
          }
        }
      } catch (e) {
        console.error('Failed to load theme:', e);
      }
    })();
  }, []);

  // Persist theme choice
  const persistTheme = useCallback(async (updates) => {
    try {
      const currentRaw = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      const merged = { ...current, ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(merged));
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  }, []);

  const selectTheme = useCallback((id) => {
    if (THEMES[id]) {
      setThemeId(id);
      setAccentColor(null); // reset accent when switching theme
      persistTheme({ themeId: id, accentColor: null });
    }
  }, [persistTheme]);

  const selectAccent = useCallback((color) => {
    setAccentColor(color);
    persistTheme({ accentColor: color });
  }, [persistTheme]);

  // Build the active color palette, overlaying accent if set
  const colors = useMemo(() => {
    const base = getTheme(themeId);
    if (accentColor) {
      return {
        ...base,
        primary: accentColor,
        primaryLight: accentColor + 'CC',
        primaryDark: accentColor,
        primaryGlow: accentColor + '40',
      };
    }
    return base;
  }, [themeId, accentColor]);

  const shadows = useMemo(() => buildShadows(colors), [colors]);

  const value = useMemo(() => ({
    themeId,
    colors,
    shadows,
    accentColor,
    selectTheme,
    selectAccent,
    isDark: themeId !== 'nordic',
  }), [themeId, colors, shadows, accentColor, selectTheme, selectAccent]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components rendered outside ThemeProvider
    const fallback = getTheme('midnight');
    return {
      themeId: 'midnight',
      colors: fallback,
      shadows: buildShadows(fallback),
      accentColor: null,
      selectTheme: () => {},
      selectAccent: () => {},
      isDark: true,
    };
  }
  return ctx;
}
