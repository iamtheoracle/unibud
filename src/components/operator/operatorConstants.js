/** Operator Dashboard shared constants. */

export const TASK_STATUS = {
  assigned: { label: "Assigned", tint: "bg-info/12 text-info", dot: "bg-info" },
  accepted: { label: "Accepted", tint: "bg-primary/12 text-primary", dot: "bg-primary" },
  in_progress: { label: "In Progress", tint: "bg-warning/12 text-warning", dot: "bg-warning" },
  paused: { label: "Paused", tint: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  waiting_review: { label: "Waiting Review", tint: "bg-purple/12 text-purple", dot: "bg-purple" },
  completed: { label: "Completed", tint: "bg-success/12 text-success", dot: "bg-success" },
  rejected: { label: "Rejected", tint: "bg-destructive/12 text-destructive", dot: "bg-destructive" },
  archived: { label: "Archived", tint: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export const TASK_PRIORITY = {
  critical: { label: "Critical", color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive" },
  high: { label: "High", color: "text-warning", bg: "bg-warning/10", dot: "bg-warning" },
  normal: { label: "Normal", color: "text-info", bg: "bg-info/10", dot: "bg-info" },
  low: { label: "Low", color: "text-muted-foreground", bg: "bg-muted", dot: "bg-muted-foreground" },
};

export const MY_TASK_TABS = [
  { key: "assigned", label: "Assigned" },
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting_review", label: "Waiting" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "archived", label: "Archived" },
];

export function timeUntil(iso) {
  if (!iso) return "No deadline";
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Overdue";
  const hrs = diff / 36e5;
  if (hrs < 24) return `${Math.round(hrs)}h left`;
  return `${Math.round(hrs / 24)}d left`;
}