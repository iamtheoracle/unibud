import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mic, Video, ScreenShare, PenTool, FileText, Users, Timer,
  Play, Lock, Radio, BookOpen, CheckSquare,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const FEATURES = {
  voice: { icon: Mic, label: "Voice", color: "hsl(142 71% 45%)" },
  video: { icon: Video, label: "Video", color: "hsl(217 91% 60%)" },
  screen_share: { icon: ScreenShare, label: "Screen", color: "hsl(280 65% 60%)" },
  whiteboard: { icon: PenTool, label: "Whiteboard", color: "hsl(24 90% 55%)" },
  shared_notes: { icon: FileText, label: "Notes", color: "hsl(200 80% 55%)" },
  ai_transcription: { icon: BookOpen, label: "AI Captions", color: "hsl(160 70% 45%)" },
  task_tracker: { icon: CheckSquare, label: "Tasks", color: "hsl(46 74% 55%)" },
};

function formatPomodoro(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * LiveStudyRoomCard — card for a live or scheduled study room.
 *
 * Props:
 *  - room: { title, subject, host: { name, image }, participants: [], participants_count, max_participants, features: [], pomodoro_seconds, is_live, is_private, study_mode, timer_active, accent_color }
 *  - onJoin: () => void
 *  - variant: "card" | "row" | "compact"
 */
export default function LiveStudyRoomCard({ room, onJoin, variant = "card" }) {
  const [pomodoro, setPomodoro] = useState(room?.pomodoro_seconds || 1500);

  useEffect(() => {
    if (!room?.is_live || !room?.timer_active) return;
    const interval = setInterval(() => {
      setPomodoro((p) => (p > 0 ? p - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [room?.is_live, room?.timer_active]);

  if (!room) return null;
  const features = room.features || [];
  const participants = room.participants || [];

  if (variant === "row") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onJoin}
        className="flex items-center gap-2.5 p-2 rounded-[12px] crystal-card cursor-pointer spring-tap"
      >
        <div className="relative w-10 h-10 rounded-[10px] bg-muted flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          {room.is_live && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{room.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Users className="w-2.5 h-2.5" strokeWidth={2.2} />
              {room.participants_count || 0}
            </span>
            {room.is_live && room.timer_active && (
              <span className="flex items-center gap-0.5 text-[9px] text-primary font-bold">
                <Timer className="w-2.5 h-2.5" strokeWidth={2.2} />
                {formatPomodoro(pomodoro)}
              </span>
            )}
            {room.is_private && <Lock className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
          className="px-3 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap flex-shrink-0"
        >
          Join
        </motion.button>
      </motion.div>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onJoin}
        className="p-2.5 rounded-[12px] crystal-card cursor-pointer spring-tap"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-primary" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate">{room.title}</p>
            <p className="text-[9px] text-muted-foreground truncate">{room.subject}</p>
          </div>
          {room.is_live && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-success/15">
              <Radio className="w-2.5 h-2.5 text-success" strokeWidth={2.5} />
              <span className="text-[8px] font-bold text-success">LIVE</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={onJoin}
      className="crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-elevate group"
    >
      {/* Header */}
      <div className="relative p-3 pb-2" style={{ background: room.accent_color ? `linear-gradient(135deg, ${room.accent_color}15, transparent)` : undefined }}>
        {/* Live / Private badges */}
        <div className="flex items-center gap-1.5 mb-2">
          {room.is_live ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[8px] font-bold text-success">STUDYING</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
              <Timer className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[8px] font-bold text-muted-foreground">SCHEDULED</span>
            </div>
          )}
          {room.is_private && (
            <div className="w-5 h-5 rounded-full glass flex items-center justify-center">
              <Lock className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
            </div>
          )}
          {room.timer_active && room.is_live && (
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10">
              <Timer className="w-2.5 h-2.5 text-primary" strokeWidth={2.2} />
              <span className="text-[9px] font-bold text-primary tabular-nums">{formatPomodoro(pomodoro)}</span>
            </div>
          )}
        </div>

        <h4 className="text-[13px] font-bold text-foreground line-clamp-1">{room.title}</h4>
        {room.subject && <p className="text-[10px] text-muted-foreground mt-0.5">{room.subject}</p>}
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 5).map((f) => {
              const config = FEATURES[f];
              if (!config) return null;
              const Icon = config.icon;
              return (
                <div key={f} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full glass">
                  <Icon className="w-2.5 h-2.5" strokeWidth={2.2} style={{ color: config.color }} />
                  <span className="text-[8px] font-medium text-muted-foreground">{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        {/* Host */}
        {room.host && (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <PremiumAvatar src={room.host.image} alt={room.host.name} size="xs" />
            <span className="text-[9px] text-muted-foreground truncate">{room.host.name}</span>
          </div>
        )}

        {/* Participants */}
        <div className="flex items-center gap-1">
          {participants.slice(0, 3).map((p, i) => (
            <div key={i} className="w-5 h-5 rounded-full border border-background overflow-hidden">
              <PremiumAvatar src={p.image} alt={p.name} size="xs" />
            </div>
          ))}
          {room.participants_count > 3 && (
            <span className="text-[8px] text-muted-foreground font-bold ml-0.5">+{room.participants_count - 3}</span>
          )}
        </div>

        {/* Join button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
          className="h-7 px-3 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap flex items-center gap-1 flex-shrink-0"
        >
          <Play className="w-2.5 h-2.5" strokeWidth={2.5} fill="currentColor" />
          Join
        </motion.button>
      </div>
    </motion.div>
  );
}