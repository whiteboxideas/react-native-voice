export { WhisperSTTProvider } from './providers/stt/WhisperSTTProvider';
export { OpenAILLMProvider } from './providers/llm/OpenAILLMProvider';

import type { ApiKeyResolver } from './types/providers';
import { WhisperSTTProvider } from './providers/stt/WhisperSTTProvider';
import { OpenAILLMProvider } from './providers/llm/OpenAILLMProvider';

/** Convenience namespace for creating OpenAI providers */
export const openai = {
  /** Create a Whisper STT provider */
  whisper: (resolver: ApiKeyResolver) => new WhisperSTTProvider(resolver),
  /** Create a ChatGPT LLM provider */
  chatgpt: (resolver: ApiKeyResolver, model?: string) => new OpenAILLMProvider(resolver, model),
};
