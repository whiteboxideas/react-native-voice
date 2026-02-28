import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PipelineConfig, PipelineResult, PipelineStage } from '../types/pipeline';
import { CommandRegistry } from '../core/CommandRegistry';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

interface VoiceContextValue {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  confirmRecording: () => Promise<void>;
  reRecord: () => Promise<void>;
  recordingUri: string | null;
  isListening: boolean;
  isProcessing: boolean;
  stage: PipelineStage;
  lastResult: PipelineResult | null;
  error: string | null;
  registry: CommandRegistry;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

interface VoiceProviderProps {
  children: ReactNode;
  config: PipelineConfig;
  registry: CommandRegistry;
}

export function VoiceProvider({ children, config, registry }: VoiceProviderProps) {
  const voice = useVoiceCommand({ config, registry });

  const value = useMemo<VoiceContextValue>(
    () => ({ ...voice, registry }),
    [voice, registry],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within VoiceProvider');
  return ctx;
}
