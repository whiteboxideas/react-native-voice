import { Audio } from 'expo-av';
import { useCallback, useRef, useState } from 'react';
import type { AudioRecordingResult, RecordingState } from '../types/audio';

const log = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__)  console.log(...args);
};

export function useAudioRecording() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartedAt = useRef<number | null>(null);
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      log('[useAudioRecording] startRecording — requesting permission');
      setError(null);
      setState('requesting_permission');

      const permission = await Audio.requestPermissionsAsync();
      log('[useAudioRecording] permission granted:', permission.granted);
      if (!permission.granted) {
        setError('Microphone permission denied.');
        setState('idle');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setState('recording');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      recordingStartedAt.current = Date.now();
      log('[useAudioRecording] recording started');
    } catch (err) {
      log('[useAudioRecording] startRecording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    const recording = recordingRef.current;
    log('[useAudioRecording] stopRecording — recording ref:', recording ? 'exists' : 'null');
    if (!recording) return null;

    try {
      setState('stopping');
      await recording.stopAndUnloadAsync();
      const durationMs = recordingStartedAt.current ? Date.now() - recordingStartedAt.current : 0;
      recordingStartedAt.current = null;
      log('[useAudioRecording] stopped — durationMs (wall clock):', durationMs);
      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      log('[useAudioRecording] uri:', uri);
      setState('idle');

      if (!uri) {
        setError('No recording URI available.');
        return null;
      }

      return {
        uri,
        durationMs,
      };
    } catch (err) {
      log('[useAudioRecording] stopRecording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      setState('idle');
      return null;
    }
  }, []);

  return {
    recordingState: state,
    isRecording: state === 'recording',
    error,
    startRecording,
    stopRecording,
  };
}
