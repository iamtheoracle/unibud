import React, { useMemo } from "react";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { computeProgress, detectBlockers } from "@/lib/collaboration/collabEngine";

const TYPE_LABEL = { task: "Tasks", note: "Notes", document: "Docs", whiteboard: "Whiteboards", checklist: "Checklists", study_plan: "Study Plans", file: "Files" };

export default function CollabAnalytics({ items, activity, members }) {
  const progress = useMemo(() => computeProgress(items), [items]);
  const blockers = useMemo(() => detectBlockers(items), [items]);
  const done = (items || []).filter((i) => i.status === "done" || i.status === "approved").length;
  const overdue = blockers.filter((b) => b.reason.includes("Overdue")).length;
  const byType = useMemo(() => {
    const map = {};
    (items || []).forEach((i) => { map[i.type] = (map[i.type] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);
  const byStatus = useMemo(() => {
    const map = {};
    (items || []).forEach((i) => { map[i.status] = (map[i.status] || 0) + 1; });
    return map;
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={CheckCircle2} label="Completed" value={done} tone="success" />
        <Stat icon={AlertTriangle} label="Blockers" value={blockers.length} tone="error" />
        <Stat icon={Clock} label="Overdue" value={overdue} tone="warning" />
        <Stat icon={TrendingUp} label="Progress" value={`${progress}%`} tone="information" />
      </div>

      <div className="glass-card p-4">
        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-3"><BarChart3 className="w-3.5 h-3.5" /> Items by type</p>
        <div className="space-y-2">
          {byType.length === 0 && <p className="text-xs text-muted-foreground">No items yet.</p>}
          {byType.map(([t, n]) => {
            const max = byType[0][1];
            return (
              <div key={t} className="flex items-center gap-2">
                <span className="text-[11px] text-foreground/70 w-20 truncate">{TYPE_LABEL[t] || t}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(n / max) * 100}%` }} />
                </div>
                <span className="text-[11px] font-semibold text-foreground w-5 text-right">{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      {blockers.length > 0 && (
        <div className="glass-card p-4 border border-error/20">
          <p className="text-xs font-semibold text-error flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5" /> Blockers detected</p>
          {blockers.slice(0, 5).map((b, i) => (
            <div key={i} className="text-xs text-foreground/80 py-1 flex justify-between">
              <span className="truncate">{b.item.title}</span>
              <span className="text-muted-foreground text-[10px] shrink-0 ml-2">{b.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = { success: "bg-success/12 text-success", error: "bg-error/12 text-error", warning: "bg-warning/12 text-warning", information: "bg-information/12 text-information" };
  return (
    <div className="glass-card p-3.5">
      <div className={`w-8 h-8 rounded-lg ${tones[tone]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}