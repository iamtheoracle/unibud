import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCheck, ChevronRight, Clock, Layers, Inbox, Bell } from "lucide-react";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import NotificationTimeline from "@/components/notifications/NotificationTimeline";
import { CATEGORY_GROUPS, PRIORITY_FILTERS } from "@/components/notifications/icons";
import EmptyState from "@/components/ui/EmptyState";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Group notifications by time section (Pinned → Today → Yesterday → This Week → Older). */
function groupByTime(items) {
  const now = startOfDay(new Date());
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const pinned = [], today = [], yest = [], week = [], older = [];
  for (const n of items) {
    if (n.pinned) { pinned.push(n); continue; }
    const d = n.created_date ? new Date(n.created_date) : new Date(0);
    if (d >= now) today.push(n);
    else if (d >= yesterday) yest.push(n);
    else if (d >= weekAgo) week.push(n);
    else older.push(n);
  }
  const result = [];
  if (pinned.length) result.push({ key: "pinned", label: "Pinned", items: pinned });
  if (today.length) result.push({ key: "today", label: "Today", items: today });
  if (yest.length) result.push({ key: "yesterday", label: "Yesterday", items: yest });
  if (week.length) result.push({ key: "week", label: "This Week", items: week });
  if (older.length) result.push({ key: "older", label: "Older", items: older });
  return result;
}

/** Group notifications by category domain (Academic, Social, Connect, etc.). */
function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    let groupKey = null;
    for (const [key, config] of Object.entries(CATEGORY_GROUPS)) {
      if (key === "all") continue;
      if (config.cats.includes(item.category) || config.cats.includes(item.type)) {
        groupKey = key;
        break;
      }
    }
    if (!groupKey) groupKey = "other";
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
  }
  const order = ["academic", "social", "connect", "marketplace", "events", "wallet", "bud", "other"];
  return order
    .filter((k) => groups[k]?.length > 0)
    .map((k) => ({
      key: k,
      label: CATEGORY_GROUPS[k]?.label || "Other",
      items: groups[k],
    }));
}

