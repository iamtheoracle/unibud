import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import {
  Clock, CheckSquare, Users, PenLine, Camera, MessageSquare,
  Calendar, ClipboardList, BookOpen, Megaphone, Search, Award,
  FlaskConical, Trophy, Edit3, QrCode, Share2, Settings, UserPlus,
  Radio, X,
} from "lucide-react";

const MENU_SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.85 };
const SHEET_SPRING = { type: "spring", stiffness: 360, damping: 36 };
const ORANGE = "#FF8A2A";
const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.45)";

/* ── Global quick actions (always available) ── */
const GLOBAL_ACTIONS = [
  { id: "study-hour", icon: Clock, title: "Log Study Hour", subtitle: "Track study time", sheet: "study" },
  { id: "create-task", icon: CheckSquare, title: "Create Task", subtitle: "Quick task capture", sheet: "task" },
  { id: "join-group", icon: Users, title: "Join Group", subtitle: "Find study groups", sheet: "group" },
];

/* ── Contextual actions per nav item ── */
const CONTEXT_ACTIONS = {
  social: [
    { id: "new-post", icon: PenLine, title: "New Post", subtitle: "Share with campus", to: "/square" },
    { id: "new-story", icon: Camera, title: "New Story", subtitle: "Share a moment", to: "/square" },
    { id: "create-community", icon: Users, title: "Create Community", subtitle: "Start a group", to: "/communities" },
    { id: "start-live", icon: Radio, title: "Start Live Room", subtitle: "Go live now", to: "/live" },
  ],
  academic: [
    { id: "log-study", icon: Clock, title: "Log Study Hour", subtitle: "Track study time", sheet: "study" },
    { id: "new-assignment", icon: ClipboardList, title: "Create Assignment", subtitle: "Add a task", to: "/assignments" },
    { id: "create-task", icon: CheckSquare, title: "Create Task", subtitle: "Quick task capture", sheet: "task" },
    { id: "open-timetable", icon: Calendar, title: "Open Timetable", subtitle: "View schedule", to: "/timetable" },
    { id: "join-group", icon: Users, title: "Join Study Group", subtitle: "Find a group", sheet: "group" },
  ],
  square: [
    { id: "create-post", icon: PenLine, title: "Create Post", subtitle: "Share something", to: "/square" },
    { id: "upload-photo", icon: Camera, title: "Upload Photo", subtitle: "Share a photo", to: "/square" },
    { id: "start-discussion", icon: MessageSquare, title: "Start Discussion", subtitle: "Spark a conversation", to: "/square" },
  ],
  discover: [
    { id: "search-students", icon: Search, title: "Search Students", subtitle: "Find classmates", to: "/discover" },
    { id: "search-clubs", icon: Users, title: "Search Clubs", subtitle: "Find communities", to: "/clubs" },
    { id: "explore-events", icon: Calendar, title: "Explore Events", subtitle: "What's happening", to: "/events" },
  ],
  connect: [
    { id: "new-chat", icon: MessageSquare, title: "New Chat", subtitle: "Start a conversation", to: "/messages" },
    { id: "create-group", icon: Users, title: "Create Group", subtitle: "Start a study group", to: "/study-groups" },
    { id: "invite-friend", icon: UserPlus, title: "Invite Friend", subtitle: "Grow your network", to: "/connect" },
  ],
  campus: [
    { id: "open-timetable", icon: Calendar, title: "Open Timetable", subtitle: "View schedule", to: "/timetable" },
    { id: "view-courses", icon: BookOpen, title: "View Courses", subtitle: "Your courses", to: "/courses" },
    { id: "faculty-updates", icon: Megaphone, title: "Faculty Updates", subtitle: "Latest announcements", to: "/communication" },
  ],
  quad: [
    { id: "scholarships", icon: Award, title: "Scholarships", subtitle: "Funding opportunities", to: "/scholarships" },
    { id: "research", icon: FlaskConical, title: "Research", subtitle: "Projects & papers", to: "/research" },
    { id: "competitions", icon: Trophy, title: "Competitions", subtitle: "Challenges & contests", to: "/challenges" },
  ],
  me: [
    { id: "edit-profile", icon: Edit3, title: "Edit Profile", subtitle: "Update your info", to: "/me" },
    { id: "qr-profile", icon: QrCode, title: "QR Profile", subtitle: "Share via QR", to: "/me" },
    { id: "share-profile", icon: Share2, title: "Share Profile", subtitle: "Share your link", handler: "share" },
    { id: "settings", icon: Settings, title: "Settings", subtitle: "Preferences", to: "/settings" },
  ],
};

