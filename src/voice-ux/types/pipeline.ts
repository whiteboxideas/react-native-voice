import type { STTProvider, LLMProvider, TTSProvider } from './providers';
import type { CommandResult } from './commands';

export interface LLMAction {
  command: string;
  params: Record<string, unknown>;
}

export interface LLMResponse {
  actions: LLMAction[];
  message?: string;
}

export type PipelineStage = 'idle' | 'recording' | 'reviewing' | 'transcribing' | 'understanding' | 'executing' | 'speaking' | 'done' | 'error';

export interface PipelineConfig {
  sttProvider: STTProvider;
  llmProvider: LLMProvider;
  ttsProvider?: TTSProvider;
  ttsEnabled?: boolean;
}

export interface PipelineResult {
  success: boolean;
  transcript: string;
  actions: LLMAction[];
  commandResults: CommandResult[];
  error?: string;
  durationMs: number;
}

export type PipelineStageListener = (stage: PipelineStage, detail?: string) => void;
