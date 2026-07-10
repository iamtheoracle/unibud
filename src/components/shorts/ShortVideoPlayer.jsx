import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Volume2, VolumeX, Maximize, Settings,
  Captions, ExternalLink,
} from "lucide-react";
import { PLAYBACK_SPEEDS } from "./shortConstants";
import { usePlaybackProgress } from "@/hooks/usePlaybackProgress";

export default function ShortVideoPlayer({ video, isActive, onDoubleTap }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [currentCaption, setCurrentCaption] = useState(null);
  const { getProgress, saveProgress, clearProgress: _clearProgress } = usePlaybackProgress(video.id);

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Play/pause based on isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && !isPaused) {
      const saved = getProgress();
      if (saved && saved > 1 && (!video.duration || saved < video.duration - 2)) {
        video.currentTime = saved;
      }
      video.play().catch(() => {});
    } else {
      video.pause();
      if (isActive && video.currentTime > 0) {
        saveProgress(video.currentTime);
      }
    }
  }, [isActive, isPaused]);

  const handleTimeUpdate = useCallback((e) => {
    const video = e.target;
    if (video.duration) {
      setProgress(video.currentTime / video.duration);
      setDuration(video.duration);
      saveProgress(video.currentTime);

      if (showCaptions && video.captions) {
        const caption = video.captions.find(
          (c) => video.currentTime >= c.start_time && video.currentTime <= c.end_time
        );
        setCurrentCaption(caption || null);
      }
    }
  }, [showCaptions, saveProgress]);

  const tapTimeoutRef = useRef(null);

  const handleTap = useCallback(() => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
      onDoubleTap?.();
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setIsPaused((p) => !p);
        tapTimeoutRef.current = null;
      }, 280);
    }
  }, [onDoubleTap]);

  const handleSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const video = videoRef.current;
    if (video && video.duration) {
      video.currentTime = pct * video.duration;
      setProgress(pct);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const changeSpeed = useCallback((speed) => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, []);

  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current?.requestPictureInPicture) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {}
    setShowSettings(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current?.requestFullscreen();
      }
    } catch {}
    setShowSettings(false);
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black" role="region" aria-label="Video player">
      <video
        ref={videoRef}
        src={video.video_url}
        poster={video.thumbnail_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onClick={handleTap}
        aria-label={video.title}
      />

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captions */}
      {showCaptions && currentCaption && (
        <div className="absolute bottom-32 left-0 right-0 text-center px-6 pointer-events-none z-10">
          <span className="inline-block bg-black/80 text-white text-[14px] px-3 py-1.5 rounded-lg">
            {currentCaption.text}
          </span>
        </div>
      )}

      {/* Controls overlay (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        {/* Progress bar */}
        <div
          onClick={handleSeek}
          className="h-1 bg-white/20 cursor-pointer pointer-events-auto group"
          role="slider"
          aria-label="Seek"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className={"h-full bg-white " + (prefersReducedMotion ? "" : "transition-all")}
            style={{ width: `${progress * 100}%` }}
          />
          <div className="h-full -mt-1 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginLeft: `calc(${progress * 100}% - 6px)` }} />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between px-3 py-2 pointer-events-auto">
          <div className="flex items-center gap-1">
            <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center spring-tap" aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>
            <span className="text-white/80 text-[10px] font-mono ml-1">
              {formatTime(duration * progress)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => setShowCaptions((s) => !s)}
              className={"w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center spring-tap " + (showCaptions ? "bg-primary" : "bg-black/30")}
              aria-label="Toggle captions"
            >
              <Captions className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setShowSettings((s) => !s)}
              className={"w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center spring-tap " + (showSettings ? "bg-primary" : "bg-black/30")}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
            <button onClick={toggleFullscreen} className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center spring-tap" aria-label="Fullscreen">
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings popup */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 right-3 z-20 bg-card/95 backdrop-blur-lg rounded-2xl border border-border/40 p-3 w-44 soft-shadow"
          >
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Speed</p>
            <div className="grid grid-cols-3 gap-1 mb-3">
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => { changeSpeed(speed); setShowSettings(false); }}
                  className={"py-1.5 rounded-lg text-[11px] font-semibold spring-tap " + (playbackSpeed === speed ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <button
              onClick={togglePiP}
              className="w-full flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-muted/50 spring-tap text-[12px] text-foreground font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Picture in Picture
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}