import type { LLMProvider } from '../../types/providers';
import { getApiKey } from '../../utils/apiKeyManager';

export class AnthropicLLMProvider implements LLMProvider {
  private model: string;

  constructor(model = 'claude-sonnet-4-6') {
    this.model = model;
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const apiKey = await getApiKey('anthropic');
    if (!apiKey) {
      throw new Error('Anthropic API key not configured. Add it in Settings.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text');
    return textBlock?.text ?? '';
  }
}
