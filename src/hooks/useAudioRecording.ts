import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { useCallback, useRef, useState } from 'react';
import type { AudioRecordingResult, RecordingState } from '../types/audio';

const log = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__)  console.log(...args);
};

export function useAudioRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recordingStartedAt = useRef<number | null>(null);
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      log('[useAudioRecording] startRecording — requesting permission');
      setError(null);
      setState('requesting_permission');

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      log('[useAudioRecording] permission granted:', permission.granted);
      if (!permission.granted) {
        setError('Microphone permission denied.');
        setState('idle');
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setState('recording');
      await recorder.prepareToRecordAsync();
      recorder.record();
      recordingStartedAt.current = Date.now();
      log('[useAudioRecording] recording started');
    } catch (err) {
      log('[useAudioRecording] startRecording error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    log('[useAudioRecording] stopRecording — recorder id:', recorder.id);
    if (state !== 'recording') return null;

    try {
      setState('stopping');
      recorder.stop();
      const durationMs = recordingStartedAt.current ? Date.now() - recordingStartedAt.current : 0;
      recordingStartedAt.current = null;
      log('[useAudioRecording] stopped — durationMs (wall clock):', durationMs);

      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
      });

      const uri = recorder.uri;
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
  }, [recorder, state]);

  return {
    recordingState: state,
    isRecording: state === 'recording',
    error,
    startRecording,
    stopRecording,
  };
}
