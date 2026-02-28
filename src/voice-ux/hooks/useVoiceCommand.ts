import { useState, useCallback, useRef } from 'react';
import type { PipelineConfig, PipelineResult, PipelineStage } from '../types/pipeline';
import type { CommandRegistry } from '../core/CommandRegistry';
import { PipelineOrchestrator } from '../core/PipelineOrchestrator';
import { useAudioRecording } from './useAudioRecording';

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

  const startListening = useCallback(async () => {
    setError(null);
    setLastResult(null);
    setStage('recording');
    await startRecording();
  }, [startRecording]);

  const stopListening = useCallback(async () => {
    const result = await stopRecording();
    if (!result) {
      setStage('idle');
      setError('No recording captured.');
      return;
    }

    setRecordingUri(result.uri);
    setStage('reviewing');
  }, [stopRecording]);

  const processRecording = useCallback(async (uri: string) => {
    setIsProcessing(true);
    try {
      orchestratorRef.current!.updateConfig(config);
      const pipelineResult = await orchestratorRef.current!.process(
        uri,
        (newStage, detail) => {
          setStage(newStage);
          if (newStage === 'error' && detail) setError(detail);
        },
      );
      setLastResult(pipelineResult);
      if (!pipelineResult.success && pipelineResult.error) {
        setError(pipelineResult.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pipeline error');
      setStage('error');
    } finally {
      setIsProcessing(false);
    }
  }, [config]);

  const confirmRecording = useCallback(async () => {
    if (!recordingUri) return;
    await processRecording(recordingUri);
    setRecordingUri(null);
  }, [recordingUri, processRecording]);

  const reRecord = useCallback(async () => {
    setRecordingUri(null);
    setError(null);
    setLastResult(null);
    setStage('recording');
    await startRecording();
  }, [startRecording]);

  return {
    startListening,
    stopListening,
    confirmRecording,
    reRecord,
    recordingUri,
    isListening: isRecording,
    isProcessing,
    stage,
    lastResult,
    error: error || recordingError,
  };
}
