import React from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { SettingsProvider, useSettings } from '@app/context/SettingsContext';
import { createAppCommands } from '@app/commands/appCommands';
import { createExpoApiKeyResolver } from 'react-native-voice';
import { VoiceProvider, VoiceUI } from 'react-native-voice/ui';
import { openai } from 'react-native-voice/providers/openai';
import { expoSpeech } from 'react-native-voice/providers/expo-speech';

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

  return (
    <VoiceProvider
      commands={createAppCommands(settings)}
      stt={openai.whisper(resolveApiKey)}
      llm={openai.chatgpt(resolveApiKey)}
      tts={expoSpeech()}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <VoiceUI
        theme={{
          primary: settings.colors.primary,
          surface: settings.colors.surface,
          text: settings.colors.text,
          danger: settings.colors.danger,
        }}
      />
    </VoiceProvider>
  );
}
