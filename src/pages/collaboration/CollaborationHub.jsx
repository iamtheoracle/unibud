import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft, Sparkles, FolderKanban, LayoutDashboard, Users, LayoutTemplate, ChevronRight } from "lucide-react";
import { useCollaboration } from "@/lib/collaboration/useCollaboration";
import { TEMPLATES } from "@/lib/collaboration/templates";
import WorkspaceCard from "@/components/collaboration/WorkspaceCard";
import WorkspaceComposer from "@/components/collaboration/WorkspaceComposer";
import TemplateGallery from "@/components/collaboration/TemplateGallery";
import CollaborationDashboard from "@/components/collaboration/CollaborationDashboard";
import ToolRecommendationStrip from "@/components/spark/ToolRecommendationStrip";

const TABS = [
  { k: "dashboard", l: "Dashboard", icon: LayoutDashboard },
  { k: "workspaces", l: "Workspaces", icon: Users },
  { k: "templates", l: "Templates", icon: LayoutTemplate },
];

export default function CollaborationHub() {
  const { workspaces, isLoading, create, applyTemplate } = useCollaboration();
  const [tab, setTab] = useState("dashboard");
  const [composing, setComposing] = useState(false);
  const [gallery, setGallery] = useState(false);

  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <div className="flex items-center gap-3 mb-1">
        <Link to="/home" className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-[20px] text-foreground flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-accent" /> Collaboration
          </h1>
          <p className="text-[12px] text-muted-foreground">Shared workspaces, real-time teamwork & academic productivity.</p>
        </div>
      </div>

      <div className="flex gap-1.5 mt-4 mb-4 overflow-x-auto no-scrollbar">
        {TABS.map((t) => { const Icon = t.icon; return (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap spring-tap ${
              tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground/70"}`}>
            <Icon className="w-3.5 h-3.5" /> {t.l}
          </button>
        ); })}
      </div>

      <div className="mb-4">
        <ToolRecommendationStrip
          surface="collaboration"
          context={{
            hasMultipleDeadlines: (workspaces || []).filter((w) => w.due_date).length >= 2,
            teamSize: Math.max(0, ...(workspaces || []).map((w) => (w.members || []).length)),
          }}
        />
      </div>

      {tab === "dashboard" && <CollaborationDashboard />}

      {tab === "workspaces" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Your workspaces</h2>
            <button onClick={() => setComposing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold spring-tap">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[1, 2].map((i) => <div key={i} className="glass-card p-4 h-32 shimmer rounded-3xl" />)}</div>
          ) : workspaces.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No workspaces yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Create one, or start from a template.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setComposing(true)} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold spring-tap">Create</button>
                <button onClick={() => setGallery(true)} className="px-4 py-2 rounded-full bg-accent/15 text-accent text-sm font-semibold spring-tap">Browse templates</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workspaces.map((w) => <WorkspaceCard key={w.id} workspace={w} />)}
            </div>
          )}
        </>
      )}

      {tab === "templates" && (
        <>
          <div className="glass-card p-3.5 flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent"><Sparkles className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">Smart project templates</p>
              <p className="text-[11px] text-muted-foreground">Start fast with ready-made notes, tasks, timelines & milestones.</p>
            </div>
            <button onClick={() => setGallery(true)} className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold spring-tap">Browse all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.slice(0, 8).map((t) => (
              <button key={t.key} onClick={() => setGallery(true)} className="glass-card p-3.5 text-left card-hover">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-sm font-semibold text-foreground truncate">{t.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{t.summary}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-accent font-semibold">Use template <ChevronRight className="w-3 h-3" /></div>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 glass-card p-3.5">
        <p className="text-[11px] font-semibold text-muted-foreground mb-2">Connects with</p>
        <div className="flex gap-2 flex-wrap">
          {[{ l: "Academics", to: "/academics" }, { l: "Connect", to: "/connect" }, { l: "Communities", to: "/communities" }, { l: "Clubs", to: "/clubs" }, { l: "Research", to: "/research" }, { l: "Knowledge", to: "/knowledge" }].map((m) => (
            <Link key={m.l} to={m.to} className="px-2.5 py-1 rounded-full bg-muted/40 text-[11px] font-semibold text-foreground/70 spring-tap">{m.l}</Link>
          ))}
        </div>
      </div>

      <WorkspaceComposer open={composing} onClose={() => setComposing(false)} onCreate={create.mutateAsync} />
      <TemplateGallery open={gallery} onClose={() => setGallery(false)} onApply={(t) => applyTemplate.mutateAsync(t)} />
    </div>
  );
}