export default function QuickActionMenu({ quickAction, onClose }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSheet, setActiveSheet] = useState(null);

  if (!quickAction) return null;

  const { itemKey, rect } = quickAction;
  const contextual = CONTEXT_ACTIONS[itemKey] || [];
  const allActions = [...GLOBAL_ACTIONS, ...contextual];

  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const menuBottom = rect ? window.innerHeight - rect.top + 8 : 130;
  const menuWidth = 290;
  const halfW = menuWidth / 2;
  let left = centerX;
  if (centerX - halfW < 16) left = halfW + 16;
  if (centerX + halfW > window.innerWidth - 16) left = window.innerWidth - halfW - 16;

  const handleAction = (action) => {
    hapticTap();
    if (action.sheet) {
      setActiveSheet(action.sheet);
      return;
    }
    if (action.handler === "share") {
      onClose();
      if (navigator.share) {
        navigator.share({ title: "My UNIBUD Profile", text: "Check out my profile on UNIBUD" }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(window.location.href);
        toast({ title: "Profile link copied" });
      }
      return;
    }
    if (action.to) {
      onClose();
      navigate(action.to);
    }
  };

  const handleSheetClose = () => {
    setActiveSheet(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop + Menu */}
      <AnimatePresence>
        {!activeSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/50"
              style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={MENU_SPRING}
              style={{
                position: "fixed",
                left: `${left}px`,
                bottom: `${menuBottom}px`,
                transform: "translateX(-50%)",
                width: `${menuWidth}px`,
                maxWidth: "calc(100vw - 32px)",
                background: "rgba(44, 33, 26, 0.92)",
                backdropFilter: "blur(40px) saturate(1.5)",
                WebkitBackdropFilter: "blur(40px) saturate(1.5)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "28px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
              className="z-50"
            >
              {/* Global section label */}
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ORANGE }}>Quick Actions</span>
              </div>

              {allActions.map((action, i) => {
                const Icon = action.icon;
                const isDivider = i === GLOBAL_ACTIONS.length && contextual.length > 0;
                return (
                  <React.Fragment key={action.id}>
                    {isDivider && (
                      <div className="mx-4 my-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
                    )}
                    <button
                      onClick={() => handleAction(action)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors"
                      style={{ minHeight: 48 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 138, 0, 0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="w-8 h-8 rounded-[10px] grid place-items-center shrink-0" style={{ background: "rgba(255, 138, 0, 0.12)" }}>
                        <Icon className="w-[17px] h-[17px]" strokeWidth={2} style={{ color: ORANGE }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold leading-tight" style={{ color: CREAM }}>{action.title}</p>
                      {action.subtitle && (
                        <p className="text-[12px] mt-0.5 leading-tight" style={{ color: "rgba(247, 240, 232, 0.45)" }}>{action.subtitle}</p>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
              <div className="h-1.5" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Action Sheets */}
      <AnimatePresence>
        {activeSheet === "study" && <StudyHourSheet onClose={handleSheetClose} />}
        {activeSheet === "task" && <TaskQuickSheet onClose={handleSheetClose} />}
        {activeSheet === "group" && <JoinGroupSheet onClose={handleSheetClose} />}
      </AnimatePresence>
    </>
  );
}

/* ═══ Shared Sheet Shell ═══ */
function SheetShell({ title, onClose, children }) {
  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={SHEET_SPRING}
        className="relative w-full max-w-[520px] rounded-t-[28px] p-5 pb-8 safe-area-pb"
        style={{
          background: "rgba(44, 33, 26, 0.95)",
          backdropFilter: "blur(40px) saturate(1.5)",
          WebkitBackdropFilter: "blur(40px) saturate(1.5)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderBottom: "none",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold" style={{ color: CREAM }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.06)" }}>
            <X className="w-4 h-4" strokeWidth={2} style={{ color: CREAM_MUTED }} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function SheetInput({ label, ...props }) {
  return (
    <div>
      <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>{label}</label>
      <input
        {...props}
        className="w-full h-[48px] px-4 rounded-[14px] text-[15px] placeholder:outline-none"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: CREAM }}
      />
    </div>
  );
}

function SheetButton({ children, onClick, disabled, variant }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[52px] rounded-[16px] text-[15px] font-semibold spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
      style={
        variant === "primary"
          ? { background: ORANGE, color: "#1A1006" }
          : { background: "rgba(255,255,255,0.04)", color: CREAM, border: "1px solid rgba(255,255,255,0.06)" }
      }
    >
      {children}
    </button>
  );
}

/* ═══ Study Hour Sheet ═══ */
function StudyHourSheet({ onClose }) {
  const { toast } = useToast();
  const [course, setCourse] = useState("");
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!course.trim()) {
      toast({ title: "Enter a course", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.StudySession.create({
        title: `Study: ${course}`,
        course_code: course,
        duration_minutes: parseInt(duration),
        started_at: new Date().toISOString(),
      });
      toast({ title: "Study hour logged ✓" });
      onClose();
    } catch {
      toast({ title: "Could not save", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <SheetShell title="Log Study Hour" onClose={onClose}>
      <div className="space-y-4">
        <SheetInput label="Course" placeholder="e.g. CSC 301" value={course} onChange={(e) => setCourse(e.target.value)} />
        <div>
          <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>Duration (minutes)</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setDuration((d) => Math.max(15, d - 15))} className="w-12 h-12 rounded-[14px] grid place-items-center text-xl font-bold" style={{ background: "rgba(255,255,255,0.04)", color: CREAM }}>−</button>
            <div className="flex-1 text-center text-[28px] font-bold tabular-nums" style={{ color: CREAM }}>{duration}</div>
            <button onClick={() => setDuration((d) => d + 15)} className="w-12 h-12 rounded-[14px] grid place-items-center text-xl font-bold" style={{ background: "rgba(255,255,255,0.04)", color: CREAM }}>+</button>
          </div>
        </div>
        <SheetButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Log Study Hour"}
        </SheetButton>
      </div>
    </SheetShell>
  );
}

/* ═══ Task Quick Sheet ═══ */
function TaskQuickSheet({ onClose }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  const priorities = [
    { key: "low", label: "Low" },
    { key: "medium", label: "Medium" },
    { key: "high", label: "High" },
    { key: "urgent", label: "Urgent" },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Enter a title", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.TaskManagement.create({
        title,
        task_type: "custom",
        status: "draft",
        priority,
        due_date: dueDate || undefined,
        member_ids: user?.id ? [user.id] : [],
      });
      toast({ title: "Task created ✓" });
      onClose();
    } catch {
      toast({ title: "Could not create task", variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <SheetShell title="Create Task" onClose={onClose}>
      <div className="space-y-4">
        <SheetInput label="Title" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <SheetInput label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <div>
          <label className="text-[12px] font-medium mb-1.5 block" style={{ color: CREAM_MUTED }}>Priority</label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.key}
                onClick={() => setPriority(p.key)}
                className="flex-1 h-[44px] rounded-[12px] text-[13px] font-semibold spring-tap transition-all"
                style={
                  priority === p.key
                    ? { background: ORANGE, color: "#1A1006" }
                    : { background: "rgba(255,255,255,0.04)", color: CREAM_MUTED }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <SheetButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Creating…" : "Create Task"}
        </SheetButton>
      </div>
    </SheetShell>
  );
}

/* ═══ Join Group Sheet ═══ */
function JoinGroupSheet({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data: groups, isLoading } = useQuery({
    queryKey: ["quick-study-groups"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 10),
  });

  const filtered = (groups || []).filter((g) =>
    !query || (g.name || g.title || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SheetShell title="Join Group" onClose={onClose}>
      <div className="space-y-4">
        <SheetInput label="Search" placeholder="Search by name or invite code" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-[14px] shimmer" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))
          ) : filtered.length > 0 ? (
            filtered.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-[14px]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="w-10 h-10 rounded-[12px] grid place-items-center text-[16px]" style={{ background: "rgba(255,138,42,0.10)" }}>
                  <Users className="w-5 h-5" style={{ color: ORANGE }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{g.name || g.title}</p>
                  <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{g.member_count || 0} members</p>
                </div>
                <button
                  onClick={() => { onClose(); navigate(`/study-groups/${g.id}`); }}
                  className="px-4 h-9 rounded-full text-[13px] font-bold spring-tap"
                  style={{ background: ORANGE, color: "#1A1006" }}
                >
                  Join
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-[14px]" style={{ color: CREAM_MUTED }}>No groups found</p>
            </div>
          )}
        </div>
      </div>
    </SheetShell>
  );
}