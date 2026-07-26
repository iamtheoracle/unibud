import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, ArrowLeft, Sparkles, FolderKanban } from "lucide-react";
import { useCollaboration } from "@/lib/collaboration/useCollaboration";
import WorkspaceCard from "@/components/collaboration/WorkspaceCard";
import WorkspaceComposer from "@/components/collaboration/WorkspaceComposer";

export default function CollaborationHub() {
  const { user, workspaces, isLoading, create } = useCollaboration();
  const [composing, setComposing] = useState(false);

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
          <p className="text-[12px] text-muted-foreground">Shared workspaces for teams, classes & communities.</p>
        </div>
      </div>

      <div className="glass-card p-3.5 mt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center text-accent"><Sparkles className="w-5 h-5" /></div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Spark coordinates your teamwork</p>
          <p className="text-[11px] text-muted-foreground">Recommends teammates, detects blockers, summarizes activity & suggests next actions.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 mb-3">
        <h2 className="text-sm font-bold text-foreground">Your workspaces</h2>
        <button onClick={() => setComposing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold spring-tap">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => <div key={i} className="glass-card p-4 h-32 shimmer rounded-3xl" />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No workspaces yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Create a shared workspace for a project, study group, club or community.</p>
          <button onClick={() => setComposing(true)} className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold spring-tap">Create workspace</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workspaces.map((w) => <WorkspaceCard key={w.id} workspace={w} />)}
        </div>
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
    </div>
  );
}