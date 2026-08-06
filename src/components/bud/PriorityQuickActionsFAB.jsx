import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, X, CheckSquare, FileText, Bell, Clock, Timer, StickyNote } from "lucide-react";

const SPRING = { type: "spring", stiffness: 400, damping: 32 };

const ACTIONS = [
  { id: "task", label: "New Task", icon: CheckSquare, route: "/tasks" },
  { id: "assignment", label: "Assignment", icon: FileText, route: "/assignments" },
  { id: "reminder", label: "Reminder", icon: Bell, route: "/bud/notifications" },
  { id: "study", label: "Study Session", icon: Clock, route: "/study-sessions" },
  { id: "focus", label: "Focus Timer", icon: Timer, route: "/study" },
  { id: "note", label: "Quick Note", icon: StickyNote, route: "/notes" },
];

/**
 * PriorityQuickActionsFAB — floating action button for the Priority Dashboard.
 * Uses Liquid Glass + Ambient Lighting System. Never blocks content.
 * Opens a clean bottom sheet with 6 quick-create actions.
 */
export default function PriorityQuickActionsFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (route) => {
    setOpen(false);
    setTimeout(() => navigate(route), 200);
  };

  return (
    <>
      {/* FAB — liquid glass with ambient under-light */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.3 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full liquid-mirror flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Quick actions — create task, assignment, reminder, study session, focus timer, or note"
      >
        {/* Ambient under-light — soft orange glow */}
        <span className="absolute -bottom-3 left-2 right-2 h-6 rounded-full bg-primary/20 blur-xl pointer-events-none" />
        {/* Glass reflection — top specular catch */}
        <span className="absolute top-0 left-[20%] right-[20%] h-px bg-white/30 rounded-full pointer-events-none" />
        {/* Glass surface reflection */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/8 via-transparent to-transparent pointer-events-none" />
        <Plus className="relative w-6 h-6 text-foreground spring-tap" strokeWidth={2.2} />
      </motion.button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] glass-strong adaptive-safe-bottom"
              role="dialog"
              aria-modal="true"
              aria-label="Quick actions"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-5" />

              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[16px] font-bold text-foreground">Quick Actions</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center spring-tap"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 pb-2">
                {ACTIONS.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, type: "spring", stiffness: 400, damping: 28 }}
                    onClick={() => handleAction(action.route)}
                    className="flex flex-col items-center gap-2 p-4 rounded-[18px] glass-card spring-tap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={action.label}
                  >
                    <div className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}