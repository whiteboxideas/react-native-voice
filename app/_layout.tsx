import React, { useMemo } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SettingsProvider, useSettings } from '@app/context/SettingsContext';
import { createAppCommands } from '@app/commands/appCommands';
import { CommandRegistry } from '@voice-ux/core/CommandRegistry';
import { VoiceProvider } from '@voice-ux/components/VoiceProvider';
import { VoiceButton } from '@voice-ux/components/VoiceButton';
import { VoiceBubble } from '@voice-ux/components/VoiceBubble';
import { WhisperSTTProvider } from '@voice-ux/providers/stt/WhisperSTTProvider';
import { OpenAILLMProvider } from '@voice-ux/providers/llm/OpenAILLMProvider';
import { ExpoSpeechTTSProvider } from '@voice-ux/providers/tts/ExpoSpeechTTSProvider';
import type { PipelineConfig } from '@voice-ux/types/pipeline';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

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
      sttProvider: new WhisperSTTProvider(),
      llmProvider: new OpenAILLMProvider(),
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
