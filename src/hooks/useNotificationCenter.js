import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getSparkKernel } from "@/lib/spark/namespace";
import { useDemoMode } from "@/lib/DemoModeContext";

const PAGE_INCREMENT = 40;
const INITIAL_LIMIT = 40;

const DEMO_NOTIFICATIONS = [
  { id: "d1", title: "Assignment Due Tomorrow", message: "Data Structures Assignment 3 is due in 24 hours", type: "academic", category: "assignment", priority: "high", is_read: false, created_date: new Date(Date.now() - 36e5).toISOString(), link: "/assignments" },
  { id: "d2", title: "Scholarship Available", message: "Africa Merit Scholarship 2026 — you may be eligible", type: "opportunity", category: "opportunity", priority: "high", is_read: false, created_date: new Date(Date.now() - 3 * 36e5).toISOString(), link: "/scholarships" },
  { id: "d3", title: "New connection", message: "Chioma Eze wants to connect with you", type: "social", category: "social", priority: "normal", is_read: false, created_date: new Date(Date.now() - 5 * 36e5).toISOString(), link: "/connect" },
  { id: "d4", title: "Bud suggestion", message: "You've studied Algorithms 3 days this week — try a mixed review session.", type: "bud", category: "bud", priority: "silent", is_read: true, created_date: new Date(Date.now() - 8 * 36e5).toISOString(), link: "/bud" },
  { id: "d5", title: "Study streak", message: "You've maintained a 5-day study streak", type: "achievement", category: "achievement", priority: "silent", is_read: true, created_date: new Date(Date.now() - 26 * 36e5).toISOString(), link: "/me" },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function useNotificationCenter() {
  const qc = useQueryClient();
  const { isDemoMode } = useDemoMode();
  const [filter, setFilter] = useState("all");
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const engine = getSparkKernel().notifications;

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => base44.entities.Notification.list("-created_date", limit),
    enabled: !isDemoMode,
  });

  // Real-time subscription — instant updates, no refresh.
  useEffect(() => {
    if (isDemoMode) return;
    const unsub = base44.entities.Notification.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    });
    return unsub;
  }, [isDemoMode, qc]);

  const raw = isDemoMode ? DEMO_NOTIFICATIONS : (data || []);
  const visible = useMemo(() => {
    const uid = user?.id;
    return raw.filter((n) => !n.user_id || n.user_id === uid || isDemoMode);
  }, [raw, user, isDemoMode]);

  // Apply the active filter.
  const filtered = useMemo(() => {
    switch (filter) {
      case "unread": return visible.filter((n) => !n.is_read && !n.archived && !n.dismissed);
      case "pinned": return visible.filter((n) => n.pinned);
      case "archived": return visible.filter((n) => n.archived);
      case "all": return visible.filter((n) => !n.archived && !n.dismissed);
      default: return visible.filter((n) => n.category === filter && !n.archived && !n.dismissed);
    }
  }, [visible, filter]);

  // Merge repetitive notifications sharing a batch_key within the view.
  const merged = useMemo(() => {
    const groups = new Map();
    const out = [];
    for (const n of filtered) {
      if (!n.batch_key) { out.push(n); continue; }
      const existing = groups.get(n.batch_key);
      if (existing) {
        existing._mergedCount = (existing._mergedCount || existing.batch_count || 1) + (n.batch_count || 1);
      } else {
        n._mergedCount = n.batch_count || 1;
        groups.set(n.batch_key, n);
        out.push(n);
      }
    }
    return out;
  }, [filtered]);

  const unreadCount = useMemo(
    () => visible.filter((n) => !n.is_read && !n.archived && !n.dismissed).length,
    [visible]
  );

  // Group into time sections: Pinned first, then Today / Yesterday / This Week / Older.
  const sections = useMemo(() => {
    const now = startOfDay(new Date());
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const pinned = [];
    const today = [];
    const yest = [];
    const week = [];
    const older = [];
    for (const n of merged) {
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
  }, [merged]);

  const markRead = useCallback(async (n) => {
    if (isDemoMode || n.is_read) return;
    engine.track("opened", n.id, { group: n.category });
    qc.setQueryData(["notifications", limit], (old = []) =>
      old.map((x) => (x.id === n.id ? { ...x, is_read: true, read_at: new Date().toISOString() } : x))
    );
    try {
      await base44.entities.Notification.update(n.id, { is_read: true, read_at: new Date().toISOString(), opened_at: new Date().toISOString() });
    } catch { /* offline — local state already updated */ }
  }, [isDemoMode, limit, qc, engine]);

  const markAllRead = useCallback(async () => {
    const unread = visible.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    qc.setQueryData(["notifications", limit], (old = []) => old.map((x) => ({ ...x, is_read: true })));
    try {
      await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, is_read: true })));
    } catch { /* offline */ }
  }, [visible, limit, qc]);

  const togglePin = useCallback(async (n) => {
    qc.setQueryData(["notifications", limit], (old = []) => old.map((x) => (x.id === n.id ? { ...x, pinned: !x.pinned } : x)));
    try { await base44.entities.Notification.update(n.id, { pinned: !n.pinned }); } catch {}
  }, [limit, qc]);

  const archive = useCallback(async (n) => {
    engine.track("dismissed", n.id, { group: n.category });
    qc.setQueryData(["notifications", limit], (old = []) => old.map((x) => (x.id === n.id ? { ...x, archived: true, dismissed: true } : x)));
    try { await base44.entities.Notification.update(n.id, { archived: true, dismissed: true }); } catch {}
  }, [limit, qc, engine]);

  const loadMore = useCallback(() => setLimit((l) => l + PAGE_INCREMENT), []);
  const hasMore = !isDemoMode && (data?.length || 0) >= limit;

  return {
    sections, unreadCount, filter, setFilter, isLoading, isFetching,
    markRead, markAllRead, togglePin, archive, loadMore, hasMore, isDemoMode,
    analytics: engine.analytics(),
  };
}