export default function Notifications() {
  const hook = useNotificationCenter();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activePriority, setActivePriority] = useState("all");
  const [groupMode, setGroupMode] = useState("time");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Flatten all items from the hook's sections
  const all = useMemo(() => hook.sections.flatMap((s) => s.items), [hook.sections]);

  // Stats per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const [key, config] of Object.entries(CATEGORY_GROUPS)) {
      if (key === "all") { counts.all = all.length; continue; }
      counts[key] = all.filter((n) => config.cats.includes(n.category) || config.cats.includes(n.type)).length;
    }
    return counts;
  }, [all]);

  // Priority counts
  const priorityCounts = useMemo(() => {
    const counts = { all: all.length };
    for (const p of ["critical", "high", "normal", "low"]) {
      counts[p] = all.filter((n) => n.priority === p).length;
    }
    return counts;
  }, [all]);

  // Apply category filter
  const catFiltered = useMemo(() => {
    if (activeCategory === "all") return all;
    const config = CATEGORY_GROUPS[activeCategory];
    if (!config) return all;
    return all.filter((n) => config.cats.includes(n.category) || config.cats.includes(n.type));
  }, [all, activeCategory]);

  // Apply priority filter
  const priFiltered = useMemo(() => {
    if (activePriority === "all") return catFiltered;
    return catFiltered.filter((n) => n.priority === activePriority);
  }, [catFiltered, activePriority]);

  // Apply search
  const searched = useMemo(() => {
    if (!search.trim()) return priFiltered;
    const q = search.toLowerCase();
    return priFiltered.filter((n) =>
      (n.title || "").toLowerCase().includes(q) ||
      (n.message || "").toLowerCase().includes(q)
    );
  }, [priFiltered, search]);

  // Group by time or category
  const grouped = useMemo(() => {
    if (groupMode === "category") return groupByCategory(searched);
    return groupByTime(searched);
  }, [searched, groupMode]);

  const handleCategory = useCallback((key) => {
    setActiveCategory(key);
    hook.setFilter("all");
  }, [hook]);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-[24px] font-bold text-foreground tracking-tight leading-tight">Notifications</h1>
          {hook.unreadCount > 0 ? (
            <p className="text-[12px] text-primary font-medium mt-0.5">{hook.unreadCount} unread</p>
          ) : (
            <p className="text-[12px] text-muted-foreground mt-0.5">All caught up</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen((s) => !s)} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="Search">
            <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          </button>
          {hook.unreadCount > 0 && (
            <button onClick={() => hook.markAllRead()} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="Mark all read">
              <CheckCheck className="w-4 h-4 text-primary" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl glass-card">
              <Search className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications…" className="flex-1 bg-transparent text-[13px] text-foreground outline-none" autoFocus />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Priority filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2">
        {PRIORITY_FILTERS.map((p) => {
          const count = priorityCounts[p.key] || 0;
          const active = activePriority === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setActivePriority(p.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap spring-tap flex items-center gap-1 transition-all ${
                active
                  ? p.key === "critical" ? "bg-destructive text-destructive-foreground"
                    : p.key === "high" ? "bg-warning text-warning-foreground"
                    : "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {p.label}
              {count > 0 && p.key !== "all" && (
                <span className={`px-1 rounded-full text-[8px] ${active ? "bg-black/20" : "bg-muted/40"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
        {Object.entries(CATEGORY_GROUPS).map(([key, config]) => {
          const count = categoryCounts[key] || 0;
          const active = activeCategory === key;
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => handleCategory(key)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap flex items-center gap-1.5 transition-all ${
                active ? "bg-foreground text-background" : "glass-card text-muted-foreground"
              }`}
            >
              <Icon className="w-3 h-3" strokeWidth={2} />
              {config.label}
              {count > 0 && (
                <span className={`px-1 rounded-full text-[8px] ${active ? "bg-white/20" : "bg-muted/40"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Group mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 p-0.5 bg-muted/40 rounded-full">
          <button onClick={() => setGroupMode("time")} className={`px-3 py-1 rounded-full text-[10px] font-bold spring-tap flex items-center gap-1 ${groupMode === "time" ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
            <Clock className="w-3 h-3" /> By Time
          </button>
          <button onClick={() => setGroupMode("category")} className={`px-3 py-1 rounded-full text-[10px] font-bold spring-tap flex items-center gap-1 ${groupMode === "category" ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
            <Layers className="w-3 h-3" /> By Category
          </button>
        </div>
        <Link to="/bud/notifications" className="text-[10px] text-muted-foreground spring-tap flex items-center gap-0.5">
          Preferences <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Timeline */}
      {hook.isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[80px] rounded-[18px] shimmer" />)}
        </div>
      ) : grouped.length === 0 || grouped.every((s) => s.items.length === 0) ? (
        <div className="bg-card rounded-[20px] border border-border/40">
          <EmptyState
            icon={Inbox}
            title={search ? "No results" : "You're all caught up"}
            description={search ? "Try a different search term" : "Academic, social, and campus updates will appear here in one timeline."}
            budGuidance={search ? undefined : "Nothing needs your attention right now. A great time for deep work."}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {grouped.map((section) => (
              <div key={section.key}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
                  {section.label}
                  <span className="text-muted-foreground/50 normal-case font-medium">· {section.items.length}</span>
                </p>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {section.items.map((item) => (
                      <NotificationTimeline
                        key={item.id}
                        item={item}
                        onMarkRead={hook.markRead}
                        onTogglePin={hook.togglePin}
                        onArchive={hook.archive}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </AnimatePresence>

          {hook.hasMore && (
            <button onClick={hook.loadMore} disabled={hook.isFetching} className="w-full py-2.5 rounded-full glass-card text-[12px] font-semibold text-muted-foreground spring-tap flex items-center justify-center gap-2">
              {hook.isFetching ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}

      {/* Smart Notifications link */}
      <Link to="/smart-notifications" className="mt-5 flex items-center justify-between p-3.5 rounded-[16px] glass-card spring-tap group">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-primary to-chocolate flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[12px] font-bold text-foreground">Smart Daily Brief</p>
            <p className="text-[10px] text-muted-foreground">AI-prioritized summary of your day</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}