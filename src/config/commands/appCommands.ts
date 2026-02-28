import type { CommandDefinition } from '@voice-ux/types/commands';
import type { FontSizeKey } from '@app/theme/typography';
import { FontSizeOptions } from '@app/theme/typography';
import { router } from 'expo-router';

interface SettingsActions {
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: FontSizeKey) => void;
  theme: string;
  fontSize: string;
}

export function createAppCommands(settings: SettingsActions): CommandDefinition[] {
  return [
    {
      name: 'toggle_dark_mode',
      description: 'Toggle between dark and light mode',
      category: 'theme',
      handler: () => {
        settings.toggleTheme();
        return { success: true, message: `Switched to ${settings.theme === 'dark' ? 'light' : 'dark'} mode.` };
      },
    },
    {
      name: 'set_theme',
      description: 'Set the app theme to a specific mode',
      category: 'theme',
      parameters: [
        { name: 'theme', type: 'string', description: 'The theme to set', required: true, enum: ['light', 'dark'] },
      ],
      handler: (params) => {
        const theme = params.theme as 'light' | 'dark';
        settings.setTheme(theme);
        return { success: true, message: `Theme set to ${theme} mode.` };
      },
    },
    {
      name: 'set_font_size',
      description: 'Set the font size to a specific level',
      category: 'accessibility',
      parameters: [
        { name: 'size', type: 'string', description: 'The font size level', required: true, enum: [...FontSizeOptions] },
      ],
      handler: (params) => {
        const size = params.size as FontSizeKey;
        if (!FontSizeOptions.includes(size)) {
          return { success: false, message: `Invalid font size. Options: ${FontSizeOptions.join(', ')}` };
        }
        settings.setFontSize(size);
        return { success: true, message: `Font size set to ${size}.` };
      },
    },
    {
      name: 'increase_font',
      description: 'Increase the font size by one level',
      category: 'accessibility',
      handler: () => {
        const currentIdx = FontSizeOptions.indexOf(settings.fontSize as FontSizeKey);
        if (currentIdx >= FontSizeOptions.length - 1) {
          return { success: false, message: 'Font size is already at maximum.' };
        }
        const next = FontSizeOptions[currentIdx + 1];
        settings.setFontSize(next);
        return { success: true, message: `Font size increased to ${next}.` };
      },
    },
    {
      name: 'decrease_font',
      description: 'Decrease the font size by one level',
      category: 'accessibility',
      handler: () => {
        const currentIdx = FontSizeOptions.indexOf(settings.fontSize as FontSizeKey);
        if (currentIdx <= 0) {
          return { success: false, message: 'Font size is already at minimum.' };
        }
        const next = FontSizeOptions[currentIdx - 1];
        settings.setFontSize(next);
        return { success: true, message: `Font size decreased to ${next}.` };
      },
    },
    {
      name: 'navigate_to',
      description: 'Navigate to a specific screen in the app',
      category: 'navigation',
      parameters: [
        { name: 'screen', type: 'string', description: 'Screen to navigate to', required: true, enum: ['home', 'settings', 'profile', 'about'] },
      ],
      handler: (params) => {
        const screen = params.screen as string;
        const routes: Record<string, string> = {
          home: '/(tabs)',
          settings: '/(tabs)/settings',
          profile: '/(tabs)/profile',
          about: '/(tabs)/about',
        };
        const route = routes[screen];
        if (!route) {
          return { success: false, message: `Unknown screen: ${screen}` };
        }
        router.push(route as any);
        return { success: true, message: `Navigated to ${screen}.` };
      },
    },
    {
      name: 'get_current_settings',
      description: 'Get the current app settings (theme and font size)',
      category: 'info',
      handler: () => {
        return {
          success: true,
          message: `Current settings: theme is ${settings.theme}, font size is ${settings.fontSize}.`,
          data: { theme: settings.theme, fontSize: settings.fontSize },
        };
      },
    },
  ];
}
