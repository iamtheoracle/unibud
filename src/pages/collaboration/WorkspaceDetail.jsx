import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Wand2, Loader2, CalendarDays } from "lucide-react";
import { useWorkspace } from "@/lib/collaboration/useWorkspace";
import { usePresence } from "@/lib/collaboration/usePresence";
import { computeProgress } from "@/lib/collaboration/collabEngine";
import ItemCard from "@/components/collaboration/ItemCard";
import ItemComposer from "@/components/collaboration/ItemComposer";
import ItemDetailDrawer from "@/components/collaboration/ItemDetailDrawer";
import ActivityTimeline from "@/components/collaboration/ActivityTimeline";
import MemberRoster from "@/components/collaboration/MemberRoster";
import ProgressDashboard from "@/components/collaboration/ProgressDashboard";
import UnifiedTimeline from "@/components/collaboration/UnifiedTimeline";
import PresenceIndicator from "@/components/collaboration/PresenceIndicator";
import BudCollabAssistant from "@/components/collaboration/BudCollabAssistant";

const TYPE_FILTERS = [
  { v: "all", l: "All" }, { v: "task", l: "Tasks" }, { v: "note", l: "Notes" },
  { v: "document", l: "Docs" }, { v: "checklist", l: "Checklists" },
  { v: "study_plan", l: "Study Plans" }, { v: "whiteboard", l: "Whiteboards" },
];

const TABS = [
  { k: "board", l: "Board" }, { k: "progress", l: "Progress" },
  { k: "timeline", l: "Timeline" }, { k: "activity", l: "Activity" },
  { k: "members", l: "Members" },
];

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const { user, workspace, items, activity, memberIds, createItem, updateItem, deleteItem, saveVersion, addMember, updateMemberRole } = useWorkspace(workspaceId);
  const { active, heartbeat } = usePresence(workspaceId, user, memberIds);

  const [tab, setTab] = useState("board");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [budOpen, setBudOpen] = useState(false);

  const progress = useMemo(() => computeProgress(items), [items]);
  const filtered = useMemo(() => (filter === "all" ? items : items.filter((i) => i.type === filter)), [items, filter]);

  // Heartbeat presence while viewing the workspace; mark editing when an item is open.
  useEffect(() => {
    if (!user || !workspaceId) return;
    const id = setInterval(() => heartbeat("active"), 25000);
    heartbeat("viewing");
    const onVis = () => { if (document.visibilityState === "visible") heartbeat("active"); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [user, workspaceId]);

  useEffect(() => { if (selected) heartbeat("editing", selected.id, selected.title); else heartbeat("viewing"); }, [selected]);

  if (!workspace) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <div className="flex items-center gap-3 mb-3">
        <Link to="/collaboration" className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading font-bold text-[18px] text-foreground truncate">{workspace.title}</h1>
          <p className="text-[11px] text-muted-foreground capitalize">{workspace.type.replace("_", " ")} · {workspace.status}</p>
        </div>
      </div>

      {workspace.description && <p className="text-xs text-muted-foreground mb-2">{workspace.description}</p>}

      {active.length > 0 && (
        <div className="mb-3"><PresenceIndicator active={active} /></div>
      )}

      <div className="glass-card p-3.5 mb-4 flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress * 0.94} 94`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground">{progress}%</span>
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-muted-foreground">Progress</p>
          <p className="text-sm font-semibold text-foreground">{items.length} items · {(workspace.members || []).length} members</p>
        </div>
        {workspace.due_date && <div className="text-right"><p className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Due</p><p className="text-xs font-semibold text-foreground">{workspace.due_date}</p></div>}
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap spring-tap ${
              tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70"}`}>{t.l}</button>
        ))}
      </div>

      {tab === "board" && (
        <>
          <div className="flex gap-1.5 mb-3 overflow-x-auto no-scrollbar">
            {TYPE_FILTERS.map((f) => (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
                  filter === f.v ? "bg-accent/15 text-accent" : "bg-muted/40 text-foreground/60"}`}>{f.l}</button>
            ))}
          </div>
          <div className="mb-3"><ItemComposer onCreated={createItem.mutateAsync} members={workspace.members || []} /></div>
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No {filter === "all" ? "items" : filter + "s"} yet.</p>
            ) : filtered.map((it) => <ItemCard key={it.id} item={it} onOpen={setSelected} />)}
          </div>
        </>
      )}

      {tab === "progress" && <ProgressDashboard workspace={workspace} items={items} activity={activity} members={workspace.members || []} />}
      {tab === "timeline" && <UnifiedTimeline workspaceId={workspaceId} />}
      {tab === "activity" && <ActivityTimeline activity={activity} />}
      {tab === "members" && <MemberRoster workspace={workspace} members={workspace.members || []} user={user} onAddMember={addMember.mutateAsync} onUpdateRole={updateMemberRole.mutateAsync} />}

      <button onClick={() => setBudOpen(true)}
        className="fixed right-4 z-40 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center spring-tap glow-pulse"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}>
        <Wand2 className="w-5 h-5" />
      </button>

      {selected && (
        <ItemDetailDrawer item={selected} workspaceId={workspaceId} memberIds={memberIds} members={workspace.members || []} user={user}
          onClose={() => setSelected(null)} onUpdate={updateItem.mutateAsync} onDelete={deleteItem.mutateAsync} onSaveVersion={saveVersion} />
      )}
      <BudCollabAssistant open={budOpen} onClose={() => setBudOpen(false)} workspace={workspace} items={items} activity={activity} />
    </div>
  );
}