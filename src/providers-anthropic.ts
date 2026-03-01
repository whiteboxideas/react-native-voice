export { AnthropicLLMProvider } from './providers/llm/AnthropicLLMProvider';

import type { ApiKeyResolver } from './types/providers';
import { AnthropicLLMProvider } from './providers/llm/AnthropicLLMProvider';

/** Convenience namespace for creating Anthropic providers */
export const anthropic = {
  /** Create a Claude LLM provider */
  claude: (resolver: ApiKeyResolver, model?: string) => new AnthropicLLMProvider(resolver, model),
};
