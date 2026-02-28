export interface STTProvider {
  transcribe(audioUri: string): Promise<string>;
}

export interface LLMProvider {
  complete(systemPrompt: string, userMessage: string): Promise<string>;
}

export interface TTSProvider {
  speak(text: string): Promise<void>;
  stop(): void;
}
