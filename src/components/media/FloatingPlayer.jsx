import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, X, ChevronDown,
  Shuffle, Repeat, Volume2, ListMusic, Maximize2,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { useFloatingPlayer } from "@/lib/media/FloatingPlayerContext";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

function formatTime(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function Visualizer({ isPlaying }) {
  const bars = 24;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            isPlaying
              ? { scaleY: [0.2, Math.random() * 0.8 + 0.2, 0.2] }
              : { scaleY: 0.15 }
          }
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: isPlaying ? Infinity : 0,
            delay: i * 0.02,
            ease: "easeInOut",
          }}
          className="w-0.5 bg-primary/60 rounded-full origin-bottom"
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

function TrackInfo({ track, compact }) {
  if (!track) return null;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
        {track.artwork_url && <Image src={track.artwork_url} alt={track.title} fittingType="fill" className="w-full h-full" />}
      </div>
      <div className="min-w-0">
        <p className={cn("font-bold text-foreground truncate", compact ? "text-[11px]" : "text-[13px]")}>{track.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
      </div>
    </div>
  );
}

function ProgressBar({ position, duration, onSeek }) {
  const pct = duration > 0 ? (position / duration) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground tabular-nums w-7 text-right">{formatTime(position)}</span>
      <div
        className="flex-1 h-1 rounded-full bg-muted cursor-pointer relative group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * duration);
        }}
      >
        <div className="h-full rounded-full bg-primary relative" style={{ width: `${pct}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums w-7">{formatTime(duration)}</span>
    </div>
  );
}

/**
 * FloatingPlayer — global media player with mini and expanded states.
 * Renders nothing when mode is "hidden" or no track is loaded.
 */
export default function FloatingPlayer() {
  const player = useFloatingPlayer();
  const [showQueue, setShowQueue] = useState(false);

  if (!player || player.mode === "hidden" || !player.currentTrack) return null;

  const { currentTrack: track, isPlaying, mode } = player;

  // ── Expanded player ──
  if (mode === "expanded") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[8000] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={player.collapse} />

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative w-full max-w-[900px] mx-4 mirror-glass rounded-[24px] overflow-hidden"
          >
            <div className="flex flex-col md:flex-row">
              {/* Artwork + visualizer */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
                <motion.div
                  animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl"
                >
                  {track.artwork_url && <Image src={track.artwork_url} alt={track.title} fittingType="fill" className="w-full h-full" />}
                </motion.div>
                <Visualizer isPlaying={isPlaying} />
              </div>

              {/* Controls + info */}
              <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{track.type || "Audio"}</span>
                  <button onClick={player.collapse} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                    <ChevronDown className="w-4 h-4 text-foreground" strokeWidth={2.2} />
                  </button>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-[18px] text-foreground">{track.title}</h3>
                  <p className="text-[13px] text-muted-foreground">{track.artist}</p>
                </div>

                <ProgressBar position={player.position} duration={player.duration} onSeek={player.seek} />

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => player.setShuffle(!player.shuffle)}
                    className={cn("w-9 h-9 rounded-full flex items-center justify-center spring-tap", player.shuffle ? "text-primary" : "text-muted-foreground")}
                  >
                    <Shuffle className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                  <button onClick={player.prev} className="w-10 h-10 rounded-full flex items-center justify-center spring-tap text-foreground">
                    <SkipBack className="w-5 h-5" strokeWidth={2.2} fill="currentColor" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={player.togglePlay}
                    className="w-14 h-14 rounded-full bg-primary flex items-center justify-center spring-tap"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
                    ) : (
                      <Play className="w-6 h-6 text-primary-foreground ml-0.5" strokeWidth={2.5} fill="currentColor" />
                    )}
                  </motion.button>
                  <button onClick={player.next} className="w-10 h-10 rounded-full flex items-center justify-center spring-tap text-foreground">
                    <SkipForward className="w-5 h-5" strokeWidth={2.2} fill="currentColor" />
                  </button>
                  <button
                    onClick={() => player.setRepeat(player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off")}
                    className={cn("w-9 h-9 rounded-full flex items-center justify-center spring-tap", player.repeat !== "off" ? "text-primary" : "text-muted-foreground")}
                  >
                    <Repeat className="w-4 h-4" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Volume + speed */}
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={player.volume}
                    onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 accent-primary"
                  />
                  <select
                    value={player.playbackRate}
                    onChange={(e) => player.setPlaybackRate(parseFloat(e.target.value))}
                    className="text-[10px] bg-muted/40 text-foreground rounded-md px-1.5 py-1 outline-none"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                  </select>
                </div>

                {/* Queue toggle */}
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground spring-tap"
                >
                  <ListMusic className="w-3.5 h-3.5" strokeWidth={2.2} />
                  Queue ({player.queue.length})
                </button>

                {showQueue && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-y-auto no-scrollbar max-h-32 space-y-1"
                  >
                    {player.queue.map((t, i) => (
                      <div
                        key={t.id || i}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-lg spring-tap cursor-pointer",
                          i === player.queueIndex ? "glass" : "hover:bg-white/5"
                        )}
                        onClick={() => player.playTrack(t, player.queue)}
                      >
                        <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
                        <p className="text-[11px] text-foreground truncate flex-1">{t.title}</p>
                        <span className="text-[9px] text-muted-foreground">{formatTime(t.duration)}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Mini player ──
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[7000] w-[calc(100%-2rem)] max-w-[520px]"
      >
        <div className="crystal-card rounded-[16px] p-2.5 shadow-2xl">
          {/* Progress bar at top */}
          <div className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-muted/40 overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full"
              style={{ width: `${player.duration > 0 ? (player.position / player.duration) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <TrackInfo track={track} compact />

            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={player.prev} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground">
                <SkipBack className="w-3.5 h-3.5" strokeWidth={2.2} fill="currentColor" />
              </button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={player.togglePlay}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center spring-tap"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" strokeWidth={2.5} fill="currentColor" />
                )}
              </motion.button>
              <button onClick={player.next} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground">
                <SkipForward className="w-3.5 h-3.5" strokeWidth={2.2} fill="currentColor" />
              </button>
              <button onClick={player.expand} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground">
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>
              <button onClick={player.hide} className="w-7 h-7 rounded-full flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}