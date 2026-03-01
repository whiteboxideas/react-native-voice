import React, { useRef } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RecordingIndicator } from './RecordingIndicator';
import { useVoice } from './VoiceProvider';

const log = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.log(...args);
};

interface VoiceButtonProps {
  size?: number;
  color?: string;
  activeColor?: string;
  bottom?: number;
  right?: number;
}

export function VoiceButton({
  size = 60,
  color = '#4A90D9',
  activeColor = '#E53935',
  bottom = 90,
  right = 20,
}: VoiceButtonProps) {
  const { isListening, stage, startListening, stopListening } = useVoice();
  // Ref so onPressOut can call stopListening even if React state hasn't updated yet
  const recordingStarted = useRef(false);

  const canStart = stage === 'idle' || stage === 'done' || stage === 'error';

  const handlePressIn = async () => {
    log('[VoiceButton] onPressIn — stage:', stage, 'canStart:', canStart, 'isListening:', isListening);
    if (!canStart) {
      log('[VoiceButton] onPressIn ignored — cannot start in stage:', stage);
      return;
    }
    recordingStarted.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    log('[VoiceButton] calling startListening...');
    await startListening();
    log('[VoiceButton] startListening resolved');
  };

  const handlePressOut = async () => {
    log('[VoiceButton] onPressOut — stage:', stage, 'isListening:', isListening, 'recordingStarted.current:', recordingStarted.current);
    if (!recordingStarted.current) {
      log('[VoiceButton] onPressOut ignored — recording was never started');
      return;
    }
    recordingStarted.current = false;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    log('[VoiceButton] calling stopListening...');
    await stopListening();
    log('[VoiceButton] stopListening resolved');
  };

  const currentColor = isListening ? activeColor : color;
  const disabled = !canStart && stage !== 'recording';

  return (
    <View style={[styles.container, { bottom, right }]}>
      <RecordingIndicator isRecording={isListening} color={activeColor} size={size + 20} />
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: currentColor,
            opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          },
        ]}
      >
        <MicIcon size={size * 0.45} color="#FFFFFF" isActive={isListening} />
      </Pressable>
    </View>
  );
}

function MicIcon({ size, color, isActive }: { size: number; color: string; isActive: boolean }) {
  // Simple mic icon using View-based shapes
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.7,
          backgroundColor: isActive ? '#FFFFFF' : color,
          borderRadius: size * 0.22,
        }}
      />
      <View
        style={{
          width: size * 0.7,
          height: size * 0.35,
          borderWidth: 2,
          borderColor: isActive ? '#FFFFFF' : color,
          borderTopWidth: 0,
          borderBottomLeftRadius: size * 0.35,
          borderBottomRightRadius: size * 0.35,
          marginTop: -size * 0.1,
        }}
      />
      <View
        style={{
          width: 2,
          height: size * 0.2,
          backgroundColor: isActive ? '#FFFFFF' : color,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
