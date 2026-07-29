import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Zap, ChevronRight } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import { useUnibudContext } from "@/lib/UnibudContext";
import NotificationCard from "@/components/notifications/NotificationCard";

const TABS = [
  { id: "all", filter: "all", label: "All" },
  { id: "academic", filter: "assignment", label: "Academic" },
  { id: "social", filter: "social", label: "Social" },
  { id: "wallet", filter: "campus", label: "Wallet" },
  { id: "events", filter: "event", label: "Events" },
  { id: "messages", filter: "community", label: "Messages" },
];

function initials(name) { return name ? name.trim().charAt(0).toUpperCase() : "U"; }

export default function Notifications() {
  const hook = useNotificationCenter();
  const ctx = useUnibudContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
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
    { num: assignments, label: "assignments due this week" },
    { num: announcements, label: "new announcements" },
    { num: hook.unreadCount, label: "unread messages" },
    { num: opportunities, label: "scholarship deadlines", highlight: opportunities > 0 },
    { num: events, label: "upcoming events" },
    { num: budN, label: "Bud suggestions" },
  ];

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      {/* Top bar */}
      <div className="flex justify-between items-center px-1 pt-2 pb-3">
        <h1 className="font-heading font-bold text-[20px] text-foreground tracking-tight">
          Notifications {hook.unreadCount > 0 && <span className="text-[12px] font-normal text-muted-foreground/60">· {hook.unreadCount} new</span>}
        </h1>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setSearchOpen((s) => !s)} className="w-8 h-8 rounded-full glass grid place-items-center spring-tap">
            <Search className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => hook.markAllRead()} className="w-8 h-8 rounded-full glass grid place-items-center spring-tap" aria-label="Mark all read">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/me")} className="w-8 h-8 rounded-full grid place-items-center font-semibold text-[12px] text-primary-foreground spring-tap" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
            {initials(ctx?.user?.full_name)}
          </button>
        </div>
      </div>

      {/* Search (toggle) */}
      {searchOpen && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass border border-border/40 mb-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50" />
        </div>
      )}

      {/* AI Daily Brief */}
      <Link to="/smart-notifications" className="block rounded-2xl p-3.5 mb-3.5 spring-tap" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent)", border: "1px solid hsl(var(--border))" }}>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">📋 AI Daily Brief</p>
        <div className="grid grid-cols-2 gap-1.5">
          {brief.map((b, i) => (
            <div key={i} className="text-[12px] text-muted-foreground flex items-center gap-1.5">
              <span className="font-bold text-foreground">{b.num}</span>
              <span className={b.highlight ? "text-foreground font-semibold" : ""}>{b.label}</span>
            </div>
          ))}
        </div>
      </Link>

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3">
        {TABS.map((t) => {
          const on = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); hook.setFilter(t.filter); }} className={`px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap spring-tap border flex items-center gap-1 ${on ? "text-foreground border-border/40 bg-muted/40" : "text-muted-foreground/60 border-border/20 bg-transparent"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${on ? "bg-foreground" : "bg-muted-foreground/40"}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Preferences */}
      <Link to="/bud/notifications" className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2.5 spring-tap hover:text-foreground">
        <span>Notification preferences</span>
        <ChevronRight className="w-3 h-3" />
      </Link>

      {/* List */}
      {hook.isLoading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[72px] rounded-2xl shimmer" />)}
        </div>
      ) : searched.length === 0 ? (
        <div className="crystal-card p-4">
          <p className="text-[13px] font-semibold text-foreground text-center">No notifications</p>
          <p className="text-[11px] text-muted-foreground text-center mt-1">Announcements, reminders, and campus updates will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {searched.map((item) => (
            <NotificationCard key={item.id} item={item} onMarkRead={hook.markRead} onTogglePin={hook.togglePin} onArchive={hook.archive} />
          ))}
          {hook.hasMore && (
            <button onClick={hook.loadMore} disabled={hook.isFetching} className="w-full py-2.5 rounded-full glass text-[12px] font-semibold text-muted-foreground spring-tap">
              {hook.isFetching ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}