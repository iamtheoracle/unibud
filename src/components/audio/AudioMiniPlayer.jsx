import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  ChevronDown, ChevronUp, List, Clock, Bookmark, FileText,
  Download, MoreHorizontal, Repeat, Shuffle,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * AudioMiniPlayer — premium audio player with mini and expanded modes.
 *
 * Mini mode: floating bar with artwork, title, play/pause, progress
 * Expanded mode: full artwork, queue, speed, sleep timer, bookmarks, transcript
 *
 * Props:
 *  - track: { title, author, artwork_url, audio_url, duration_seconds }
 *  - isPlaying, onTogglePlay, onSeek, onNext, onPrev
 *  - queue: track[] (for expanded view)
 *  - hasTranscript: boolean
 *  - isAcademic: boolean — shows Bud summarize/notes actions
 *  - onRequestBudSummary: () => void
 */
export default function AudioMiniPlayer({
  track,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  progress = 0,
  duration = 0,
  onNext,
  onPrev,
  queue = [],
  hasTranscript = false,
  isAcademic = false,
  onRequestBudSummary,
  className = "",
}) {
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showQueue, setShowQueue] = useState(false);

  if (!track) return null;

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Mini player */}
      <AnimatePresence>
        {!expanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn("fixed bottom-20 left-3 right-3 z-40", className)}
          >
            <div className="crystal-dock rounded-[18px] p-2 flex items-center gap-2.5">
              {/* Artwork */}
              <button onClick={() => setExpanded(true)} className="flex-shrink-0">
                <div className="w-11 h-11 rounded-[10px] overflow-hidden bg-muted relative">
                  {track.artwork_url && (
                    <Image src={track.artwork_url} alt={track.title} fittingType="fill" className="w-full h-full" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="flex items-end gap-0.5 h-3">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ scaleY: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-0.5 bg-white rounded-full origin-bottom"
                            style={{ height: "100%" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </button>

              {/* Title + progress */}
              <button onClick={() => setExpanded(true)} className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-bold text-foreground truncate">{track.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{track.author}</p>
                <div className="mt-1 h-0.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </button>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {onPrev && (
                  <button onClick={onPrev} className="w-8 h-8 rounded-full flex items-center justify-center spring-tap">
                    <SkipBack className="w-3.5 h-3.5 text-foreground" strokeWidth={2.5} fill="currentColor" />
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={onTogglePlay}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap"
                >
                  {isPlaying ? (
                    <Pause className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} fill="currentColor" style={{ width: 18, height: 18 }} />
                  ) : (
                    <Play className="w-4.5 h-4.5 text-primary-foreground ml-0.5" strokeWidth={2.5} fill="currentColor" style={{ width: 18, height: 18 }} />
                  )}
                </motion.button>
                {onNext && (
                  <button onClick={onNext} className="w-8 h-8 rounded-full flex items-center justify-center spring-tap">
                    <SkipForward className="w-3.5 h-3.5 text-foreground" strokeWidth={2.5} fill="currentColor" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {expanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-lg"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed bottom-0 left-0 right-0 z-50 crystal-dock rounded-t-[28px] safe-area-pb max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Drag handle + close */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-foreground/20" />
              </div>
              <div className="flex items-center justify-between px-5 py-2">
                <button onClick={() => setExpanded(false)} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <ChevronDown className="w-5 h-5 text-foreground" strokeWidth={2.2} />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Now Playing</span>
                <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <MoreHorizontal className="w-5 h-5 text-foreground" strokeWidth={2.2} />
                </button>
              </div>

              {/* Artwork */}
              <div className="px-8 py-4 flex justify-center">
                <div className="w-full max-w-[240px] aspect-square rounded-[20px] overflow-hidden crystal-card">
                  {track.artwork_url && (
                    <Image src={track.artwork_url} alt={track.title} fittingType="fill" className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="px-6 text-center mb-4">
                <h3 className="font-heading font-extrabold text-[18px] text-foreground leading-tight">{track.title}</h3>
                <p className="text-[13px] text-muted-foreground mt-0.5">{track.author}</p>
              </div>

              {/* Progress bar */}
              <div className="px-6 mb-2">
                <div
                  className="h-1.5 rounded-full bg-muted overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                    onSeek?.(pct);
                  }}
                >
                  <div className="h-full rounded-full bg-primary relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-lg" />
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime((progress / 100) * duration)}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-center gap-6 py-3">
                <button className="w-9 h-9 rounded-full flex items-center justify-center spring-tap">
                  <Shuffle className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
                <button onClick={onPrev} className="w-10 h-10 rounded-full flex items-center justify-center spring-tap">
                  <SkipBack className="w-5 h-5 text-foreground" strokeWidth={2.5} fill="currentColor" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onTogglePlay}
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center spring-tap"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} fill="currentColor" style={{ width: 24, height: 24 }} />
                  ) : (
                    <Play className="w-6 h-6 text-primary-foreground ml-1" strokeWidth={2.5} fill="currentColor" style={{ width: 24, height: 24 }} />
                  )}
                </motion.button>
                <button onClick={onNext} className="w-10 h-10 rounded-full flex items-center justify-center spring-tap">
                  <SkipForward className="w-5 h-5 text-foreground" strokeWidth={2.5} fill="currentColor" />
                </button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center spring-tap">
                  <Repeat className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
              </div>

              {/* Secondary controls */}
              <div className="flex items-center justify-center gap-4 py-2 px-6">
                <button onClick={() => setMuted(!muted)} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  {muted ? <VolumeX className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} /> : <Volume2 className="w-4 h-4 text-foreground" strokeWidth={2.2} />}
                </button>
                <button onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)} className="px-3 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <span className="text-[11px] font-bold text-foreground">{speed}x</span>
                </button>
                <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
                <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <Bookmark className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
                {hasTranscript && (
                  <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                    <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                  </button>
                )}
                <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                  <Download className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
              </div>

              {/* Bud academic actions */}
              {isAcademic && onRequestBudSummary && (
                <div className="px-6 py-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onRequestBudSummary}
                    className="w-full h-10 rounded-full glass-strong flex items-center justify-center gap-2 spring-tap"
                  >
                    <span className="text-[12px] font-bold text-primary">✨ Ask Bud to Summarize & Generate Notes</span>
                  </motion.button>
                </div>
              )}

              {/* Queue */}
              {queue.length > 0 && (
                <div className="px-6 py-3">
                  <button onClick={() => setShowQueue(!showQueue)} className="flex items-center gap-2 w-full">
                    <List className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                    <span className="text-[12px] font-bold text-foreground">Up Next ({queue.length})</span>
                    <ChevronUp className={cn("w-4 h-4 text-muted-foreground ml-auto transition-transform", !showQueue && "rotate-180")} strokeWidth={2.2} />
                  </button>
                  <AnimatePresence>
                    {showQueue && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        {queue.slice(0, 5).map((qTrack, i) => (
                          <div key={i} className="flex items-center gap-2.5 py-2">
                            <div className="w-9 h-9 rounded-[8px] overflow-hidden bg-muted flex-shrink-0">
                              {qTrack.artwork_url && <Image src={qTrack.artwork_url} alt="" fittingType="fill" className="w-full h-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-foreground truncate">{qTrack.title}</p>
                              <p className="text-[9px] text-muted-foreground truncate">{qTrack.author}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}