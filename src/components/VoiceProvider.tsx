import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PipelineConfig, PipelineResult, PipelineStage, ConfirmationCallback } from '../types/pipeline';
import type { CommandDefinition } from '../types/commands';
import type { STTProvider, LLMProvider, TTSProvider } from '../types/providers';
import { CommandRegistry } from '../core/CommandRegistry';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

interface VoiceContextValue {
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  dismiss: () => void;
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
  /** Shorthand: pass an array of commands instead of a CommandRegistry */
  commands?: CommandDefinition[];
  /** Full CommandRegistry (backward compat). Ignored when `commands` is provided. */
  registry?: CommandRegistry;
  /** Full PipelineConfig (backward compat). Ignored when flat provider props are provided. */
  config?: PipelineConfig;
  /** Flat prop: STT provider instance */
  stt?: STTProvider;
  /** Flat prop: LLM provider instance */
  llm?: LLMProvider;
  /** Flat prop: TTS provider instance. Omit to disable TTS. */
  tts?: TTSProvider;
  /** Flat prop: enable/disable TTS (only used with flat props, defaults to true when `tts` is provided) */
  ttsEnabled?: boolean;
  /** Flat prop: confirmation callback */
  onConfirmation?: ConfirmationCallback;
}

export function VoiceProvider({
  children,
  commands,
  registry: registryProp,
  config: configProp,
  stt,
  llm,
  tts,
  ttsEnabled,
  onConfirmation,
}: VoiceProviderProps) {
  const registry = useMemo(() => {
    if (commands) {
      const reg = new CommandRegistry();
      reg.registerAll(commands);
      return reg;
    }
    return registryProp ?? new CommandRegistry();
  }, [commands, registryProp]);

  const config = useMemo<PipelineConfig>(() => {
    if (configProp) return configProp;
    if (!stt || !llm) {
      throw new Error(
        'VoiceProvider requires either a `config` prop or both `stt` and `llm` props.',
      );
    }
    return {
      sttProvider: stt,
      llmProvider: llm,
      ttsProvider: tts,
      ttsEnabled: ttsEnabled ?? !!tts,
      onConfirmation,
    };
  }, [configProp, stt, llm, tts, ttsEnabled, onConfirmation]);

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
