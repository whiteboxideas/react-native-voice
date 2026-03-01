import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { LightColors, DarkColors, type ColorPalette } from '@app/theme/colors';
import { FontSizeScale, type FontSizeKey } from '@app/theme/typography';

type ThemeMode = 'light' | 'dark';

interface SettingsState {
  theme: ThemeMode;
  fontSize: FontSizeKey;
}

interface SettingsContextValue extends SettingsState {
  colors: ColorPalette;
  fontSizes: { body: number; heading: number; caption: number };
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSizeKey) => void;
  setApiKey: (provider: 'openai' | 'anthropic', key: string) => Promise<void>;
  getApiKey: (provider: 'openai' | 'anthropic') => Promise<string | null>;
  clearApiKey: (provider: 'openai' | 'anthropic') => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEY = 'voice_ux_settings';
const API_KEY_PREFIX = 'voice_ux_api_key_';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'light',
    fontSize: 'medium',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Partial<SettingsState>;
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const persist = useCallback((next: SettingsState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, theme: prev.theme === 'light' ? 'dark' as ThemeMode : 'light' as ThemeMode };
      persist(next);
      return next;
    });
  }, [persist]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      persist(next);
      return next;
    });
  }, [persist]);

  const setFontSize = useCallback((fontSize: FontSizeKey) => {
    setSettings((prev) => {
      const next = { ...prev, fontSize };
      persist(next);
      return next;
    });
  }, [persist]);

  const setApiKey = useCallback(async (provider: 'openai' | 'anthropic', key: string) => {
    await SecureStore.setItemAsync(`${API_KEY_PREFIX}${provider}`, key);
  }, []);

  const getApiKey = useCallback(async (provider: 'openai' | 'anthropic') => {
    return SecureStore.getItemAsync(`${API_KEY_PREFIX}${provider}`);
  }, []);

  const clearApiKey = useCallback(async (provider: 'openai' | 'anthropic') => {
    await SecureStore.deleteItemAsync(`${API_KEY_PREFIX}${provider}`);
  }, []);

  const value: SettingsContextValue = {
    ...settings,
    colors: settings.theme === 'dark' ? DarkColors : LightColors,
    fontSizes: FontSizeScale[settings.fontSize],
    toggleTheme,
    setTheme,
    setFontSize,
    setApiKey,
    getApiKey,
    clearApiKey,
    isLoaded,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
