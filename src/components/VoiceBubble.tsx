import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useVoice } from './VoiceProvider';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

interface VoiceBubbleProps {
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

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export function VoiceBubble({
  backgroundColor = '#1E1E1E',
  textColor = '#F0F0F0',
  accentColor = '#6AB0FF',
}: VoiceBubbleProps) {
  const { stage, lastResult, error, isListening, isProcessing, recordingUri, dismiss, startListening } = useVoice();
  const playback = useAudioPlayback(stage === 'error' ? recordingUri : null);

  const visible = stage !== 'idle';
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss 10s after reaching 'done'
  useEffect(() => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }
    if (stage === 'done') {
      autoDismissTimer.current = setTimeout(dismiss, 3_000);
    }
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [stage, dismiss]);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 18, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.3, { duration: 150 });
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  const handleReRecord = async () => {
    await startListening();
  };

  return (
    <>
      {/* Backdrop — tapping outside dismisses */}
      <Pressable style={styles.backdrop} onPress={dismiss} />

      {/* Bubble */}
      <Animated.View
        style={[
          styles.bubble,
          animatedStyle,
          { backgroundColor },
        ]}
      >
        {/* Tail pointing toward mic button */}
        <View style={[styles.tail, { borderTopColor: backgroundColor }]} />

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
              &ldquo;{lastResult.transcript}&rdquo;
            </Text>
          </View>
        ) : null}

        {/* Command results */}
        {lastResult?.commandResults?.map((r, i) => (
          <Text
            key={i}
            selectable={!r.success}
            style={[styles.resultText, { color: r.success ? '#66BB6A' : '#EF5350' }]}
          >
            {r.message}
          </Text>
        ))}

        {/* Error */}
        {error && (
          <Text selectable style={[styles.resultText, { color: '#EF5350' }]}>{error}</Text>
        )}

        {/* Playback controls — only on error when recording is available */}
        {stage === 'error' && recordingUri && (
          <View style={styles.errorActions}>
            <View style={styles.playbackRow}>
              <Pressable
                style={[styles.playPauseBtn, { borderColor: accentColor }]}
                onPress={() => (playback.isPlaying ? playback.pause() : playback.play())}
              >
                {playback.isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View style={[styles.pauseBar, { backgroundColor: accentColor }]} />
                    <View style={[styles.pauseBar, { backgroundColor: accentColor }]} />
                  </View>
                ) : (
                  <View style={[styles.playIcon, { borderLeftColor: accentColor }]} />
                )}
              </Pressable>
              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: textColor, opacity: 0.2 }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: accentColor,
                        width: playback.duration > 0
                          ? `${(playback.currentTime / playback.duration) * 100}%`
                          : '0%',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.timeText, { color: textColor, opacity: 0.6 }]}>
                  {formatTime(playback.currentTime)} / {formatTime(playback.duration)}
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.reRecordBtn, { borderColor: textColor }]}
              onPress={handleReRecord}
            >
              <Text style={[styles.reRecordBtnText, { color: textColor }]}>Re-record</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </>
  );
}

const BUBBLE_RIGHT = 20;
const BUBBLE_BOTTOM = 160;

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  bubble: {
    position: 'absolute',
    bottom: BUBBLE_BOTTOM,
    right: BUBBLE_RIGHT,
    minWidth: 200,
    maxWidth: 300,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1001,
    transformOrigin: 'bottom right',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    right: 24,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    marginBottom: 2,
  },
  transcript: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 13,
    marginTop: 4,
  },
  errorActions: {
    marginTop: 10,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playPauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 11,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 3,
  },
  pauseBar: {
    width: 3,
    height: 12,
    borderRadius: 1,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 10,
    marginTop: 3,
  },
  reRecordBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  reRecordBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
