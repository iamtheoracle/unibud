import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Check, CalendarClock, Pencil, Pin, FileText, Bell, Trash2, MoreHorizontal, Flag, Copy, Share, Archive, Eye } from "lucide-react";
import { hapticImpact, hapticSelect } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];
const SWIPE_THRESHOLD = 80;
const COMPLETE_THRESHOLD = 120;

const LEFT_ACTIONS = [
  { id: "reschedule", icon: CalendarClock, label: "Reschedule", color: "text-foreground" },
  { id: "edit", icon: Pencil, label: "Edit", color: "text-foreground" },
  { id: "pin", icon: Pin, label: "Pin", color: "text-foreground" },
  { id: "delete", icon: Trash2, label: "Delete", color: "text-destructive" },
];

const CONTEXT_MENU = [
  { id: "complete", icon: Check, label: "Mark Complete" },
  { id: "important", icon: Flag, label: "Mark Important" },
  { id: "duplicate", icon: Copy, label: "Duplicate" },
  { id: "share", icon: Share, label: "Share" },
  { id: "archive", icon: Archive, label: "Archive" },
  { id: "details", icon: Eye, label: "View Details" },
];

export default function SwipeableTaskRow({ task, index, onAction, onContextMenu, completed }) {
  const x = useMotionValue(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState(false);
  const rowRef = useRef(null);

  // Background opacity for complete (right swipe)
  const completeBg = useTransform(x, [0, COMPLETE_THRESHOLD], [0, 1]);
  // Action reveal for left swipe
  const actionsReveal = useTransform(x, [-120, -40, 0], [1, 0.4, 0]);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;

    if (offset > COMPLETE_THRESHOLD) {
      // Swipe right → complete
      hapticImpact(30);
      setExiting(true);
      setTimeout(() => {
        onAction("complete", task);
      }, 400);
    } else if (offset < -SWIPE_THRESHOLD) {
      // Swipe left → if far enough, trigger first action
      hapticSelect();
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const handleLongPress = (e) => {
    e.preventDefault();
    hapticImpact(25);
    const rect = e.currentTarget.getBoundingClientRect();
    setContextPos({ x: rect.left, y: rect.top });
    setMenuOpen(true);
  };

  const handleContextAction = (actionId) => {
    hapticSelect();
    setMenuOpen(false);
    onContextMenu(actionId, task);
  };

  const statusLabel = task.status === "submitted" ? "Submitted" : task.status === "graded" ? "Graded" : task.status === "in_progress" ? "In Progress" : "Not Started";

  return (
    <>
      <motion.div
        ref={rowRef}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: exiting ? 0.4 : 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative overflow-hidden border-b border-border/15"
      >
        {/* Complete background (right swipe) */}
        <motion.div
          style={{ opacity: completeBg }}
          className="absolute inset-0 flex items-center justify-start px-6"
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center"
          >
            <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Left swipe actions background */}
        <motion.div
          style={{ opacity: actionsReveal }}
          className="absolute inset-0 flex items-center justify-end gap-1 px-4"
        >
          {LEFT_ACTIONS.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => { hapticSelect(); onAction(act.id, task); x.set(0); }}
                className={`w-11 h-11 rounded-full bg-muted/40 flex items-center justify-center ${act.color}`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              </button>
            );
          })}
        </motion.div>

        {/* Main row content */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -200, right: 200 }}
          dragElastic={0.5}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onContextMenu={handleLongPress}
          className="relative bg-background cursor-grab active:cursor-grabbing touch-pan-y"
        >
          <div
            onPointerDown={(e) => {
              // Long press detection
              const timer = setTimeout(() => handleLongPress(e), 500);
              const cancel = () => clearTimeout(timer);
              e.currentTarget.addEventListener("pointerup", cancel, { once: true });
              e.currentTarget.addEventListener("pointermove", cancel, { once: true });
            }}
            className="flex items-start gap-3 px-5 py-3.5"
          >
            {/* Check circle */}
            <button
              onClick={() => { hapticImpact(); onAction("complete", task); }}
              className="mt-0.5 shrink-0"
              aria-label="Complete"
            >
              <div className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all spring-tap ${completed ? "border-success bg-success" : "border-border"}`}>
                {completed && <Check className="w-3 h-3 text-success-foreground" strokeWidth={3} />}
              </div>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-[14px] font-medium text-foreground leading-snug ${completed ? "line-through opacity-50" : ""}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[12px] text-muted-foreground/70 truncate">
                  {task.course_code}{task.course_title ? ` · ${task.course_title}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-muted-foreground/60">
                  {task.due_date ? task.due_date.split("T")[0] : "No due date"}
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[11px] text-muted-foreground/70">{statusLabel}</span>
                {task.priority === "high" && (
                  <>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-[11px] font-medium text-foreground/60">High</span>
                  </>
                )}
              </div>
            </div>

            {/* More button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground/40 spring-tap"
            >
              <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Context menu (long press) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="fixed z-50 left-1/2 -translate-x-1/2 bottom-6 w-full max-w-[360px] px-4"
            >
              <div className="glass-strong rounded-2xl overflow-hidden border border-border/30">
                <div className="px-4 py-3 border-b border-border/20">
                  <p className="text-[13px] font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">{task.course_code}</p>
                </div>
                <div className="py-1">
                  {CONTEXT_MENU.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleContextAction(item.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors spring-tap"
                      >
                        <Icon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.8} />
                        <span className="text-[14px] text-foreground">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-4 py-3.5 border-t border-border/20 text-[14px] font-medium text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}