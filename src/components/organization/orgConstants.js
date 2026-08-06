import {
  Users, Calendar, Vote, Wallet, MessageSquare, LayoutDashboard, FileText,
} from "lucide-react";

export const ORG_TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "feed", label: "Feed", icon: MessageSquare },
  { key: "members", label: "Members", icon: Users },
  { key: "events", label: "Events", icon: Calendar },
  { key: "elections", label: "Elections", icon: Vote },
  { key: "finance", label: "Finance", icon: Wallet },
];

export const ROLE_META = {
  president: { label: "President", color: "text-primary", bg: "bg-primary/10" },
  vice_president: { label: "Vice President", color: "text-accent", bg: "bg-accent/10" },
  secretary: { label: "Secretary", color: "text-information", bg: "bg-information/10" },
  treasurer: { label: "Treasurer", color: "text-success", bg: "bg-success/10" },
  officer: { label: "Officer", color: "text-warning", bg: "bg-warning/10" },
  member: { label: "Member", color: "text-muted-foreground", bg: "bg-muted" },
};

export const OFFICER_ROLES = ["president", "vice_president", "secretary", "treasurer", "officer"];

export function isOfficer(members = [], userId) {
  return members.some((m) => m.user_id === userId && OFFICER_ROLES.includes(m.role));
}

export function getUserRole(members = [], userId) {
  const m = members.find((m) => m.user_id === userId);
  return m?.role || null;
}

export const FINANCE_CATEGORIES = {
  dues: { label: "Dues", icon: Wallet },
  fundraiser: { label: "Fundraiser", icon: Wallet },
  event: { label: "Event", icon: Calendar },
  equipment: { label: "Equipment", icon: FileText },
  venue: { label: "Venue", icon: FileText },
  refreshment: { label: "Refreshment", icon: FileText },
  prize: { label: "Prize", icon: Vote },
  transport: { label: "Transport", icon: FileText },
  sponsorship: { label: "Sponsorship", icon: Wallet },
  misc: { label: "Misc", icon: FileText },
};

export const MEETING_TYPES = {
  general: { label: "General Meeting", color: "text-information" },
  executive: { label: "Executive Meeting", color: "text-accent" },
  event: { label: "Event", color: "text-primary" },
  practice: { label: "Practice", color: "text-success" },
  emergency: { label: "Emergency Meeting", color: "text-error" },
  agm: { label: "AGM", color: "text-warning" },
};

export const DISCUSSION_CATEGORIES = {
  general: { label: "General", color: "text-muted-foreground" },
  announcement: { label: "Announcement", color: "text-primary" },
  question: { label: "Question", color: "text-information" },
  idea: { label: "Idea", color: "text-accent" },
  feedback: { label: "Feedback", color: "text-warning" },
  event_planning: { label: "Event Planning", color: "text-success" },
};

export function formatCurrency(amount, currency = "NGN") {
  const sym = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "";
  return `${sym}${Number(amount || 0).toLocaleString()}`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}