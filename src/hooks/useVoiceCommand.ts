import { useState, useCallback, useRef } from 'react';
import type { PipelineConfig, PipelineResult, PipelineStage } from '../types/pipeline';
import type { CommandRegistry } from '../core/CommandRegistry';
import { PipelineOrchestrator } from '../core/PipelineOrchestrator';
import { useAudioRecording } from './useAudioRecording';

const log = (...args: unknown[]) => {
  if (typeof __DEV__ !== 'undefined' && __DEV__) console.log(...args);
};

interface UseVoiceCommandOptions {
  config: PipelineConfig;
  registry: CommandRegistry;
}

export function useVoiceCommand({ config, registry }: UseVoiceCommandOptions) {
  const { isRecording, startRecording, stopRecording, error: recordingError } = useAudioRecording();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<PipelineStage>('idle');
  const [lastResult, setLastResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const orchestratorRef = useRef<PipelineOrchestrator | null>(null);

  if (!orchestratorRef.current) {
    orchestratorRef.current = new PipelineOrchestrator(config, registry);
  }

  const processRecording = useCallback(async (uri: string) => {
    log('[useVoiceCommand] processRecording — uri:', uri);
    setIsProcessing(true);
    try {
      orchestratorRef.current!.updateConfig(config);
      const pipelineResult = await orchestratorRef.current!.process(
        uri,
        (newStage, detail) => {
          log('[useVoiceCommand] pipeline stage:', newStage, detail ?? '');
          setStage(newStage);
          if (newStage === 'error' && detail) setError(detail);
        },
      );
      log('[useVoiceCommand] pipeline result:', pipelineResult);
      setLastResult(pipelineResult);
      if (!pipelineResult.success && pipelineResult.error) {
        setError(pipelineResult.error);
        // Keep recordingUri on error so user can replay
      } else {
        setRecordingUri(null);
      }
    } catch (err) {
      log('[useVoiceCommand] pipeline threw:', err);
      setError(err instanceof Error ? err.message : 'Pipeline error');
      setStage('error');
      // Keep recordingUri on error so user can replay
    } finally {
      setIsProcessing(false);
    }
  }, [config]);

  const startListening = useCallback(async () => {
    log('[useVoiceCommand] startListening');
    setError(null);
    setLastResult(null);
    setRecordingUri(null);
    setStage('recording');
    await startRecording();
    log('[useVoiceCommand] startRecording done');
  }, [startRecording]);

  const stopListening = useCallback(async () => {
    log('[useVoiceCommand] stopListening — calling stopRecording...');
    const result = await stopRecording();
    log('[useVoiceCommand] stopRecording result:', result);
    if (!result) {
      log('[useVoiceCommand] no result — aborting');
      setStage('idle');
      setError('No recording captured.');
      return;
    }

    log('[useVoiceCommand] durationMs:', result.durationMs);
    if (result.durationMs < 500) {
      log('[useVoiceCommand] too short — discarding');
      setStage('idle');
      return;
    }

    setRecordingUri(result.uri);
    await processRecording(result.uri);
  }, [stopRecording, processRecording]);

  const dismiss = useCallback(() => {
    setStage('idle');
    setError(null);
    setLastResult(null);
    setRecordingUri(null);
  }, []);

  return {
    startListening,
    stopListening,
    dismiss,
    recordingUri,
    isListening: isRecording,
    isProcessing,
    stage,
    lastResult,
    error: error || recordingError,
  };
}
