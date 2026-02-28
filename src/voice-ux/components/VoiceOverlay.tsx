import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useVoice } from './VoiceProvider';

interface VoiceOverlayProps {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

const STAGE_LABELS: Record<string, string> = {
  idle: '',
  recording: 'Listening...',
  transcribing: 'Transcribing...',
  understanding: 'Understanding...',
  executing: 'Executing...',
  speaking: 'Speaking...',
  done: 'Done!',
  error: 'Error',
};

export function VoiceOverlay({
  backgroundColor = '#1E1E1E',
  textColor = '#F0F0F0',
  accentColor = '#6AB0FF',
}: VoiceOverlayProps) {
  const { stage, lastResult, error, isListening, isProcessing } = useVoice();

  const visible = stage !== 'idle';
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 300, { duration: 250 });
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible && !lastResult) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor }]}>
      {/* Stage indicator */}
      <View style={styles.stageRow}>
        {(isListening || isProcessing) && (
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
        )}
        <Text style={[styles.stageText, { color: accentColor }]}>
          {STAGE_LABELS[stage] || ''}
        </Text>
      </View>

      {/* Transcript */}
      {lastResult?.transcript ? (
        <View style={styles.section}>
          <Text style={[styles.label, { color: textColor, opacity: 0.6 }]}>You said:</Text>
          <Text style={[styles.transcript, { color: textColor }]}>
            "{lastResult.transcript}"
          </Text>
        </View>
      ) : null}

      {/* Command results */}
      {lastResult?.commandResults?.map((r, i) => (
        <Text
          key={i}
          style={[styles.resultText, { color: r.success ? '#66BB6A' : '#EF5350' }]}
        >
          {r.message}
        </Text>
      ))}

      {/* Error */}
      {error && (
        <Text style={[styles.resultText, { color: '#EF5350' }]}>{error}</Text>
      )}

      {/* Dismiss */}
      {stage === 'done' || stage === 'error' ? (
        <Pressable style={styles.dismiss} onPress={() => {}}>
          <Text style={[styles.dismissText, { color: textColor, opacity: 0.5 }]}>
            Tap mic to try again
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  transcript: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    marginTop: 4,
  },
  dismiss: {
    marginTop: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 13,
  },
});
