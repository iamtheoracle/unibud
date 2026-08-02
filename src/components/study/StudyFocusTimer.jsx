import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Pause, RotateCcw, Timer, Coffee, Volume2, VolumeX,
  Plus, Clock, BarChart3, BookOpen, ChevronDown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const PRESETS = {
  focus: { label: "Focus", minutes: 25, icon: Timer, tone: "text-primary" },
  deep: { label: "Deep Focus", minutes: 50, icon: Timer, tone: "text-primary" },
  break: { label: "Break", minutes: 5, icon: Coffee, tone: "text-success" },
  longBreak: { label: "Long Break", minutes: 15, icon: Coffee, tone: "text-success" },
  custom: { label: "Custom", minutes: 0, icon: Plus, tone: "text-primary" },
  stopwatch: { label: "Stopwatch", minutes: 0, icon: Clock, tone: "text-primary" },
};

const SOUNDS = [
  { id: "none", label: "Silence" },
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "cafe", label: "Café" },
  { id: "waves", label: "Waves" },
];

const SESSION_TARGETS = [
  { id: "course", label: "Course", placeholder: "e.g. CSC 201" },
  { id: "subject", label: "Subject", placeholder: "e.g. Data Structures" },
  { id: "assignment", label: "Assignment", placeholder: "What are you working on?" },
  { id: "project", label: "Project", placeholder: "Project name" },
  { id: "exam", label: "Exam Prep", placeholder: "Which exam?" },
];

