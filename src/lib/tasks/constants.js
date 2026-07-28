import {
  ClipboardList, Users, FlaskConical, GraduationCap, BookOpen, Presentation, Beaker,
  Building2, Briefcase, Trophy, PartyPopper, ClipboardCheck, ShoppingCart,
  Wallet, Wrench,
  Circle, UserPlus, CheckCircle2, Loader, Clock, AlertTriangle, Eye, Ban,
  Check, ThumbsDown, Archive,
  Flag, ArrowUp, ArrowDown, Minus,
} from "lucide-react";

export const TASK_TYPES = [
  { id: "assignment", label: "Assignment", icon: ClipboardList },
  { id: "group_project", label: "Group Project", icon: Users },
  { id: "research_project", label: "Research Project", icon: FlaskConical },
  { id: "thesis", label: "Thesis", icon: GraduationCap },
  { id: "dissertation", label: "Dissertation", icon: BookOpen },
  { id: "presentation", label: "Presentation", icon: Presentation },
  { id: "laboratory_work", label: "Laboratory Work", icon: Beaker },
  { id: "department_task", label: "Department Task", icon: Building2 },
  { id: "administrative_task", label: "Administrative Task", icon: Briefcase },
  { id: "club_activity", label: "Club Activity", icon: Trophy },
  { id: "event_planning", label: "Event Planning", icon: PartyPopper },
  { id: "meeting_action_item", label: "Meeting Action Item", icon: ClipboardCheck },
  { id: "marketplace_order_task", label: "Marketplace Order Task", icon: ShoppingCart },
  { id: "finance_approval", label: "Finance Approval", icon: Wallet },
  { id: "custom", label: "Custom Task", icon: Wrench },
];

export const TASK_STATUSES = [
  { id: "draft", label: "Draft", icon: Circle, tone: "muted" },
  { id: "assigned", label: "Assigned", icon: UserPlus, tone: "info" },
  { id: "accepted", label: "Accepted", icon: Check, tone: "info" },
  { id: "in_progress", label: "In Progress", icon: Loader, tone: "primary" },
  { id: "waiting", label: "Waiting", icon: Clock, tone: "warning" },
  { id: "under_review", label: "Under Review", icon: Eye, tone: "warning" },
  { id: "blocked", label: "Blocked", icon: Ban, tone: "error" },
  { id: "completed", label: "Completed", icon: CheckCircle2, tone: "success" },
  { id: "approved", label: "Approved", icon: CheckCircle2, tone: "success" },
  { id: "rejected", label: "Rejected", icon: ThumbsDown, tone: "error" },
  { id: "archived", label: "Archived", icon: Archive, tone: "muted" },
];

export const TASK_PRIORITIES = [
  { id: "low", label: "Low", icon: Minus, tone: "muted" },
  { id: "medium", label: "Medium", icon: Flag, tone: "info" },
  { id: "high", label: "High", icon: ArrowUp, tone: "warning" },
  { id: "urgent", label: "Urgent", icon: ArrowDown, tone: "error" },
];

export const TONE_CLASS = {
  muted: "bg-muted/60 text-muted-foreground",
  info: "bg-information/12 text-information",
  primary: "bg-primary/12 text-primary",
  warning: "bg-warning/15 text-warning",
  error: "bg-destructive/12 text-destructive",
  success: "bg-success/12 text-success",
};

export function typeMeta(id) {
  return TASK_TYPES.find((t) => t.id === id) || TASK_TYPES[TASK_TYPES.length - 1];
}
export function statusMeta(id) {
  return TASK_STATUSES.find((s) => s.id === id) || TASK_STATUSES[0];
}
export function priorityMeta(id) {
  return TASK_PRIORITIES.find((p) => p.id === id) || TASK_PRIORITIES[1];
}

/**
 * Compute completion % from status + checklist + milestones.
 * Approved/completed/archived = 100. Rejected stays at stored value.
 */
export function computeProgress(task) {
  if (!task) return 0;
  if (task.status === "approved" || task.status === "completed" || task.status === "archived") return 100;
  const checks = task.checklist || [];
  const miles = task.milestones || [];
  const totalUnits = checks.length + miles.length;
  if (totalUnits === 0) {
    // status-based fallback
    const map = { draft: 0, assigned: 10, accepted: 20, in_progress: 50, waiting: 60, under_review: 85, blocked: 50, rejected: 0 };
    return map[task.status] ?? 0;
  }
  const done = checks.filter((c) => c.done).length + miles.filter((m) => m.done).length;
  return Math.round((done / totalUnits) * 100);
}

export function isOverdue(task) {
  if (!task.due_date) return false;
  if (["completed", "approved", "archived"].includes(task.status)) return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

export function daysUntilDue(task) {
  if (!task.due_date) return null;
  const ms = new Date(task.due_date) - new Date(new Date().toDateString());
  return Math.ceil(ms / 86400000);
}