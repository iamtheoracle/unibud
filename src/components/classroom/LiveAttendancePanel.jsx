import React from "react";
import { Users, CheckCircle2, Clock, LogOut, AlertTriangle, Wifi, ShieldAlert } from "lucide-react";

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * LiveAttendancePanel — lecturer roster + stats, or the student's own live
 * attendance status. Spark surfaces an inline insight (no extra screen).
 */
export default function LiveAttendancePanel({ isLecturer, classRecords, joined, durationSec, reconnections, liveClass, onLeave, summary }) {
  if (isLecturer) {
    const present = classRecords.filter((r) => r.status === "present");
    const late = classRecords.filter((r) => r.late).length;
    const earlyExit = classRecords.filter((r) => r.early_exit).length;
    const avg = present.length ? Math.round(present.reduce((a, r) => a + (r.attendance_pct || 0), 0) / present.length) : 0;

    return (
      <div className="rounded-[22px] p-4 glass-card">
        <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5 mb-3">
          <Users className="w-4 h-4 text-primary" /> Live attendance
        </p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <Stat label="Joined" value={classRecords.length} tone="primary" />
          <Stat label="Present" value={present.length} tone="success" />
          <Stat label="Late" value={late} tone="warning" />
          <Stat label="Early exit" value={earlyExit} tone="destructive" />
        </div>
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto no-scrollbar">
          {classRecords.length === 0 && <p className="text-[11px] text-muted-foreground/70 text-center py-3">No students have joined yet.</p>}
          {classRecords.map((r) => (
            <div key={r.id} className="flex items-center gap-2 rounded-[12px] bg-muted/30 px-2.5 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-foreground truncate">{r.participant_name || "Student"}</p>
                <p className="text-[10px] text-muted-foreground">{r.duration_minutes || 0} min · {r.attendance_pct || 0}%{r.reconnections ? ` · ${r.reconnections}↻` : ""}</p>
              </div>
              {r.late && <Badge tone="warning">Late</Badge>}
              {r.early_exit && <Badge tone="destructive">Early</Badge>}
            </div>
          ))}
        </div>
        {summary ? (
          <div className="mt-3 rounded-[12px] bg-primary/8 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-primary/70">Spark insight</p>
            <p className="text-[11px] text-foreground mt-0.5">
              Final attendance {summary.avg_attendance_pct || 0}% across {summary.participants || 0} students{late > 0 ? ` — ${late} arrived late` : ""}.
              {avg >= 75 ? " Engagement looks strong." : avg < 50 ? " Low attendance — consider a follow-up." : ""}
            </p>
          </div>
        ) : (
          avg > 0 && (
            <div className="mt-3 rounded-[12px] bg-primary/8 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-primary/70">Spark insight</p>
              <p className="text-[11px] text-foreground mt-0.5">Avg attendance {avg}% so far{late > 0 ? `, ${late} late` : ""}.</p>
            </div>
          )
        )}
      </div>
    );
  }

  // student view
  const schedDur = liveClass?.duration_minutes || 0;
  const pct = schedDur > 0 ? Math.min(100, Math.round((durationSec / 60 / schedDur) * 100)) : durationSec > 0 ? 100 : 0;
  return (
    <div className="rounded-[22px] p-4 glass-card">
      <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5 mb-3">
        <CheckCircle2 className="w-4 h-4 text-success" /> Your attendance
      </p>
      {liveClass?.strict_exam_mode && (
        <div className="flex items-center gap-2 rounded-[12px] bg-destructive/10 px-3 py-2 mb-3">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <p className="text-[11px] font-semibold text-destructive">Strict exam mode — Bud and AI assistance are disabled.</p>
        </div>
      )}
      {joined ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Duration" value={fmtTime(durationSec)} tone="primary" />
            <Stat label="Attendance" value={`${pct}%`} tone="success" />
            <Stat label="Reconnects" value={reconnections} tone="warning" />
          </div>
          <button onClick={onLeave} className="w-full py-2.5 rounded-[14px] bg-destructive/10 text-destructive text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
            <LogOut className="w-3.5 h-3.5" /> Leave class
          </button>
        </>
      ) : (
        <p className="text-[11px] text-muted-foreground/70 text-center py-3">You will be checked in automatically when the class starts.</p>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const tones = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };
  return (
    <div className="rounded-[12px] bg-muted/40 px-2 py-2 text-center">
      <p className={`text-[14px] font-bold ${tones[tone] || "text-foreground"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function Badge({ tone, children }) {
  const tones = { warning: "text-warning bg-warning/10", destructive: "text-destructive bg-destructive/10" };
  return <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tones[tone] || ""}`}>{children}</span>;
}