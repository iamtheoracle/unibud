import React, { useState } from "react";
import { ShieldCheck, Bot, BrainCircuit, MessageSquare, Sparkles, MonitorUp, Clock, Upload, Trash2, Plus, CalendarPlus } from "lucide-react";

/**
 * ClassroomControls — lecturer/tutor panel for the live class.
 * Strict exam mode, Bud / AI assistance toggles, permissions, thresholds,
 * shared materials, and scheduling the next class.
 */
export default function ClassroomControls({ liveClass, onUpdate, updatingControls, onShare, sharingMaterial, onRemove, onSchedule, scheduling }) {
  const [mat, setMat] = useState({ title: "", url: "", type: "document" });
  const [sch, setSch] = useState({ title: "", course_code: liveClass?.course_code || "", course_title: liveClass?.course_title || "", scheduled_date: "", start_time: "", duration_minutes: 60, type: "lecture" });
  const [showSchedule, setShowSchedule] = useState(false);

  const set = (patch) => onUpdate(patch);

  const addMaterial = () => {
    if (!mat.title || !mat.url) return;
    onShare({ title: mat.title, url: mat.url, type: mat.type });
    setMat({ title: "", url: "", type: "document" });
  };

  const submitSchedule = () => {
    if (!sch.title || !sch.scheduled_date || !sch.start_time) return;
    onSchedule(sch);
    setSch({ ...sch, title: "", scheduled_date: "", start_time: "" });
    setShowSchedule(false);
  };

  return (
    <div className="rounded-[22px] p-4 glass-card space-y-4">
      <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-primary" /> Classroom controls
      </p>

      <Toggle icon={ShieldCheck} label="Strict exam mode" desc="Disables Bud, AI assistance and free interactions for students." value={!!liveClass?.strict_exam_mode} onChange={(v) => set({ strict_exam_mode: v, bud_enabled: !v, ai_assistance_enabled: !v, allow_chat: !v, allow_reactions: !v })} accent="destructive" />
      <Toggle icon={Bot} label="Bud enabled" desc="Show the Bud companion to students during this class." value={!!liveClass?.bud_enabled} onChange={(v) => set({ bud_enabled: v })} />
      <Toggle icon={BrainCircuit} label="AI assistance" desc="Allow AI help during tests and exams." value={!!liveClass?.ai_assistance_enabled} onChange={(v) => set({ ai_assistance_enabled: v })} />
      <Toggle icon={MessageSquare} label="Chat" value={!!liveClass?.allow_chat} onChange={(v) => set({ allow_chat: v })} />
      <Toggle icon={Sparkles} label="Reactions" value={!!liveClass?.allow_reactions} onChange={(v) => set({ allow_reactions: v })} />
      <Toggle icon={MonitorUp} label="Screen share" value={!!liveClass?.allow_screen_share} onChange={(v) => set({ allow_screen_share: v })} />

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Threshold icon={Clock} label="Late after (min)" value={liveClass?.late_after_minutes ?? 10} onChange={(v) => set({ late_after_minutes: Number(v) || 0 })} />
        <Threshold icon={Clock} label="Min attendance (min)" value={liveClass?.min_attendance_minutes ?? 0} onChange={(v) => set({ min_attendance_minutes: Number(v) || 0 })} />
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Shared materials
        </p>
        <div className="space-y-1.5">
          {(liveClass?.materials || []).map((m, i) => (
            <div key={i} className="flex items-center gap-2 rounded-[12px] bg-muted/40 px-2.5 py-2">
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">{m.type || "doc"}</span>
              <a href={m.url} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-foreground truncate flex-1">{m.title}</a>
              <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {(liveClass?.materials || []).length === 0 && <p className="text-[11px] text-muted-foreground/70">No materials shared yet.</p>}
        </div>
        <div className="flex gap-1.5 mt-2">
          <input value={mat.title} onChange={(e) => setMat({ ...mat, title: e.target.value })} placeholder="Title" className="flex-1 oracle-input" />
          <input value={mat.url} onChange={(e) => setMat({ ...mat, url: e.target.value })} placeholder="URL" className="flex-1 oracle-input" />
          <select value={mat.type} onChange={(e) => setMat({ ...mat, type: e.target.value })} className="oracle-input w-[96px]">
            <option value="document">Document</option>
            <option value="slides">Slides</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <button onClick={addMaterial} disabled={sharingMaterial} className="px-3 rounded-[12px] bg-primary text-primary-foreground spring-tap disabled:opacity-50"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      <div>
        <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-1.5 text-[12px] font-semibold text-primary">
          <CalendarPlus className="w-3.5 h-3.5" /> Schedule next class
        </button>
        {showSchedule && (
          <div className="mt-2 space-y-2 rounded-[14px] bg-muted/30 p-3">
            <input value={sch.title} onChange={(e) => setSch({ ...sch, title: e.target.value })} placeholder="Class title" className="oracle-input" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={sch.scheduled_date} onChange={(e) => setSch({ ...sch, scheduled_date: e.target.value })} className="oracle-input" />
              <input type="time" value={sch.start_time} onChange={(e) => setSch({ ...sch, start_time: e.target.value })} className="oracle-input" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={sch.duration_minutes} onChange={(e) => setSch({ ...sch, duration_minutes: Number(e.target.value) || 60 })} className="oracle-input" placeholder="Duration (min)" />
              <select value={sch.type} onChange={(e) => setSch({ ...sch, type: e.target.value })} className="oracle-input">
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
            <button onClick={submitSchedule} disabled={scheduling} className="w-full py-2 rounded-[12px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">Schedule class</button>
          </div>
        )}
      </div>
      {updatingControls && <p className="text-[10px] text-muted-foreground">Saving…</p>}
    </div>
  );
}

function Toggle({ icon: Icon, label, desc, value, onChange, accent }) {
  const iconColor = accent === "destructive"
    ? (value ? "text-destructive" : "text-muted-foreground")
    : (value ? "text-primary" : "text-muted-foreground");
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 rounded-[14px] bg-muted/30 px-3 py-2.5 text-left spring-tap">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        {desc && <p className="text-[10px] text-muted-foreground truncate">{desc}</p>}
      </div>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${value ? (accent === "destructive" ? "bg-destructive" : "bg-primary") : "bg-muted"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function Threshold({ icon: Icon, label, value, onChange }) {
  return (
    <div className="rounded-[12px] bg-muted/30 px-2.5 py-2">
      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</p>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="oracle-input mt-1" />
    </div>
  );
}