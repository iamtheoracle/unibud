import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Pause, RotateCcw, Timer, Coffee, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const MODES = {
  focus: { label: "Focus", minutes: 25, icon: Timer, tone: "text-primary" },
  deep: { label: "Deep Focus", minutes: 50, icon: Timer, tone: "text-primary" },
  break: { label: "Break", minutes: 5, icon: Coffee, tone: "text-success" },
  longBreak: { label: "Long Break", minutes: 15, icon: Coffee, tone: "text-success" },
};

const SOUNDS = [
  { id: "none", label: "Silence" },
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "cafe", label: "Café" },
  { id: "waves", label: "Waves" },
];

function fmt(s) { const m = Math.floor(s / 60); const r = s % 60; return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`; }

/**
 * StudyFocusTimer — real Pomodoro / Deep Focus timer with break cycling,
 * ambient sound selection, and focus-time logging (creates a StudySession
 * record on each completed focus block).
 */
export default function StudyFocusTimer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [modeKey, setModeKey] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState("none");
  const [todayFocusMin, setTodayFocusMin] = useState(0);
  const intervalRef = useRef(null);

  const mode = MODES[modeKey];

  useEffect(() => {
    (async () => {
      try {
        const sessions = await base44.entities.StudySession.list("-created_date", 50);
        const today = new Date().toDateString();
        const total = (sessions || [])
          .filter((s) => new Date(s.created_date || s.started_at).toDateString() === today)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        setTodayFocusMin(total);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { handleComplete(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line
  }, [running]);

  const switchMode = (k) => { setModeKey(k); setSecondsLeft(MODES[k].minutes * 60); setRunning(false); };

  const handleComplete = async () => {
    setRunning(false);
    const completedMin = mode.minutes;
    if (modeKey === "focus" || modeKey === "deep") {
      try {
        await base44.entities.StudySession.create({
          subject: "Focus session",
          started_at: new Date(Date.now() - completedMin * 60000).toISOString(),
          duration_minutes: completedMin,
          type: modeKey === "deep" ? "deep_focus" : "pomodoro",
        });
        setTodayFocusMin((m) => m + completedMin);
      } catch {}
      toast({ title: "Focus complete", description: `${completedMin} min logged. Time for a break.` });
      switchMode("break");
    } else {
      toast({ title: "Break over", description: "Ready to focus again?" });
      switchMode("focus");
    }
  };

  const reset = () => { setRunning(false); setSecondsLeft(mode.minutes * 60); };
  const progress = 1 - secondsLeft / (mode.minutes * 60);
  const R = 54, C = 2 * Math.PI * R;

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Focus Mode</h2>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">Today: {todayFocusMin} min</span>
      </div>

      <div className="flex gap-1.5 mb-4">
        {Object.entries(MODES).map(([k, m]) => (
          <button key={k} onClick={() => switchMode(k)} className={`flex-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold spring-tap ${modeKey === k ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto w-[140px] h-[140px] mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <circle cx="60" cy="60" r={R} fill="none" stroke={modeKey === "focus" || modeKey === "deep" ? "hsl(var(--primary))" : "hsl(var(--success))"} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className={`font-heading font-extrabold text-[28px] leading-none ${mode.tone}`}>{fmt(secondsLeft)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{mode.label}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <button onClick={() => setRunning((r) => !r)} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap ice-glow" aria-label={running ? "Pause" : "Start"}>
          {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={reset} className="w-12 h-12 rounded-full glass text-muted-foreground flex items-center justify-center spring-tap" aria-label="Reset"><RotateCcw className="w-4 h-4" /></button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {SOUNDS.map((s) => (
          <button key={s.id} onClick={() => setSound(s.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap shrink-0 ${sound === s.id ? "bg-primary/15 text-primary" : "glass text-muted-foreground"}`}>
            {sound === s.id ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={() => navigate("/study-sessions")} className="w-full mt-3 text-[11px] font-semibold text-primary spring-tap">View focus analytics →</button>
    </motion.section>
  );
}