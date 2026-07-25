import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/academics/PageHeader";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

export default function StudySessions() {
  const qc = useQueryClient();
  const { data: sessions } = useQuery({ queryKey: ["studySessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 100) });
  const [running, setRunning] = useState(false);
  const [planned, setPlanned] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState("");
  const [showRating, setShowRating] = useState(false);
  const [pendingDuration, setPendingDuration] = useState(0);
  const [rating, setRating] = useState(3);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => Math.max(r - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      setPendingDuration(planned * 60);
      setShowRating(true);
    }
  }, [running, remaining, planned]);

  const start = () => { if (!subject) { toast({ title: "Add a subject first" }); return; } setRemaining(planned * 60); setRunning(true); };
  const stop = () => { setRunning(false); setPendingDuration(planned * 60 - remaining); setShowRating(true); };

  const create = useMutation({
    mutationFn: (v) => base44.entities.StudySession.create(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studySessions"] }); toast({ title: "Session saved" }); setShowRating(false); setSubject(""); setGoal(""); },
  });
  const finish = () => {
    create.mutate({
      subject,
      goal,
      session_date: new Date().toISOString().split("T")[0],
      started_at: new Date(Date.now() - pendingDuration * 1000).toISOString(),
      ended_at: new Date().toISOString(),
      duration_minutes: Math.max(1, Math.round(pendingDuration / 60)),
      planned_duration_minutes: planned,
      productivity_score: rating,
      status: "completed",
    });
  };
  const del = useMutation({ mutationFn: (id) => base44.entities.StudySession.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["studySessions"] }); toast({ title: "Session removed" }); } });

  const hours = (sessions || []).map((s) => (s.started_at ? new Date(s.started_at).getHours() : -1)).filter((h) => h >= 0);
  const budHint = hours.length >= 3 ? (() => {
    const counts = {};
    hours.forEach((h) => { const k = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening"; counts[k] = (counts[k] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return `Bud noticed you focus best in the ${top[0]}. Consider scheduling sessions then.`;
  })() : "Log a few sessions and Bud will recommend your best study times.";

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <PageHeader title="Study Sessions" />
      <div className="glass-card p-5 text-center mb-4">
        <p className="font-heading font-bold text-[40px] text-primary tabular-nums">{fmt(remaining)}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{running ? "Focus session in progress" : "Set up a session to begin"}</p>
        {!running && !showRating && (
          <div className="mt-4 space-y-3 text-left">
            <GlassInput label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" />
            <GlassInput label="Goal (optional)" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Finish chapter 3" />
            <div>
              <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Duration (minutes)</label>
              <select value={planned} onChange={(e) => { setPlanned(Number(e.target.value)); setRemaining(Number(e.target.value) * 60); }} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">{[15, 25, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}</select>
            </div>
          </div>
        )}
        {!running && !showRating && <button onClick={start} className="w-full h-[52px] mt-4 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap ice-glow">Start Session</button>}
        {running && <button onClick={stop} className="w-full h-[52px] mt-4 rounded-2xl glass text-foreground font-heading font-semibold text-[15px] spring-tap">End Session</button>}
      </div>
      <div className="glass-card p-3.5 mb-4 border border-primary/15 bg-primary/8"><p className="text-[13px] text-foreground/90">{budHint}</p></div>

      <p className="text-[13px] font-bold text-foreground px-1 mb-2">Recent Sessions</p>
      {!sessions?.length ? <EmptyState message="No sessions logged yet. Start one above." /> : (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }} className="glass-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-foreground truncate">{s.subject || "Study session"}</p>
                <span className="text-[11px] text-muted-foreground">{s.session_date}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.duration_minutes || 0} min{s.goal ? ` · ${s.goal}` : ""}{s.productivity_score ? ` · Rating ${s.productivity_score}/5` : ""}</p>
              {s.bud_feedback && <p className="text-[12px] text-foreground/80 mt-1.5">{s.bud_feedback}</p>}
              <button onClick={() => del.mutate(s.id)} className="text-[11px] font-semibold text-destructive spring-tap mt-2">Delete</button>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={showRating} onClose={() => setShowRating(false)} title="Session complete">
        <p className="text-[13px] text-muted-foreground mb-4">You focused for {Math.round(pendingDuration / 60)} minutes. How productive did it feel?</p>
        <div className="flex justify-center gap-3 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={`w-11 h-11 rounded-full spring-tap font-heading font-bold text-[16px] ${rating === n ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{n}</button>
          ))}
        </div>
        <button onClick={finish} disabled={create.isPending} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] spring-tap disabled:opacity-50 ice-glow">{create.isPending ? "Saving…" : "Save Session"}</button>
      </Sheet>
    </div>
  );
}