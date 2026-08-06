import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const FloatingPlayerContext = createContext(null);

/**
 * FloatingPlayerProvider — global media playback state.
 * Controls music, podcasts, voice spaces, campus radio, recorded lectures, audiobooks, voice notes, live rooms.
 *
 * Track shape: { id, title, artist, artwork_url, audio_url, duration, type, source }
 * type: "music" | "podcast" | "radio" | "lecture" | "audiobook" | "voice_note" | "live"
 */
export function FloatingPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [mode, setMode] = useState("hidden"); // "hidden" | "mini" | "expanded"
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // "off" | "one" | "all"
  const audioRef = useRef(new Audio());

  // Sync audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentTrack?.audio_url) return;

    if (audio.src !== currentTrack.audio_url) {
      audio.src = currentTrack.audio_url;
      audio.playbackRate = playbackRate;
      audio.volume = volume;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  // Position tracking
  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setPosition(audio.currentTime);
    const onDur = () => setDuration(audio.duration || currentTrack?.duration || 0);
    const onEnd = () => handleNext();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [currentTrack, queue, queueIndex, shuffle, repeat]);

  const playTrack = useCallback((track, newQueue) => {
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex((t) => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    }
    setCurrentTrack(track);
    setMode("mini");
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio.src) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    audio.currentTime = time;
    setPosition(time);
  }, []);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeat === "one") {
      seek(0);
      audioRef.current.play().catch(() => {});
      return;
    }
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeat === "all") nextIdx = 0;
        else {
          setIsPlaying(false);
          return;
        }
      }
    }
    setQueueIndex(nextIdx);
    setCurrentTrack(queue[nextIdx]);
  }, [queue, queueIndex, shuffle, repeat, seek]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    if (position > 3) {
      seek(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = repeat === "all" ? queue.length - 1 : 0;
    setQueueIndex(prevIdx);
    setCurrentTrack(queue[prevIdx]);
  }, [queue, queueIndex, repeat, position, seek]);

  const setVolumeVal = useCallback((v) => {
    setVolume(v);
    audioRef.current.volume = v;
  }, []);

  const setPlaybackRateVal = useCallback((r) => {
    setPlaybackRate(r);
    audioRef.current.playbackRate = r;
  }, []);

  const expand = useCallback(() => setMode("expanded"), []);
  const collapse = useCallback(() => setMode("mini"), []);
  const hide = useCallback(() => {
    setIsPlaying(false);
    audioRef.current.pause();
    setMode("hidden");
  }, []);

  const value = {
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    position,
    duration: duration || currentTrack?.duration || 0,
    volume,
    playbackRate,
    mode,
    shuffle,
    repeat,
    playTrack,
    togglePlay,
    next: handleNext,
    prev: handlePrev,
    seek,
    setVolume: setVolumeVal,
    setPlaybackRate: setPlaybackRateVal,
    setShuffle,
    setRepeat,
    expand,
    collapse,
    hide,
  };

  return <FloatingPlayerContext.Provider value={value}>{children}</FloatingPlayerContext.Provider>;
}

export function useFloatingPlayer() {
  const ctx = useContext(FloatingPlayerContext);
  if (!ctx) return null;
  return ctx;
}