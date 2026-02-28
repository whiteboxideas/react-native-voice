import { useState, useCallback } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';
import type { RecordingState, AudioRecordingResult } from '../types/audio';

export function useAudioRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setState('requesting_permission');

      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied.');
        setState('idle');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setState('recording');
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    if (!recorderState.isRecording) return null;

    try {
      setState('stopping');
      await recorder.stop();

      await setAudioModeAsync({
        allowsRecording: false,
      });

      const uri = recorder.uri;
      setState('idle');

      // DEBUG: check recording file size
      if (uri) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          console.log('[AudioRecording] file size:', blob.size, 'bytes, uri:', uri);
          console.log('[AudioRecording] duration:', recorderState.durationMillis, 'ms');
        } catch (e) {
          console.log('[AudioRecording] could not read file:', e);
        }
      }

      if (!uri) {
        setError('No recording URI available.');
        return null;
      }

      return {
        uri,
        durationMs: recorderState.durationMillis ?? 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      setState('idle');
      return null;
    }
  }, [recorder, recorderState]);

  return {
    recordingState: state,
    isRecording: state === 'recording',
    error,
    startRecording,
    stopRecording,
  };
}
