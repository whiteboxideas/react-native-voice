import { useEffect, useRef, useState, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

export function useAudioPlayback(uri: string | null) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      setIsLoaded(false);
      return;
    }
    setIsLoaded(true);
    setIsPlaying(status.isPlaying);
    setCurrentTime((status.positionMillis ?? 0) / 1000);
    setDuration((status.durationMillis ?? 0) / 1000);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSound() {
      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!uri) {
        setIsLoaded(false);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );

      if (!mounted) {
        await sound.unloadAsync();
        return;
      }

      soundRef.current = sound;
    }

    loadSound();

    return () => {
      mounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [uri, onPlaybackStatusUpdate]);

  const play = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const seekTo = useCallback(async (seconds: number) => {
    await soundRef.current?.setPositionAsync(seconds * 1000);
  }, []);

  return {
    play,
    pause,
    seekTo,
    isPlaying,
    currentTime,
    duration,
    isLoaded,
  };
}
