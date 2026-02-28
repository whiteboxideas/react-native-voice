import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import type { RecordingState, AudioRecordingResult } from '../types/audio';

export function useAudioRecording() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setState('requesting_permission');

      const permission = await Audio.requestPermissionsAsync();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;

    try {
      setState('stopping');
      const status = await recording.stopAndUnloadAsync();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setState('idle');

      if (!uri) {
        setError('No recording URI available.');
        return null;
      }

      return {
        uri,
        durationMs: status.durationMillis ?? 0,
      };
    } catch (err) {
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
