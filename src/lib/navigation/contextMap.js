import {
  BookOpen, CalendarClock, CalendarDays, ShoppingBag, Briefcase,
  Award, Bookmark, ArrowLeftRight, MessageSquare, Users, Sparkles,
  CheckSquare, MessageSquareText, Wallet, Compass, BarChart3, Images,
  Search, ClipboardList, NotebookPen, GraduationCap,
} from "lucide-react";
import {
  ACADEMIC_NAV_PATHS as ACADEMIC_PATHS,
  SOCIAL_NAV_PATHS as SOCIAL_PATHS,
  ME_PATHS,
} from "@/lib/ecosystems/manifest";

/**
 * UNIBUD Adaptive Navigation — domain + workspace resolver.
 *
 * The dock has 3 fixed tabs — Academic · Social · Me — plus a dynamic,
 * movable Context Navigator that surfaces the most relevant destinations
 * for the current workspace (Study, Wallet, Marketplace, Career, Library…).
 * See useAdaptiveContext for the prominent→settled transition logic.
 */

// Route classification lives in @/lib/ecosystems/manifest (single source of truth).

/** Which fixed tab represents the current route (academic | social | me | standalone). */
export function getDomain(pathname) {
  if (pathname === "/me" || pathname.startsWith("/me/")) return "me";
  if (ME_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "me";
  if (ACADEMIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "academic";
  if (SOCIAL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "social";
  return "standalone";
}

/**
 * Workspace contexts for the Context Navigator. Each workspace exposes a
 * compact set of contextual destinations surfaced prominently on entry.
 */
const WORKSPACES = [
  { match: /^\/academics/, workspace: "academics", label: "Academics", icon: GraduationCap, destinations: [
    { label: "Study", to: "/study", icon: BookOpen },
    { label: "Agenda", to: "/agenda", icon: CalendarDays },
    { label: "Timetable", to: "/timetable", icon: CalendarClock },
  ] },
  { match: /^\/study(?!\/library)/, workspace: "study", label: "Study", icon: BookOpen, destinations: [
    { label: "Planner", to: "/study/planner", icon: CalendarClock },
    { label: "Flashcards", to: "/study/flashcards", icon: ClipboardList },
    { label: "Notes", to: "/study/notes", icon: NotebookPen },
  ] },
  { match: /^\/course/, workspace: "course", label: "Course", icon: BookOpen, destinations: [
    { label: "Agenda", to: "/agenda", icon: CalendarDays },
    { label: "Library", to: "/knowledge", icon: Bookmark },
  ] },
  { match: /^\/agenda/, workspace: "agenda", label: "Agenda", icon: CalendarDays, destinations: [
    { label: "Tasks", to: "/tasks", icon: CheckSquare },
    { label: "Calendar", to: "/calendar", icon: CalendarClock },
  ] },
  { match: /^\/tasks/, workspace: "tasks", label: "Tasks", icon: CheckSquare, destinations: [
    { label: "Agenda", to: "/agenda", icon: CalendarDays },
    { label: "Collaboration", to: "/collaboration", icon: Users },
  ] },
  { match: /^\/collaboration/, workspace: "collaboration", label: "Collaboration", icon: Users, destinations: [
    { label: "Tasks", to: "/tasks", icon: CheckSquare },
    { label: "Agenda", to: "/agenda", icon: CalendarDays },
  ] },
  { match: /^\/exam/, workspace: "exam", label: "Exams", icon: Sparkles, destinations: [
    { label: "Coach", to: "/exam/coach", icon: Sparkles },
    { label: "Analytics", to: "/exam/analytics", icon: BarChart3 },
  ] },
  { match: /^\/knowledge/, workspace: "knowledge", label: "Knowledge", icon: Bookmark, destinations: [
    { label: "Library", to: "/study/library", icon: BookOpen },
    { label: "Search", to: "/knowledge", icon: Search },
  ] },
  { match: /^\/marketplace/, workspace: "marketplace", label: "Marketplace", icon: ShoppingBag, destinations: [
    { label: "Browse", to: "/marketplace", icon: ShoppingBag },
    { label: "Lost & Found", to: "/lost-found", icon: Search },
  ] },
  { match: /^\/lost-found/, workspace: "lostfound", label: "Lost & Found", icon: Search, destinations: [
    { label: "Marketplace", to: "/marketplace", icon: ShoppingBag },
  ] },
  { match: /^\/wallet/, workspace: "wallet", label: "Wallet", icon: Wallet, destinations: [
    { label: "Transactions", to: "/wallet", icon: ArrowLeftRight },
    { label: "Finance", to: "/finance", icon: Wallet },
  ] },
  { match: /^\/finance/, workspace: "finance", label: "Finance", icon: Wallet, destinations: [
    { label: "Wallet", to: "/wallet", icon: Wallet },
    { label: "Transactions", to: "/finance", icon: ArrowLeftRight },
  ] },
  { match: /^\/career/, workspace: "career", label: "Career", icon: Briefcase, destinations: [
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
    { label: "Portfolio", to: "/portfolio", icon: Bookmark },
  ] },
  { match: /^\/opportunities/, workspace: "opportunities", label: "Opportunities", icon: Briefcase, destinations: [
    { label: "Scholarships", to: "/scholarships", icon: Award },
    { label: "Companies", to: "/companies", icon: Briefcase },
  ] },
  { match: /^\/scholarships/, workspace: "scholarships", label: "Scholarships", icon: Award, destinations: [
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
  { match: /^\/research/, workspace: "research", label: "Research", icon: Compass, destinations: [
    { label: "Portfolio", to: "/portfolio", icon: Bookmark },
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
  { match: /^\/portfolio/, workspace: "portfolio", label: "Portfolio", icon: Bookmark, destinations: [
    { label: "CV Builder", to: "/cv-builder", icon: Briefcase },
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
  { match: /^\/cv-builder/, workspace: "cv", label: "CV Builder", icon: Briefcase, destinations: [
    { label: "Portfolio", to: "/portfolio", icon: Bookmark },
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
  { match: /^\/companies/, workspace: "companies", label: "Companies", icon: Briefcase, destinations: [
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
  { match: /^\/social/, workspace: "social", label: "Social", icon: Users, destinations: [
    { label: "Quad", to: "/quad", icon: MessageSquareText },
    { label: "Messages", to: "/messages", icon: MessageSquare },
    { label: "Communities", to: "/communities", icon: Users },
  ] },
  { match: /^\/quad/, workspace: "quad", label: "Quad", icon: MessageSquareText, destinations: [
    { label: "Communities", to: "/communities", icon: Users },
    { label: "Shorts", to: "/shorts", icon: Images },
    { label: "Messages", to: "/messages", icon: MessageSquare },
  ] },
  { match: /^\/connect/, workspace: "connect", label: "Connect", icon: Users, destinations: [
    { label: "Messages", to: "/messages", icon: MessageSquare },
    { label: "Quad", to: "/quad", icon: MessageSquareText },
  ] },
  { match: /^\/communities/, workspace: "communities", label: "Communities", icon: Users, destinations: [
    { label: "Quad", to: "/quad", icon: MessageSquareText },
    { label: "Clubs", to: "/clubs", icon: Users },
  ] },
  { match: /^\/community/, workspace: "community", label: "Community", icon: Users, destinations: [
    { label: "Communities", to: "/communities", icon: Users },
    { label: "Quad", to: "/quad", icon: MessageSquareText },
  ] },
  { match: /^\/clubs/, workspace: "clubs", label: "Clubs", icon: Users, destinations: [
    { label: "Communities", to: "/communities", icon: Users },
    { label: "Events", to: "/events", icon: CalendarDays },
  ] },
  { match: /^\/messages/, workspace: "messages", label: "Messages", icon: MessageSquare, destinations: [
    { label: "Social", to: "/social", icon: Users },
    { label: "Quad", to: "/quad", icon: MessageSquareText },
  ] },
  { match: /^\/events/, workspace: "events", label: "Events", icon: CalendarDays, destinations: [
    { label: "Communities", to: "/communities", icon: Users },
    { label: "Quad", to: "/quad", icon: MessageSquareText },
  ] },
  { match: /^\/study-groups/, workspace: "studygroups", label: "Study Groups", icon: Users, destinations: [
    { label: "Study", to: "/study", icon: BookOpen },
    { label: "Quad", to: "/quad", icon: MessageSquareText },
  ] },
  { match: /^\/mentorship/, workspace: "mentorship", label: "Mentorship", icon: Users, destinations: [
    { label: "Connect", to: "/connect", icon: Users },
    { label: "Career", to: "/career", icon: Briefcase },
  ] },
  { match: /^\/campus/, workspace: "campus", label: "Campus", icon: Compass, destinations: [
    { label: "Events", to: "/events", icon: CalendarDays },
    { label: "Academics", to: "/academics", icon: GraduationCap },
  ] },
  { match: /^\/discover/, workspace: "discover", label: "Discover", icon: Search, destinations: [
    { label: "Quad", to: "/quad", icon: MessageSquareText },
    { label: "Opportunities", to: "/opportunities", icon: Briefcase },
  ] },
];

/** The workspace context for the current route, or null. */
export function resolveWorkspace(pathname) {
  return WORKSPACES.find((w) => w.match.test(pathname)) || null;
}

/** Backward-compatible single-destination resolver (first destination of the workspace). */
export function resolveContext(pathname) {
  const ws = resolveWorkspace(pathname);
  if (!ws || !ws.destinations.length) return null;
  const d = ws.destinations[0];
  return { label: d.label, to: d.to, icon: d.icon };
}