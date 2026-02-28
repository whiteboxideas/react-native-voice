import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useVoice } from './VoiceProvider';
import { useAudioPlayback } from '../hooks/useAudioPlayback';

interface VoiceOverlayProps {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

const STAGE_LABELS: Record<string, string> = {
  idle: '',
  recording: 'Listening...',
  reviewing: 'Review recording',
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

export function VoiceOverlay({
  backgroundColor = '#1E1E1E',
  textColor = '#F0F0F0',
  accentColor = '#6AB0FF',
}: VoiceOverlayProps) {
  const { stage, lastResult, error, isListening, isProcessing, recordingUri, confirmRecording, reRecord } = useVoice();
  const playback = useAudioPlayback(stage === 'reviewing' ? recordingUri : null);

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

      {/* Review playback controls */}
      {stage === 'reviewing' && (
        <View style={styles.reviewSection}>
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
          <View style={styles.reviewButtons}>
            <Pressable
              style={[styles.reviewBtn, { borderColor: textColor, borderWidth: 1 }]}
              onPress={reRecord}
            >
              <Text style={[styles.reviewBtnText, { color: textColor }]}>Re-record</Text>
            </Pressable>
            <Pressable
              style={[styles.reviewBtn, { backgroundColor: accentColor }]}
              onPress={confirmRecording}
            >
              <Text style={[styles.reviewBtnText, { color: '#fff' }]}>Send</Text>
            </Pressable>
          </View>
        </View>
      )}

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
  reviewSection: {
    marginBottom: 12,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playPauseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 14,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 14,
    borderRadius: 1,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  reviewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
