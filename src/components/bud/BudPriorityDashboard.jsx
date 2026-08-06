import React, { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, Flame, Clock, BookOpen, Pin, PinOff,
  CheckCircle, BellOff, Inbox,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { usePriorityItems } from "@/lib/academic/usePriorityItems";
import { toast } from "@/components/ui/use-toast";
import PriorityQuickActionsFAB from "./PriorityQuickActionsFAB";

const PRIORITY_CONFIG = {
  critical: { label: "Critical", color: "bg-destructive", text: "text-destructive", icon: AlertCircle, dot: "bg-destructive" },
  high: { label: "High", color: "bg-warning", text: "text-warning-foreground", icon: Flame, dot: "bg-warning" },
  medium: { label: "Medium", color: "bg-primary", text: "text-primary", icon: Clock, dot: "bg-primary" },
  low: { label: "Low", color: "bg-muted-foreground", text: "text-muted-foreground", icon: BookOpen, dot: "bg-muted-foreground" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
  { id: "overdue", label: "Overdue" },
];

const SOURCE_ROUTES = {
  assignment: "/assignments",
  exam: "/exams",
  timetable: "/timetable",
  task: "/tasks",
  scholarship: "/scholarships",
  study_session: "/study-sessions",
};

export default function BudPriorityDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, overdue, summary, isOnline } = usePriorityItems();
  const [activeFilter, setActiveFilter] = useState("all");
  const [pinned, setPinned] = useState(new Set());
  const [snoozed, setSnoozed] = useState(new Set());
  const [completed, setCompleted] = useState(new Set());

  const togglePin = useCallback((id) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSnooze = useCallback((id) => {
    setSnoozed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast({ title: "Snoozed", description: "Bud will remind you later" });
  }, []);

  const markComplete = useCallback(async (item) => {
    setCompleted((prev) => new Set(prev).add(item.id));
    try {
      if (item.source === "task") {
        await base44.entities.TaskManagement.update(item.source_id, { status: "completed" });
      }
      await queryClient.invalidateQueries({ queryKey: ["priority"] });
      toast({ title: "Completed", description: item.title });
    } catch {
      setCompleted((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      toast({ title: "Couldn't complete", description: "Please try again" });
    }
  }, [queryClient]);

  const visibleItems = useMemo(() => {
    let list = items.filter((i) => !snoozed.has(i.id) && !completed.has(i.id));
    if (activeFilter === "overdue") return overdue;
    if (activeFilter !== "all") list = list.filter((i) => i.priority === activeFilter);
    // Pinned items always surface first
    return [...list].sort((a, b) => {
      const ap = pinned.has(a.id) ? 0 : 1;
      const bp = pinned.has(b.id) ? 0 : 1;
      return ap - bp;
    });
  }, [items, overdue, activeFilter, pinned, snoozed, completed]);

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <Inbox className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
        <p className="text-[12px] text-muted-foreground">Priority list loads when you're online</p>
        <PriorityQuickActionsFAB />
      </div>
    );
  }

  if (summary.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12">
        <div className="w-14 h-14 rounded-[18px] bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-success" strokeWidth={2} />
        </div>
        <p className="text-[14px] font-bold text-foreground">All clear</p>
        <p className="text-[12px] text-muted-foreground">No pending deadlines or tasks right now</p>
        <PriorityQuickActionsFAB />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-1">
        {summary.critical > 0 && <PriorityPill count={summary.critical} config={PRIORITY_CONFIG.critical} />}
        {summary.high > 0 && <PriorityPill count={summary.high} config={PRIORITY_CONFIG.high} />}
        {summary.medium > 0 && <PriorityPill count={summary.medium} config={PRIORITY_CONFIG.medium} />}
        {summary.overdue > 0 && (
          <div className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-destructive/10">
            <AlertCircle className="w-3 h-3 text-destructive" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-destructive">{summary.overdue} overdue</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
              activeFilter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <p className="text-[12px] text-muted-foreground">No items in this category</p>
            </motion.div>
          ) : (
            visibleItems.map((item) => (
              <PriorityItem
                key={item.id}
                item={item}
                isPinned={pinned.has(item.id)}
                isCompleted={completed.has(item.id)}
                onPin={() => togglePin(item.id)}
                onSnooze={() => toggleSnooze(item.id)}
                onComplete={() => markComplete(item)}
                onClick={() => navigate(SOURCE_ROUTES[item.source] || "/bud")}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <PriorityQuickActionsFAB />
    </div>
  );
}

function PriorityPill({ count, config }) {
  const Icon = config.icon;
  return (
    <div className={`flex items-center gap-1 px-2.5 h-7 rounded-full ${config.color}/10`}>
      <Icon className={`w-3 h-3 ${config.text}`} strokeWidth={2.5} />
      <span className={`text-[11px] font-bold ${config.text}`}>{count}</span>
    </div>
  );
}

function PriorityItem({ item, isPinned, isCompleted, onPin, onSnooze, onComplete, onClick }) {
  const config = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.low;
  const PriorityIcon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[16px] bg-card p-3 ${isPinned ? "ring-1 ring-primary/30" : ""}`}
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start gap-2.5">
        {/* Priority indicator */}
        <div className={`w-9 h-9 rounded-[12px] ${config.color}/10 flex items-center justify-center flex-shrink-0`}>
          <PriorityIcon className={`w-4 h-4 ${config.text}`} strokeWidth={2.2} />
        </div>

        {/* Content */}
        <button onClick={onClick} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[9px] font-bold uppercase tracking-wide ${config.text}`}>{config.label}</span>
            {isPinned && <Pin className="w-2.5 h-2.5 text-primary" strokeWidth={2.5} />}
          </div>
          <p className={`text-[13px] font-bold text-foreground truncate ${isCompleted ? "line-through opacity-50" : ""}`}>
            {item.title}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{item.subtitle || item.source_type}</p>
          {/* Bud's reason */}
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-1 h-1 rounded-full ${config.dot}`} />
            <span className="text-[10px] text-muted-foreground italic">{item.reason}</span>
          </div>
        </button>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={onPin}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center active:scale-90 transition-transform"
          >
            {isPinned ? (
              <PinOff className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            ) : (
              <Pin className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
            )}
          </button>
          <button
            onClick={onSnooze}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center active:scale-90 transition-transform"
          >
            <BellOff className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          </button>
          <button
            onClick={onComplete}
            className="w-7 h-7 rounded-[8px] flex items-center justify-center active:scale-90 transition-transform"
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? "text-success" : "text-muted-foreground"}`} strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}