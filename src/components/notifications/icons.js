import {
  Info, Sparkles, Users, BookOpen, CalendarDays, Briefcase,
  Trophy, MessageCircle, AlertTriangle, Megaphone, Building,
  CheckSquare, ListChecks, CheckCircle2, AtSign, Reply, AlarmClock,
  FileWarning, GraduationCap, CalendarClock, Radio, TrendingUp,
  UserCheck, CalendarX, Flame, UserPlus, Lightbulb, Bus, Award,
  Building2, ShoppingBag, Settings, Bell, Wallet,
} from "lucide-react";

/**
 * Icon map for the lucide icon names emitted by Spark rules.
 * Falls back to the category icon when a notification's icon is unknown.
 */
export const NOTIFICATION_ICONS = {
  Info, Sparkles, Users, BookOpen, CalendarDays, Briefcase, Trophy,
  MessageCircle, AlertTriangle, Megaphone, Building, CheckSquare,
  ListChecks, CheckCircle2, AtSign, Reply, AlarmClock, FileWarning,
  GraduationCap, CalendarClock, Radio, TrendingUp, UserCheck, CalendarX,
  Flame, UserPlus, Lightbulb, Bus, Award, Building2, ShoppingBag,
  Settings, Bell,
};

/** Per-category visual treatment (Liquid Glass tint per category). */
export const CATEGORY_META = {
  system: { icon: Settings, tint: "bg-muted text-muted-foreground", label: "System" },
  bud: { icon: Sparkles, tint: "bg-primary/12 text-primary", label: "Bud" },
  study_group: { icon: Users, tint: "bg-info/12 text-info", label: "Study Groups" },
  assignment: { icon: BookOpen, tint: "bg-warning/12 text-warning", label: "Assignments" },
  campus: { icon: CalendarDays, tint: "bg-info/12 text-info", label: "Campus" },
  opportunity: { icon: Briefcase, tint: "bg-success/12 text-success", label: "Opportunity" },
  achievement: { icon: Trophy, tint: "bg-warning/12 text-warning", label: "Achievement" },
  social: { icon: MessageCircle, tint: "bg-purple/12 text-purple", label: "Social" },
  emergency: { icon: AlertTriangle, tint: "bg-destructive/12 text-destructive", label: "Emergency" },
  exam: { icon: FileWarning, tint: "bg-destructive/12 text-destructive", label: "Exams" },
  timetable: { icon: CalendarClock, tint: "bg-info/12 text-info", label: "Timetable" },
  event: { icon: CalendarDays, tint: "bg-primary/12 text-primary", label: "Events" },
  streak: { icon: Flame, tint: "bg-warning/12 text-warning", label: "Streaks" },
  community: { icon: Users, tint: "bg-info/12 text-info", label: "Communities" },
  career: { icon: Briefcase, tint: "bg-success/12 text-success", label: "Career" },
  marketplace: { icon: ShoppingBag, tint: "bg-accent/12 text-accent", label: "Marketplace" },
  wallet: { icon: Wallet, tint: "bg-success/12 text-success", label: "Wallet" },
  message: { icon: MessageCircle, tint: "bg-info/12 text-info", label: "Messages" },
  library: { icon: BookOpen, tint: "bg-info/12 text-info", label: "Library" },
  transport: { icon: Bus, tint: "bg-info/12 text-info", label: "Transport" },
};

export const PRIORITY_DOT = {
  critical: "bg-destructive",
  high: "bg-warning",
  normal: "bg-primary",
  low: "bg-muted-foreground",
  silent: "bg-transparent",
};

/** Unified category groups — the 7 domains the Notification Center combines. */
export const CATEGORY_GROUPS = {
  all: { label: "All", icon: Bell, cats: [] },
  academic: { label: "Academic", icon: BookOpen, cats: ["assignment", "exam", "timetable", "study_group"] },
  social: { label: "Social", icon: MessageCircle, cats: ["social"] },
  connect: { label: "Connect", icon: Users, cats: ["message", "community"] },
  marketplace: { label: "Marketplace", icon: ShoppingBag, cats: ["marketplace"] },
  events: { label: "Events", icon: CalendarDays, cats: ["event", "campus"] },
  wallet: { label: "Wallet", icon: Wallet, cats: ["wallet"] },
  bud: { label: "Bud", icon: Sparkles, cats: ["bud"] },
};

/** Priority filter chips. */
export const PRIORITY_FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "normal", label: "Normal" },
  { key: "low", label: "Low" },
];

/** Legacy filter chips — kept for backward compatibility. */
export const NOTIFICATION_FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "pinned", label: "Pinned" },
  { key: "system", label: "System" },
  { key: "bud", label: "Bud" },
  { key: "study_group", label: "Study Groups" },
  { key: "assignment", label: "Assignments" },
  { key: "campus", label: "Campus" },
  { key: "archived", label: "Archived" },
];