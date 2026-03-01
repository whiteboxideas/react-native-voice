import { useCallback } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export function useAudioPlayback(uri: string | null) {
  const player = useAudioPlayer(uri ?? undefined);
  const status = useAudioPlayerStatus(player);

  const play = useCallback(() => {
    player.play();
  }, [player]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const seekTo = useCallback((seconds: number) => {
    player.seekTo(seconds);
  }, [player]);

  return {
    play,
    pause,
    seekTo,
    isPlaying: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    isLoaded: status.isLoaded,
  };
}
