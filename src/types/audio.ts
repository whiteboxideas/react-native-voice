export type RecordingState = 'idle' | 'requesting_permission' | 'recording' | 'stopping';

export interface AudioRecordingConfig {
  sampleRate?: number;
  numberOfChannels?: number;
  bitRate?: number;
}

export interface AudioRecordingResult {
  uri: string;
  durationMs: number;
}
