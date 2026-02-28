import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_KEY_PREFIX = 'voice_ux_api_key_';

type Provider = 'openai' | 'anthropic';

const ENV_KEYS: Record<Provider, string> = {
  openai: 'EXPO_PUBLIC_OPENAI_API_KEY',
  anthropic: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
};

export async function getApiKey(provider: Provider): Promise<string | null> {
  // 1. Check SecureStore first (user-provided)
  try {
    const stored = await SecureStore.getItemAsync(`${API_KEY_PREFIX}${provider}`);
    if (stored && stored.trim()) return stored.trim();
  } catch {}

  // 2. Fall back to environment variable
  const envKey = ENV_KEYS[provider];
  const envValue = (Constants.expoConfig?.extra?.[envKey] as string) ??
    (process.env[envKey] as string | undefined);
  if (envValue && envValue.trim()) return envValue.trim();

  return null;
}

export async function hasApiKey(provider: Provider): Promise<boolean> {
  const key = await getApiKey(provider);
  return key !== null;
}
