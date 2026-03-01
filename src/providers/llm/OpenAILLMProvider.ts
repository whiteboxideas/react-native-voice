import type { ApiKeyResolver, LLMProvider } from '../../types/providers';

export class OpenAILLMProvider implements LLMProvider {
  private model: string;

  constructor(
    private resolveApiKey: ApiKeyResolver,
    model = 'gpt-4o-mini',
  ) {
    this.model = model;
  }

  async complete(systemPrompt: string, userMessage: string): Promise<string> {
    const apiKey = await this.resolveApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Add it in Settings.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }
}
