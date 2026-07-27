import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Play, Pause, Square, BookOpen, Brain, Clock, CheckCircle2, Loader2, Plus, Zap, Moon,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const DURATIONS = [15, 25, 45, 60, 90];
const FOCUS_COURSES = ["CSC 301", "MTH 201", "PHY 203", "ENG 201", "CSC 305", "General Reading"];

export default function StudySession() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [phase, setPhase] = useState("setup");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [duration, setDuration] = useState(25);
  const [focusMode, setFocusMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const intervalRef = useRef(null);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  useEffect(() => {
    if (phase === "active" && !paused) {
      intervalRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= duration * 60) {
            clearInterval(intervalRef.current);
            finishSession(duration * 60);
            return duration * 60;
          }
          return e + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase, paused, duration]);

  const toggleCourse = (c) => {
    setSelectedCourses((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  };

  const startSession = () => {
    if (selectedCourses.length === 0) return;
    setPhase("active");
    setElapsed(0);
    setPaused(false);
  };

  const finishSession = async (totalSeconds) => {
    setPhase("complete");
    setAnalyzing(true);
    const minutes = Math.round(totalSeconds / 60);
    try {
      const insight = await base44.integrations.Core.InvokeLLM({
        prompt: `A student just finished a ${minutes}-minute study session for ${selectedCourses.join(", ")}. Focus mode was ${focusMode ? "on" : "off"}. They took these notes: "${notes || "No notes taken."}". Give a productivity score (0-100) and a short encouraging tip (1 sentence) from Bud. Be warm and specific.`,
        response_json_schema: {
          type: "object",
          properties: {
            productivity_score: { type: "number" },
            tip: { type: "string" },
            encouragement: { type: "string" },
          },
        },
      });

      const today = new Date();
      const session = await base44.entities.StudySession.create({
        courses: selectedCourses,
        subject: selectedCourses[0] || "General",
        duration_minutes: minutes,
        planned_duration_minutes: duration,
        notes: notes,
        productivity_score: insight?.productivity_score || 75,
        focus_mode: focusMode,
        status: "completed",
        started_at: new Date(today.getTime() - totalSeconds * 1000).toISOString(),
        ended_at: today.toISOString(),
        session_date: today.toISOString().split("T")[0],
        bud_feedback: insight?.encouragement || "",
      });

      setFeedback(insight);
      qc.invalidateQueries({ queryKey: ["studySessions"] });
      qc.invalidateQueries({ queryKey: ["studyGoals"] });

      await base44.entities.Milestone.create({
        title: `Studied ${selectedCourses[0] || "a subject"} for ${minutes} minutes`,
        description: `Completed a ${focusMode ? "focus mode " : ""}study session with a productivity score of ${insight?.productivity_score || 75}.`,
        type: "study_streak",
        student_name: user?.full_name || "Student",
        share_scope: "private",
        is_shared: false,
        accent_color: "hsl(var(--unibud-green))",
        metadata: { session_id: session.id, duration_minutes: minutes, courses: selectedCourses },
      }).catch(() => {});
    } catch (err) {
      setFeedback({ productivity_score: 75, tip: "Keep going!", encouragement: "Every minute counts!" });
    }
    setAnalyzing(false);
  };

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = phase === "active" ? (elapsed / (duration * 60)) * 100 : 0;

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <h1 className="font-heading font-bold text-[18px] text-foreground">Study Session</h1>
      </div>

      {phase === "setup" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 space-y-4">
          <GlassCard variant="solid" className="p-5" delay={0.05}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-[14px] text-foreground">Select Courses</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {FOCUS_COURSES.map((c) => (
                <button key={c} onClick={() => toggleCourse(c)}
                  className={`px-3.5 py-2 rounded-full text-[11px] font-semibold spring-tap transition-all ${selectedCourses.includes(c) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard variant="solid" className="p-5" delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-[14px] text-foreground">Study Duration</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-3 rounded-[14px] text-[13px] font-bold spring-tap transition-all ${duration === d ? "bg-primary text-primary-foreground gold-glow" : "bg-muted text-muted-foreground"}`}>
                  {d}m
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard variant="solid" className="p-5" delay={0.15}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="font-heading font-semibold text-[14px] text-foreground">Focus Mode</h3>
                  <p className="text-[10px] text-muted-foreground">Mute notifications & dim UI</p>
                </div>
              </div>
              <button onClick={() => setFocusMode(!focusMode)}
                className={`relative w-12 h-7 rounded-full transition-colors ${focusMode ? "bg-primary" : "bg-muted"}`}>
                <motion.div animate={{ x: focusMode ? 22 : 2 }} className="absolute top-0.5 w-6 h-6 rounded-full bg-card soft-shadow" />
              </button>
            </div>
          </GlassCard>

          <button onClick={startSession} disabled={selectedCourses.length === 0}
            className="w-full h-14 rounded-[16px] bg-primary text-primary-foreground font-heading font-bold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40 gold-glow">
            <Play className="w-5 h-5" /> Start Session
          </button>
        </motion.div>
      )}

      {phase === "active" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`px-4 space-y-4 ${focusMode ? "transition-all" : ""}`}>
          <div className="flex justify-center pt-4 pb-2">
            <div className="relative w-[200px] h-[200px]">
              <svg width="200" height="200" className="transform -rotate-90">
                <circle cx="100" cy="100" r="90" strokeWidth="8" fill="none" stroke="hsl(var(--muted))" />
                <motion.circle cx="100" cy="100" r="90" strokeWidth="8" fill="none" stroke="hsl(var(--primary))" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90} animate={{ strokeDashoffset: 2 * Math.PI * 90 * (1 - progress / 100) }}
                  transition={{ ease: "linear" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-heading font-extrabold text-[36px] text-foreground tabular-nums">{fmt(elapsed)}</p>
                <p className="text-[11px] text-muted-foreground">of {duration}:00</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-1.5 flex-wrap">
            {selectedCourses.map((c) => (
              <span key={c} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{c}</span>
            ))}
            {focusMode && <span className="px-3 py-1 rounded-full bg-purple/10 text-purple text-[10px] font-semibold flex items-center gap-1"><Moon className="w-2.5 h-2.5" /> Focus</span>}
          </div>

          <GlassCard variant="solid" className="p-4" delay={0.1}>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Take notes while you study..."
              className="w-full h-32 px-4 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </GlassCard>

          <div className="flex gap-2">
            <button onClick={() => setPaused(!paused)} className="flex-1 h-12 rounded-[14px] bg-card border border-border/40 text-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap">
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "Resume" : "Pause"}
            </button>
            <button onClick={() => finishSession(elapsed)} className="flex-1 h-12 rounded-[14px] bg-destructive text-destructive-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap">
              <Square className="w-4 h-4" /> Finish
            </button>
          </div>
        </motion.div>
      )}

      {phase === "complete" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mt-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </motion.div>

          <div className="text-center">
            <h2 className="font-heading font-bold text-[20px] text-foreground">Session Complete!</h2>
            <p className="text-[12px] text-muted-foreground mt-1">You studied for {Math.round(elapsed / 60)} minutes</p>
          </div>

          {analyzing ? (
            <GlassCard variant="solid" className="p-5 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-[12px] text-muted-foreground">Bud is analysing your session...</p>
            </GlassCard>
          ) : feedback && (
            <>
              <GlassCard variant="solid" className="p-5" delay={0.1}>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg width="64" height="64" className="transform -rotate-90">
                      <circle cx="32" cy="32" r="28" strokeWidth="5" fill="none" stroke="hsl(var(--muted))" />
                      <motion.circle cx="32" cy="32" r="28" strokeWidth="5" fill="none" stroke="hsl(var(--primary))" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 28} initial={{ strokeDashoffset: 2 * Math.PI * 28 }} animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - feedback.productivity_score / 100) }} transition={{ duration: 1, ease: "easeOut" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-heading font-bold text-[14px] text-foreground">{feedback.productivity_score}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Productivity Score</span>
                    </div>
                    <p className="text-[12px] text-foreground leading-relaxed">{feedback.encouragement}</p>
                    {feedback.tip && <p className="text-[11px] text-primary font-medium mt-1.5">→ {feedback.tip}</p>}
                  </div>
                </div>
              </GlassCard>

              <div className="flex gap-2">
                <button onClick={() => { setPhase("setup"); setSelectedCourses([]); setNotes(""); setFeedback(null); setElapsed(0); }}
                  className="flex-1 h-12 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap">
                  <Plus className="w-4 h-4" /> New Session
                </button>
                <button onClick={() => navigate("/academics")} className="flex-1 h-12 rounded-[14px] bg-card border border-border/40 text-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap">
                  Back to Academics
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}