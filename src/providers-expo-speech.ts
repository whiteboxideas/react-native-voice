export { ExpoSpeechTTSProvider } from './providers/tts/ExpoSpeechTTSProvider';

import { ExpoSpeechTTSProvider } from './providers/tts/ExpoSpeechTTSProvider';

/** Convenience factory for creating an Expo Speech TTS provider */
export const expoSpeech = () => new ExpoSpeechTTSProvider();
