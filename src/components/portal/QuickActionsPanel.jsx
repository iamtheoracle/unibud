import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Megaphone, CalendarPlus, Upload, Video,
  UsersRound, ListChecks, BarChart3, X, Zap, Keyboard,
} from "lucide-react";
import NewAssignmentForm from "@/components/portal/quick-actions/NewAssignmentForm";
import NewAnnouncementForm from "@/components/portal/quick-actions/NewAnnouncementForm";
import NewAcademicEventForm from "@/components/portal/quick-actions/NewAcademicEventForm";
import UploadMaterialsForm from "@/components/portal/quick-actions/UploadMaterialsForm";
import StartLiveClassForm from "@/components/portal/quick-actions/StartLiveClassForm";
import CreateStudyGroupForm from "@/components/portal/quick-actions/CreateStudyGroupForm";
import PendingTasksPanel from "@/components/portal/quick-actions/PendingTasksPanel";
import StudentInsightsPanel from "@/components/portal/quick-actions/StudentInsightsPanel";

const ACTIONS = [
  { id: "assignment", label: "New Assignment", icon: ClipboardList, shortcut: "A", accent: "bg-warning/10 text-warning" },
  { id: "announcement", label: "New Announcement", icon: Megaphone, shortcut: "N", accent: "bg-info/10 text-info" },
  { id: "event", label: "New Academic Event", icon: CalendarPlus, shortcut: "E", accent: "bg-primary/10 text-primary" },
  { id: "upload", label: "Upload Materials", icon: Upload, shortcut: "U", accent: "bg-success/10 text-success" },
  { id: "live", label: "Start Live Class", icon: Video, shortcut: "L", accent: "bg-error/10 text-error" },
  { id: "study_group", label: "Create Study Group", icon: UsersRound, shortcut: "G", accent: "bg-purple/10 text-purple" },
  { id: "pending", label: "Pending Tasks", icon: ListChecks, shortcut: "T", accent: "bg-warning/10 text-warning" },
  { id: "insights", label: "Student Insights", icon: BarChart3, shortcut: "I", accent: "bg-info/10 text-info" },
];

const FORM_MAP = {
  assignment: NewAssignmentForm,
  announcement: NewAnnouncementForm,
  event: NewAcademicEventForm,
  upload: UploadMaterialsForm,
  live: StartLiveClassForm,
  study_group: CreateStudyGroupForm,
  pending: PendingTasksPanel,
  insights: StudentInsightsPanel,
};

const TITLES = {
  assignment: "New Assignment",
  announcement: "New Announcement",
  event: "New Academic Event",
  upload: "Upload Lecture Materials",
  live: "Start Live Class",
  study_group: "Create Study Group",
  pending: "Pending Tasks",
  insights: "Student Insights",
};

export default function QuickActionsPanel({ user }) {
  const [activeAction, setActiveAction] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleKeydown = useCallback((e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const key = e.key.toUpperCase();
      const action = ACTIONS.find((a) => a.shortcut === key);
      if (action) {
        e.preventDefault();
        setActiveAction(action.id);
        return;
      }
    }
    if (e.key === "Escape" && activeAction) {
      setActiveAction(null);
    }
  }, [activeAction]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const ActiveForm = activeAction ? FORM_MAP[activeAction] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] bg-card border border-border/40 elevated-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-[16px] text-foreground">Quick Actions</h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">Complete common tasks without leaving the dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-[12px] bg-muted/50 text-muted-foreground hover:text-foreground text-[12px] font-medium spring-tap"
          >
            <Keyboard className="w-4 h-4" />
            Shortcuts
          </button>
        </div>

        {/* Action grid */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ACTIONS.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveAction(action.id)}
              className="group relative flex flex-col items-center gap-2.5 p-4 rounded-[20px] bg-muted/30 border border-border/20 hover:bg-muted/50 hover:border-border/40 transition-colors"
            >
              <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center ${action.accent} transition-transform group-hover:scale-110`}>
                <action.icon className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{action.label}</span>
              <kbd className="absolute top-2 right-2 hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/80 border border-border/30 text-[9px] font-mono text-muted-foreground">
                ⌥{action.shortcut}
              </kbd>
            </motion.button>
          ))}
        </div>

        {/* Shortcuts hint */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="px-6 py-4 flex flex-wrap gap-x-6 gap-y-2">
                {ACTIONS.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded-md bg-muted border border-border/30 text-[10px] font-mono text-muted-foreground">⌥ + {a.shortcut}</kbd>
                    <span className="text-[12px] text-foreground">{a.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 rounded-md bg-muted border border-border/30 text-[10px] font-mono text-muted-foreground">Esc</kbd>
                  <span className="text-[12px] text-foreground">Close panel</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Slide-over panel */}
      <AnimatePresence>
        {activeAction && ActiveForm && (
          <SlideOver
            title={TITLES[activeAction]}
            onClose={() => setActiveAction(null)}
          >
            <ActiveForm user={user} onClose={() => setActiveAction(null)} />
          </SlideOver>
        )}
      </AnimatePresence>
    </>
  );
}

function SlideOver({ title, onClose, children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="fixed inset-y-0 right-0 w-full sm:max-w-lg lg:max-w-xl z-50 bg-card border-l border-border/40 elevated-shadow flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
          <h3 className="font-heading font-bold text-[16px] text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </>
  );
}