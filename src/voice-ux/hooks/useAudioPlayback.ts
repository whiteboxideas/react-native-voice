import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export function useAudioPlayback(uri: string | null) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (uri) {
      player.replace(uri);
    }
  }, [uri, player]);

  useEffect(() => {
    return () => {
      player.remove();
    };
  }, [player]);

  return {
    play: () => player.play(),
    pause: () => player.pause(),
    seekTo: (seconds: number) => player.seekTo(seconds),
    isPlaying: status.playing,
    currentTime: status.currentTime,
    duration: status.duration,
    isLoaded: status.isLoaded,
  };
}
