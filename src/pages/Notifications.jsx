import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, CheckCheck, ChevronRight } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import NotificationCard from "@/components/notifications/NotificationCard";
import { SearchBar, EmptyState } from "@/components/ui";

const TABS = [
  { id: "all", filter: "all", label: "All" },
  { id: "academic", filter: "assignment", label: "Academic" },
  { id: "social", filter: "social", label: "Social" },
  { id: "campus", filter: "campus", label: "Campus" },
  { id: "events", filter: "event", label: "Events" },
  { id: "messages", filter: "community", label: "Messages" },
];

export default function Notifications() {
  const hook = useNotificationCenter();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const all = useMemo(() => hook.sections.flatMap((s) => s.items), [hook.sections]);
  const assignments = all.filter((n) => n.category === "assignment" && !n.is_read).length;
  const announcements = all.filter((n) => n.category === "campus").length;
  const opportunities = all.filter((n) => n.category === "opportunity").length;
  const events = all.filter((n) => n.category === "event").length;
  const budN = all.filter((n) => n.category === "bud").length;

  const searched = search.trim()
    ? all.filter((n) => (n.title + " " + (n.message || "")).toLowerCase().includes(search.toLowerCase()))
    : all;

  const brief = [
    { num: assignments, label: "assignments due" },
    { num: announcements, label: "announcements" },
    { num: hook.unreadCount, label: "unread" },
    { num: opportunities, label: "scholarship deadlines", highlight: opportunities > 0 },
    { num: events, label: "upcoming events" },
    { num: budN, label: "Bud suggestions" },
  ];

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight leading-tight">Notifications</h1>
          {hook.unreadCount > 0 && (
            <p className="text-[13px] text-muted-foreground mt-0.5">{hook.unreadCount} new</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen((s) => !s)} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Search">
            <Search className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={() => hook.markAllRead()} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Mark all read">
            <CheckCheck className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Search (toggle) */}
      {searchOpen && (
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search notifications…" autoFocus />
        </div>
      )}

      {/* AI Daily Brief — editorial section */}
      <Link to="/smart-notifications" className="block spring-tap group mb-6">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Daily Brief</span>
        </div>
        <div className="divide-y divide-border border-t border-b border-border">
          {brief.map((b, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <span className="text-[18px] font-bold text-foreground tabular-nums w-8 shrink-0">{b.num}</span>
              <span className={`text-[14px] flex-1 ${b.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>{b.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 mt-3 text-[13px] text-primary font-medium">
          Open Smart Notifications
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
        </div>
      </Link>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        {TABS.map((t) => {
          const on = !unreadOnly && activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setUnreadOnly(false); hook.setFilter(t.filter); }}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap spring-tap border transition-colors ${on ? "text-foreground border-border bg-muted/40" : "text-muted-foreground border-border/40 bg-transparent hover:bg-muted/20"}`}
            >
              {t.label}
            </button>
          );
        })}
        <button
          onClick={() => { const next = !unreadOnly; setUnreadOnly(next); setActiveTab(next ? "" : "all"); hook.setFilter(next ? "unread" : "all"); }}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap spring-tap border transition-colors ${unreadOnly ? "text-foreground border-border bg-muted/40" : "text-muted-foreground border-border/40 bg-transparent hover:bg-muted/20"}`}
        >
          Unread
        </button>
      </div>

      {/* Preferences link */}
      <Link to="/bud/notifications" className="flex items-center gap-1 text-[12px] text-muted-foreground mb-4 spring-tap hover:text-foreground transition-colors">
        <span>Notification preferences</span>
        <ChevronRight className="w-3 h-3" strokeWidth={1.8} />
      </Link>

      {/* List */}
      {hook.isLoading ? (
        <div className="flex flex-col">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[64px] shimmer" />)}
        </div>
      ) : searched.length === 0 ? (
        <EmptyState
          icon={CheckCheck}
          title="You're all caught up"
          description="Announcements, reminders, and campus updates will appear here."
          budGuidance="Nothing needs your attention right now. A great time for deep work."
        />
      ) : (
        <div className="divide-y divide-border border-t border-b border-border">
          {searched.map((item) => (
            <NotificationCard key={item.id} item={item} onMarkRead={hook.markRead} onTogglePin={hook.togglePin} onArchive={hook.archive} />
          ))}
        </div>
      )}

      {hook.hasMore && (
        <button onClick={hook.loadMore} disabled={hook.isFetching} className="w-full py-3 mt-4 rounded-xl bg-card border border-border text-[13px] font-medium text-muted-foreground spring-tap hover:bg-muted/30 transition-colors">
          {hook.isFetching ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}