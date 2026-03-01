import React, { useMemo } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SettingsProvider, useSettings } from '@app/context/SettingsContext';
import { createAppCommands } from '@app/commands/appCommands';
import {
  CommandRegistry,
  VoiceProvider,
  createExpoApiKeyResolver,
  type PipelineConfig,
} from 'react-native-voice';
import { VoiceButton, VoiceBubble } from 'react-native-voice/ui';
import { WhisperSTTProvider, OpenAILLMProvider } from 'react-native-voice/providers/openai';
import { ExpoSpeechTTSProvider } from 'react-native-voice/providers/expo-speech';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const resolveApiKey = createExpoApiKeyResolver();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SettingsProvider>
      <RootLayoutInner />
    </SettingsProvider>
  );
}

function RootLayoutInner() {
  const settings = useSettings();

  const registry = useMemo(() => {
    const reg = new CommandRegistry();
    reg.registerAll(createAppCommands(settings));
    return reg;
  }, [settings]);

  const config = useMemo<PipelineConfig>(
    () => ({
      sttProvider: new WhisperSTTProvider(resolveApiKey),
      llmProvider: new OpenAILLMProvider(resolveApiKey),
      ttsProvider: new ExpoSpeechTTSProvider(),
      ttsEnabled: true,
    }),
    [],
  );

  return (
    <VoiceProvider config={config} registry={registry}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <VoiceBubble
        backgroundColor={settings.colors.surface}
        textColor={settings.colors.text}
        accentColor={settings.colors.primary}
      />
      <VoiceButton
        color={settings.colors.primary}
        activeColor={settings.colors.danger}
      />
    </VoiceProvider>
  );
}
