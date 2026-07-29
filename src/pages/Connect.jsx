import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUnibudContext } from "@/lib/UnibudContext";
import OsTopBar from "@/components/layout/OsTopBar";
import ConnectMessages from "@/components/connect/ConnectMessages";
import ConnectCalls from "@/components/connect/ConnectCalls";
import ConnectCollaboration from "@/components/connect/ConnectCollaboration";

const TABS = [
  { key: "messages", label: "Messages" },
  { key: "calls", label: "Calls" },
  { key: "collaboration", label: "Collaboration" },
];

const QUICK = [
  { emoji: "💬", label: "Messages", to: "/messages" },
  { emoji: "👥", label: "Groups", to: "/study-groups" },
  { emoji: "📁", label: "Files", to: "/knowledge" },
  { emoji: "📅", label: "Calendar", to: "/calendar" },
  { emoji: "📋", label: "Tasks", to: "/tasks" },
];

/**
 * Connect — communication & collaboration hub. Three content tabs
 * (Messages · Calls · Collaboration) under the OS top bar, with an
 * adaptive quick-access bar. Messages wires groups to real StudyGroup
 * data (demo fallback); Calls/Collaboration surface real routes.
 */
export default function Connect() {
  const navigate = useNavigate();
  const ctx = useUnibudContext();
  const [activeTab, setActiveTab] = useState("messages");

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      <OsTopBar user={ctx.user} />

      <div className="flex gap-5 px-1 pb-3 border-b border-border/20">
        {TABS.map((t) => {
          const on = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
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

      <div className="pt-4">
        {activeTab === "messages" && <ConnectMessages />}
        {activeTab === "calls" && <ConnectCalls />}
        {activeTab === "collaboration" && <ConnectCollaboration />}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-5 pb-2">
        {QUICK.map((q) => (
          <button
            key={q.label}
            onClick={() => q.to && navigate(q.to)}
            className="px-4 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium whitespace-nowrap spring-tap text-muted-foreground"
          >
            <span className="mr-1">{q.emoji}</span>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}