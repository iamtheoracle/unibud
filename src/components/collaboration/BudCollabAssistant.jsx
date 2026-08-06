import React, { useState } from "react";
import { Sparkles, X, Loader2, ListChecks, Activity as ActivityIcon, ClipboardList, CalendarClock, BookOpen } from "lucide-react";
import { recommendNextActions, summarizeActivity, createStudyPlan, generateMeetingSummary, suggestResources } from "@/lib/collaboration/collabEngine";

/** BudCollabAssistant — Bud helps coordinate a workspace. Never acts automatically. */
export default function BudCollabAssistant({ open, onClose, workspace, items, activity }) {
  const [tab, setTab] = useState("next");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [goal, setGoal] = useState("");
  const [agenda, setAgenda] = useState("");

  if (!open) return null;

  const tabs = [
    { k: "next", l: "Next actions", icon: ListChecks },
    { k: "summary", l: "Activity", icon: ActivityIcon },
    { k: "plan", l: "Study plan", icon: ClipboardList },
    { k: "meeting", l: "Meeting", icon: CalendarClock },
    { k: "resources", l: "Resources", icon: BookOpen },
  ];

  const run = async () => {
    setBusy(true); setOut(null);
    try {
      if (tab === "next") setOut({ kind: "actions", data: await recommendNextActions(workspace, items, activity) });
      else if (tab === "summary") setOut({ kind: "summary", data: await summarizeActivity(activity, workspace) });
      else if (tab === "plan") setOut({ kind: "plan", data: await createStudyPlan(workspace, goal, 4) });
      else if (tab === "meeting") setOut({ kind: "meeting", data: await generateMeetingSummary(workspace, agenda, (items || []).map((i) => i.title).join(", ")) });
      else if (tab === "resources") setOut({ kind: "resources", data: await suggestResources(workspace, items) });
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[520px] glass-strong rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" /><h2 className="text-base font-bold text-foreground">Bud · Workspace help</h2></div>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Helping with "{workspace?.title}". Bud never acts on your behalf.</p>

        <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {tabs.map((t) => { const Icon = t.icon; return (
            <button key={t.k} onClick={() => { setTab(t.k); setOut(null); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70"}`}>
              <Icon className="w-3 h-3" /> {t.l}
            </button>
          ); })}
        </div>

        {(tab === "plan") && <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Study goal (e.g. pass MTH201 finals)" className="w-full oracle-input mb-3" />}
        {(tab === "meeting") && <input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder="Meeting agenda" className="w-full oracle-input mb-3" />}

        <button onClick={run} disabled={busy}
          className="w-full bg-accent text-accent-foreground rounded-xl py-2.5 text-sm font-semibold spring-tap disabled:opacity-40 flex items-center justify-center gap-2 mb-3">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate
        </button>

        {out?.kind === "actions" && (
          <div className="space-y-2">{(out.data || []).map((a, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/40">
              <p className="text-sm text-foreground">{a.action}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{a.priority} priority · {a.owner_hint || "anyone"}</p>
            </div>
          ))}</div>
        )}
        {out?.kind === "summary" && (
          <div className="space-y-2">
            <p className="text-sm text-foreground">{out.data.summary}</p>
            {out.data.highlights?.length > 0 && <p className="text-[11px] font-semibold text-muted-foreground mt-2">Highlights</p>}
            {out.data.highlights?.map((h, i) => <p key={i} className="text-xs text-foreground/80">• {h}</p>)}
            {out.data.attention?.length > 0 && <p className="text-[11px] font-semibold text-warning mt-2">Needs attention</p>}
            {out.data.attention?.map((h, i) => <p key={i} className="text-xs text-foreground/80">• {h}</p>)}
            <p className="text-[10px] text-accent mt-2">Momentum: {out.data.momentum}</p>
          </div>
        )}
        {out?.kind === "plan" && (
          <div className="space-y-2">{(out.data || []).map((w, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/40">
              <p className="text-xs font-semibold text-foreground">Week {w.week} · {w.focus}</p>
              <ul className="text-xs text-foreground/80 list-disc pl-4 mt-1">{(w.items || []).map((it, j) => <li key={j}>{it}</li>)}</ul>
            </div>
          ))}</div>
        )}
        {out?.kind === "meeting" && (
          <div className="space-y-2">
            <p className="text-sm text-foreground">{out.data.summary}</p>
            {out.data.decisions?.length > 0 && <p className="text-[11px] font-semibold text-muted-foreground mt-2">Decisions</p>}
            {out.data.decisions?.map((d, i) => <p key={i} className="text-xs text-foreground/80">• {d}</p>)}
            {out.data.action_items?.length > 0 && <p className="text-[11px] font-semibold text-muted-foreground mt-2">Action items</p>}
            {out.data.action_items?.map((a, i) => <p key={i} className="text-xs text-foreground/80">• {a.item} — {a.owner}</p>)}
          </div>
        )}
        {out?.kind === "resources" && (
          <div className="space-y-2">{(out.data || []).map((r, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/40">
              <p className="text-sm font-semibold text-foreground">{r.title} <span className="text-[10px] text-accent">({r.type})</span></p>
              <p className="text-[11px] text-muted-foreground">{r.why}</p>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}