function fmt(s) { const m = Math.floor(s / 60); const r = s % 60; return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`; }

/**
 * StudyFocusTimer — comprehensive focus timer with Pomodoro, Deep Focus,
 * Custom timer, Stopwatch, and Break modes. Sessions can be assigned to
 * courses, subjects, assignments, projects, or exam prep. Automatically
 * logs StudySession records and displays weekly focus statistics.
 */
export default function StudyFocusTimer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modeKey, setModeKey] = useState("focus");
  const [customMinutes, setCustomMinutes] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS.focus.minutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState("none");
  const [todayFocusMin, setTodayFocusMin] = useState(0);
  const [weekFocusMin, setWeekFocusMin] = useState(0);
  const [showTargets, setShowTargets] = useState(false);
  const [sessionTarget, setSessionTarget] = useState({ type: "subject", value: "" });
  const intervalRef = useRef(null);

  const mode = PRESETS[modeKey];
  const isStopwatch = modeKey === "stopwatch";
  const isCustom = modeKey === "custom";
  const effectiveMinutes = isCustom ? customMinutes : mode.minutes;
  const displaySeconds = isStopwatch ? stopwatchSeconds : secondsLeft;

  useEffect(() => {
    (async () => {
      try {
        const sessions = await base44.entities.StudySession.list("-created_date", 100);
        const now = new Date();
        const todayStr = now.toDateString();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);

        const todayTotal = (sessions || [])
          .filter((s) => new Date(s.created_date || s.started_at).toDateString() === todayStr)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

        const weekTotal = (sessions || [])
          .filter((s) => new Date(s.created_date || s.started_at) >= weekAgo)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

        setTodayFocusMin(todayTotal);
        setWeekFocusMin(weekTotal);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      if (isStopwatch) {
        setStopwatchSeconds((s) => s + 1);
      } else {
        setSecondsLeft((s) => {
          if (s <= 1) { handleComplete(); return 0; }
          return s - 1;
        });
      }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line
  }, [running, isStopwatch]);

  const switchMode = (k) => {
    setModeKey(k);
    if (k === "stopwatch") {
      setStopwatchSeconds(0);
    } else if (k === "custom") {
      setSecondsLeft(customMinutes * 60);
    } else {
      setSecondsLeft(PRESETS[k].minutes * 60);
    }
    setRunning(false);
  };

  const handleComplete = async () => {
    setRunning(false);
    const completedMin = effectiveMinutes;
    if (modeKey === "focus" || modeKey === "deep" || isCustom) {
      try {
        const sessionData = {
          subject: sessionTarget.value || "Focus session",
          started_at: new Date(Date.now() - completedMin * 60000).toISOString(),
          duration_minutes: completedMin,
          type: modeKey === "deep" ? "deep_focus" : isCustom ? "custom" : "pomodoro",
        };
        if (sessionTarget.type === "course") sessionData.course_code = sessionTarget.value;
        await base44.entities.StudySession.create(sessionData);
        setTodayFocusMin((m) => m + completedMin);
        setWeekFocusMin((m) => m + completedMin);
      } catch {}
      toast({ title: "Focus complete", description: `${completedMin} min logged. Time for a break.` });
      if (modeKey !== "custom") switchMode("break");
    } else {
      toast({ title: "Break over", description: "Ready to focus again?" });
      switchMode("focus");
    }
  };

  const handleStopwatchStop = async () => {
    setRunning(false);
    const minutes = Math.round(stopwatchSeconds / 60);
    if (minutes > 0) {
      try {
        const sessionData = {
          subject: sessionTarget.value || "Focus session",
          started_at: new Date(Date.now() - stopwatchSeconds * 1000).toISOString(),
          duration_minutes: minutes,
          type: "stopwatch",
        };
        if (sessionTarget.type === "course") sessionData.course_code = sessionTarget.value;
        await base44.entities.StudySession.create(sessionData);
        setTodayFocusMin((m) => m + minutes);
        setWeekFocusMin((m) => m + minutes);
      } catch {}
      toast({ title: "Session logged", description: `${minutes} min recorded.` });
    }
    setStopwatchSeconds(0);
  };

  const reset = () => {
    setRunning(false);
    if (isStopwatch) setStopwatchSeconds(0);
    else setSecondsLeft(effectiveMinutes * 60);
  };

  const progress = isStopwatch ? 0 : effectiveMinutes > 0 ? 1 - secondsLeft / (effectiveMinutes * 60) : 0;
  const R = 54, C = 2 * Math.PI * R;

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Focus Mode</h2>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-muted-foreground block">Today: {todayFocusMin} min</span>
          <span className="text-[10px] text-muted-foreground">This week: {weekFocusMin} min</span>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
        {Object.entries(PRESETS).map(([k, m]) => (
          <button
            key={k}
            onClick={() => switchMode(k)}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold spring-tap ${modeKey === k ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Custom duration picker */}
      {isCustom && !running && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            value={customMinutes}
            onChange={(e) => { const v = Math.max(1, Math.min(180, parseInt(e.target.value) || 1)); setCustomMinutes(v); setSecondsLeft(v * 60); }}
            className="w-16 px-2 py-1.5 rounded-xl bg-muted/40 text-[13px] text-foreground text-center outline-none"
            min={1}
            max={180}
          />
          <span className="text-[11px] text-muted-foreground">minutes</span>
          {[15, 30, 45, 60].map((m) => (
            <button key={m} onClick={() => { setCustomMinutes(m); setSecondsLeft(m * 60); }} className="px-2 py-1 rounded-full bg-muted/40 text-[10px] font-medium text-muted-foreground spring-tap">
              {m}m
            </button>
          ))}
        </div>
      )}

      {/* Session target */}
      <button
        onClick={() => setShowTargets(!showTargets)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] bg-muted/30 mb-3"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
          <span className="text-[11px] text-muted-foreground">
            {sessionTarget.value ? `${SESSION_TARGETS.find((t) => t.id === sessionTarget.type)?.label}: ${sessionTarget.value}` : "Assign to course, subject, or exam"}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showTargets ? "rotate-180" : ""}`} strokeWidth={1.6} />
      </button>

      {showTargets && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden mb-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SESSION_TARGETS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSessionTarget((prev) => ({ ...prev, type: t.id }))}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium spring-tap ${sessionTarget.type === t.id ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={sessionTarget.value}
            onChange={(e) => setSessionTarget((prev) => ({ ...prev, value: e.target.value }))}
            placeholder={SESSION_TARGETS.find((t) => t.id === sessionTarget.type)?.placeholder || ""}
            className="w-full px-3 py-1.5 rounded-[10px] bg-muted/40 text-[12px] text-foreground outline-none"
          />
        </motion.div>
      )}

      {/* Timer circle */}
      <div className="relative mx-auto w-[140px] h-[140px] mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          {!isStopwatch && (
            <circle
              cx="60" cy="60" r={R} fill="none"
              stroke={modeKey === "focus" || modeKey === "deep" || isCustom ? "hsl(var(--primary))" : "hsl(var(--success))"}
              strokeWidth="8" strokeLinecap="round" strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          )}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className={`font-heading font-extrabold text-[28px] leading-none ${mode.tone}`}>
              {fmt(displaySeconds)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isStopwatch ? "Stopwatch" : mode.label}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {isStopwatch && running ? (
          <button onClick={handleStopwatchStop} className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center spring-tap" aria-label="Stop & log">
            <Pause className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => setRunning((r) => !r)} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap ice-glow" aria-label={running ? "Pause" : "Start"} disabled={isCustom && customMinutes === 0}>
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}
        <button onClick={reset} className="w-12 h-12 rounded-full glass text-muted-foreground flex items-center justify-center spring-tap" aria-label="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Ambient sounds */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {SOUNDS.map((s) => (
          <button key={s.id} onClick={() => setSound(s.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap shrink-0 ${sound === s.id ? "bg-primary/15 text-primary" : "glass text-muted-foreground"}`}>
            {sound === s.id ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
        <div className="flex-1 flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.6} />
          <div>
            <p className="text-[10px] font-bold text-foreground">{weekFocusMin} min</p>
            <p className="text-[9px] text-muted-foreground">this week</p>
          </div>
        </div>
        <button onClick={() => navigate("/study-sessions")} className="text-[11px] font-semibold text-primary spring-tap">
          View analytics →
        </button>
      </div>
    </motion.section>
  );
}