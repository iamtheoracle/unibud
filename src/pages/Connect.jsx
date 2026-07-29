import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import OsTopBar from "@/components/layout/OsTopBar";
import ConnectFeed from "@/components/connect/ConnectFeed";

const TABS = [
  { key: "connect", label: "Connect" },
  { key: "messages", label: "Messages" },
  { key: "calls", label: "Calls" },
];

const QUICK = [
  { emoji: "💬", label: "Messages", to: "/messages", active: true },
  { emoji: "📞", label: "Calls", to: null },
  { emoji: "👥", label: "Groups", to: "/study-groups" },
  { emoji: "📁", label: "Files", to: "/knowledge" },
  { emoji: "📅", label: "Calendar", to: "/calendar" },
  { emoji: "📋", label: "Tasks", to: "/tasks" },
];

const DEMO_GROUPS = [
  { id: "g1", name: "Data Science Study Group", members_count: 24, online: 8, meta: "🔥 12 msgs", emoji: "📊" },
  { id: "g2", name: "AI Club Committee", members_count: 12, online: 5, meta: "📌 3 new", emoji: "🤖" },
  { id: "g3", name: "Hostel 5 Residents", members_count: 18, meta: "💬 6", emoji: "🏠" },
];

/**
 * Connect — redesigned communication hub. Greeting top bar, a content-nav
 * (Connect active; Messages routes to the messages page; Calls is visual),
 * the conversation feed (pinned / academic / social / groups / collaboration
 * / Bud AI / connected services), and an adaptive quick-access bar. Groups
 * are wired to real StudyGroup data (demo fallback).
 */
export default function Connect() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const ctx = useUnibudContext();

  const { data: groups } = useQuery({
    queryKey: ["connectGroups"],
    queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }, "-members_count", 10),
    enabled: !isDemoMode,
  });

  const groupList = isDemoMode ? DEMO_GROUPS : (groups || []);

  const onTab = (t) => {
    if (t.key === "messages") navigate("/messages");
    else if (t.key === "calls") return; // calls not supported — visual only
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      <OsTopBar user={ctx.user} />

      {/* Content nav: Connect | Messages | Calls */}
      <div className="flex gap-5 px-1 pb-3 border-b border-border/20">
        {TABS.map((t) => {
          const on = t.key === "connect";
          return (
            <button
              key={t.key}
              onClick={() => onTab(t)}
              className={`relative text-[15px] font-semibold spring-tap pb-1 ${on ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {t.label}
              {on && (
                <span
                  className="absolute -bottom-[9px] left-0 w-full h-[2.5px] rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation feed */}
      <div className="pt-4">
        <ConnectFeed groups={groupList} />
      </div>

      {/* Adaptive quick-access bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-5 pb-2">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => q.to && navigate(q.to)}
            disabled={!q.to}
            className={`px-4 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium whitespace-nowrap spring-tap disabled:opacity-60 ${
              q.active ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground"
            }`}
          >
            <span className="mr-1">{q.emoji}</span>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}