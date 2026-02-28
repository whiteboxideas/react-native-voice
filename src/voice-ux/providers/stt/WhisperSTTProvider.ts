import { File } from 'expo-file-system';
import type { STTProvider } from '../../types/providers';
import { getApiKey } from '../../utils/apiKeyManager';

export class WhisperSTTProvider implements STTProvider {
  async transcribe(audioUri: string): Promise<string> {
    const apiKey = await getApiKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Add it in Settings.');
    }

    const file = new File(audioUri);
    if (!file.exists) {
      throw new Error('Audio file not found.');
    }

    // RN's FormData requires { uri, type, name } — Blob/File objects don't carry MIME type
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Whisper API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.text ?? '';
  }
}
