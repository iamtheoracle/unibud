import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import SwipeableTaskRow from "@/components/academics/SwipeableTaskRow";

const EASE = [0.16, 1, 0.3, 1];

function getTaskDate(task) {
  if (!task.due_date) return null;
  const d = new Date(task.due_date);
  return isNaN(d.getTime()) ? null : d;
}

function getSection(task, now) {
  const date = getTaskDate(task);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);

  if (task.__pinned) return "Pinned";

  if (date) {
    if (date < today && task.status !== "submitted" && task.status !== "graded") return "Overdue";
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    if (date <= weekEnd) return "This Week";
    return "Upcoming";
  }
  return "Upcoming";
}

const SECTION_ORDER = ["Overdue", "Today", "Tomorrow", "This Week", "Upcoming", "Pinned"];

export default function SmartTaskSections({ tasks, onAction, onContextMenu, completedIds }) {
  const now = new Date();

  const sections = useMemo(() => {
    const grouped = {};
    const completed = [];

    (tasks || []).forEach((t) => {
      if (completedIds.includes(t.id) || t.status === "submitted" || t.status === "graded") {
        completed.push(t);
      } else {
        const sec = getSection(t, now);
        if (!grouped[sec]) grouped[sec] = [];
        grouped[sec].push(t);
      }
    });

    // Sort each section by due date
    Object.keys(grouped).forEach((k) => {
      grouped[k].sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"));
    });

    completed.sort((a, b) => (b.updated_date || "").localeCompare(a.updated_date || ""));

    return { grouped, completed };
  }, [tasks, completedIds, now]);

  return (
    <div>
      {SECTION_ORDER.map((section) => {
        const items = sections.grouped[section];
        if (!items || items.length === 0) return null;
        return (
          <CollapsibleSection key={section} title={section} count={items.length} defaultOpen={section === "Today" || section === "Overdue"}>
            <AnimatePresence>
              {items.map((task, i) => (
                <SwipeableTaskRow
                  key={task.id}
                  task={task}
                  index={i}
                  onAction={onAction}
                  onContextMenu={onContextMenu}
                  completed={completedIds.includes(task.id)}
                />
              ))}
            </AnimatePresence>
          </CollapsibleSection>
        );
      })}

      {sections.completed.length > 0 && (
        <CollapsibleSection title="Completed" count={sections.completed.length} defaultOpen={false}>
          <AnimatePresence>
            {sections.completed.map((task, i) => (
              <SwipeableTaskRow
                key={task.id}
                task={task}
                index={i}
                onAction={onAction}
                onContextMenu={onContextMenu}
                completed={true}
              />
            ))}
          </AnimatePresence>
        </CollapsibleSection>
      )}
    </div>
  );
}

function CollapsibleSection({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-5 spring-tap"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">{title}</h2>
          <span className="text-[11px] text-muted-foreground/40 tabular-nums">{count}</span>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.25, ease: EASE }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.8} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}