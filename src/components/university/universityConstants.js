import {
  Megaphone, Building2, BookOpen, CalendarDays, ClipboardList, Siren,
  GraduationCap, Users, ShieldCheck, AlertTriangle, MapPin, Clock, ExternalLink,
} from "lucide-react";

export const PROFILE_TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "structure", label: "Faculties", icon: GraduationCap },
  { key: "catalog", label: "Catalog", icon: BookOpen },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "exams", label: "Exams", icon: ClipboardList },
  { key: "emergencies", label: "Alerts", icon: Siren },
];

export const ANNOUNCEMENT_PRIORITY_META = {
  urgent: { label: "Urgent", color: "text-destructive", bg: "bg-destructive/10" },
  high: { label: "High", color: "text-warning", bg: "bg-warning/10" },
  normal: { label: "Normal", color: "text-muted-foreground", bg: "bg-muted/30" },
  low: { label: "Low", color: "text-muted-foreground", bg: "bg-muted/20" },
};

export const EMERGENCY_SEVERITY_META = {
  critical: { label: "Critical", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  urgent: { label: "Urgent", color: "text-error", bg: "bg-error/10", border: "border-error/30" },
  warning: { label: "Warning", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  info: { label: "Info", color: "text-information", bg: "bg-information/10", border: "border-information/30" },
};

export const CALENDAR_TYPE_META = {
  semester_start: { label: "Semester Start", icon: Clock, color: "text-success" },
  semester_end: { label: "Semester End", icon: Clock, color: "text-muted-foreground" },
  registration: { label: "Registration", icon: Users, color: "text-information" },
  add_drop: { label: "Add/Drop", icon: Users, color: "text-information" },
  exam_period: { label: "Exam Period", icon: ClipboardList, color: "text-error" },
  holiday: { label: "Holiday", icon: CalendarDays, color: "text-warning" },
  orientation: { label: "Orientation", icon: GraduationCap, color: "text-primary" },
  matriculation: { label: "Matriculation", icon: GraduationCap, color: "text-primary" },
  convocation: { label: "Convocation", icon: GraduationCap, color: "text-primary" },
  break: { label: "Break", icon: CalendarDays, color: "text-muted-foreground" },
  deadline: { label: "Deadline", icon: AlertTriangle, color: "text-error" },
  result_release: { label: "Results", icon: ClipboardList, color: "text-success" },
  resumption: { label: "Resumption", icon: Clock, color: "text-success" },
  other: { label: "Event", icon: CalendarDays, color: "text-muted-foreground" },
};

export const EXAM_TYPE_META = {
  final: { label: "Final", color: "text-error", bg: "bg-error/10" },
  midterm: { label: "Midterm", color: "text-warning", bg: "bg-warning/10" },
  quiz: { label: "Quiz", color: "text-information", bg: "bg-information/10" },
  practical: { label: "Practical", color: "text-success", bg: "bg-success/10" },
  oral: { label: "Oral", color: "text-accent", bg: "bg-accent/10" },
  makeup: { label: "Makeup", color: "text-warning", bg: "bg-warning/10" },
  resit: { label: "Resit", color: "text-warning", bg: "bg-warning/10" },
};

export const AUDIENCE_META = {
  entire_university: "Entire University",
  faculty: "Faculty",
  department: "Department",
  course: "Course",
  class: "Class",
  lecturers: "Lecturers",
  students: "Students",
};

export function formatDateRange(start, end) {
  if (!start) return "";
  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function formatDateTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function timeUntil(dateStr) {
  if (!dateStr) return "";
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target - now;
  if (diff < 0) return "Past";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""}`;
  return formatDateTime(dateStr);
}

export { ShieldCheck, AlertTriangle, MapPin, ExternalLink };