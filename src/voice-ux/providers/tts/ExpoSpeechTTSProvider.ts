import * as Speech from 'expo-speech';
import type { TTSProvider } from '../../types/providers';

export class ExpoSpeechTTSProvider implements TTSProvider {
  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        rate: 1.0,
        pitch: 1.0,
        onDone: resolve,
        onError: (error) => reject(new Error(`TTS error: ${error.message}`)),
      });
    });
  }

  stop(): void {
    Speech.stop();
  }
}
