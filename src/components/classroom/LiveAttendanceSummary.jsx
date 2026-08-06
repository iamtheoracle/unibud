import React from "react";
import { CheckCircle2, Sparkles, Bell } from "lucide-react";

/**
 * LiveAttendanceSummary — shown after a class ends. Displays the post-class
 * attendance summary, confirms the lecturer was notified, and surfaces an
 * inline Spark insight (no separate screen).
 */
export default function LiveAttendanceSummary({ summary, liveClass }) {
  if (!summary) return null;
  const insight =
    (summary.avg_attendance_pct || 0) >= 75
      ? "Engagement was strong this session — consider keeping the current format."
      : (summary.avg_attendance_pct || 0) < 50
      ? "Attendance was low. A reminder nudge before the next class and a short recap note could help."
      : "Attendance was moderate. A quick poll next time can surface what held students back.";

  return (
    <div className="rounded-[22px] p-4 glass-card space-y-3">
      <p className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-success" /> Class summary
      </p>
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Participants" value={summary.participants || 0} />
        <Stat label="Present" value={summary.present || 0} tone="success" />
        <Stat label="Late" value={summary.late || 0} tone="warning" />
        <Stat label="Early exits" value={summary.early_exit || 0} tone="destructive" />
      </div>
      <div className="rounded-[12px] bg-muted/40 px-3 py-2 text-center">
        <p className="text-[20px] font-bold text-primary">{summary.avg_attendance_pct || 0}%</p>
        <p className="text-[10px] text-muted-foreground">average attendance</p>
      </div>
      <div className="flex items-center gap-2 rounded-[12px] bg-success/10 px-3 py-2">
        <Bell className="w-3.5 h-3.5 text-success" />
        <p className="text-[11px] font-medium text-success">Lecturer notified — attendance recorded into academic records.</p>
      </div>
      <div className="rounded-[12px] bg-primary/8 px-3 py-2">
        <p className="text-[10px] font-bold uppercase text-primary/70 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Spark insight</p>
        <p className="text-[11px] text-foreground mt-0.5">{insight}</p>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const tones = { success: "text-success", warning: "text-warning", destructive: "text-destructive" };
  return (
    <div className="rounded-[12px] bg-muted/40 px-2 py-2 text-center">
      <p className={`text-[15px] font-bold ${tones[tone] || "text-foreground"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}