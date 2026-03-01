import type { ApiKeyResolver } from '../types/providers';

declare const process: { env: Record<string, string | undefined> };

const API_KEY_PREFIX = 'voice_ux_api_key_';

const ENV_KEYS: Record<string, string> = {
  openai: 'EXPO_PUBLIC_OPENAI_API_KEY',
  anthropic: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
};

/**
 * Creates an `ApiKeyResolver` backed by expo-secure-store (user-provided keys)
 * with a fallback to EXPO_PUBLIC_* environment variables.
 *
 * Dependencies (expo-secure-store, expo-constants) are dynamically imported
 * so the library doesn't hard-require them at the top level.
 */
export function createExpoApiKeyResolver(): ApiKeyResolver {
  return async (provider: string): Promise<string | null> => {
    // 1. Check SecureStore first (user-provided)
    try {
      const SecureStore = await import('expo-secure-store');
      const stored = await SecureStore.getItemAsync(`${API_KEY_PREFIX}${provider}`);
      if (stored && stored.trim()) return stored.trim();
    } catch {}

    // 2. Fall back to environment variable
    try {
      const Constants = (await import('expo-constants')).default;
      const envKey = ENV_KEYS[provider];
      if (envKey) {
        const envValue = (Constants.expoConfig?.extra?.[envKey] as string) ??
          (process.env[envKey] as string | undefined);
        if (envValue && envValue.trim()) return envValue.trim();
      }
    } catch {}

    return null;
  };
}
