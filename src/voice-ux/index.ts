// Types
export type { CommandDefinition, CommandParameter, CommandResult } from './types/commands';
export type { LLMAction, LLMResponse, PipelineStage, PipelineConfig, PipelineResult, PipelineStageListener } from './types/pipeline';
export type { STTProvider, LLMProvider, TTSProvider } from './types/providers';
export type { RecordingState, AudioRecordingConfig, AudioRecordingResult } from './types/audio';

// Core
export { CommandRegistry } from './core/CommandRegistry';
export { CommandExecutor } from './core/CommandExecutor';
export { PipelineOrchestrator } from './core/PipelineOrchestrator';
export { PromptBuilder } from './core/PromptBuilder';

// Providers
export { WhisperSTTProvider } from './providers/stt/WhisperSTTProvider';
export { OpenAILLMProvider } from './providers/llm/OpenAILLMProvider';
export { AnthropicLLMProvider } from './providers/llm/AnthropicLLMProvider';
export { ExpoSpeechTTSProvider } from './providers/tts/ExpoSpeechTTSProvider';

// Hooks
export { useAudioRecording } from './hooks/useAudioRecording';
export { useVoiceCommand } from './hooks/useVoiceCommand';

// Components
export { VoiceProvider, useVoice } from './components/VoiceProvider';
export { VoiceButton } from './components/VoiceButton';
export { RecordingIndicator } from './components/RecordingIndicator';
export { VoiceBubble } from './components/VoiceBubble';

// Utils
export { getApiKey, hasApiKey } from './utils/apiKeyManager';
