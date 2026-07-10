import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";

function getDaysLabel(dueStr) {
  if (!dueStr) return null;
  const due = new Date(dueStr);
  const now = new Date();
  const diff = due - now;
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 0) return null;
  if (hours < 1) return "due now";
  if (hours < 24) return `in ${hours}h`;
  if (days === 1) return "tomorrow";
  return `in ${days}d`;
}

export default function ProactiveBud({ onAction }) {
  const { isDemoMode } = useDemoMode();
  const [dismissed, setDismissed] = useState([]);

  const { data: assignments } = useQuery({
    queryKey: ["proactive-assignments"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 10),
    enabled: !isDemoMode,
    refetchInterval: 300000,
    retry: false,
  });

  const now = new Date();
  const inTwoDays = new Date(now.getTime() + 48 * 3600000);

  const urgentAssignments = (assignments || [])
    .map((a) => {
      const dueStr = a.due_date || a.deadline || a.date;
      const label = getDaysLabel(dueStr);
      if (!label) return null;
      return { ...a, dueStr, label, sortDate: new Date(dueStr) };
    })
    .filter((a) => a && a.sortDate >= now && a.sortDate <= inTwoDays)
    .sort((a, b) => a.sortDate - b.sortDate);

  const proactiveItems = [
    ...urgentAssignments.map((a) => ({
      id: a.id,
      icon: ClipboardList,
      label: a.label || a.label,
      title: a.title || a.name || "Assignment",
      message: `Assignment due ${a.label}: ${a.title || a.name || "Untitled"}`,
      prompt: `I have an assignment due ${a.label}: "${a.title || a.name || ""}". Help me plan and get it done.`,
      color: "text-warning",
      bg: "bg-warning/10",
    })),
  ];

  const visible = proactiveItems.filter((item) => !dismissed.includes(item.id));
  if (visible.length === 0) return null;

  const next = visible[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="flex flex-col gap-1.5 mb-2 items-end"
      >
        <motion.button
          onClick={() => onAction(next.prompt)}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-full glass spring-tap self-end max-w-[220px]"
        >
          <div className={"w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 " + next.bg}>
            <next.icon className={"w-3.5 h-3.5 " + next.color} strokeWidth={2} />
          </div>
          <span className="text-[11px] font-medium text-foreground leading-snug line-clamp-2 text-left">
            {next.message}
          </span>
        </motion.button>
        <button
          onClick={() => setDismissed((prev) => [...prev, next.id])}
          className="flex items-center gap-1 text-[9px] text-muted-foreground pr-2"
        >
          <X className="w-2.5 h-2.5" />
          Dismiss
        </button>
      </motion.div>
    </AnimatePresence>
  );
}