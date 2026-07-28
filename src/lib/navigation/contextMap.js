import {
  BookOpen, CalendarClock, CalendarDays, ShoppingBag, Briefcase,
  Award, Bookmark, ArrowLeftRight, MessageSquare, Users, Sparkles,
  CheckSquare, MessageSquareText,
} from "lucide-react";

/**
 * Adaptive Navigation — domain + context resolver.
 *
 * The dock has 4 slots: Academic · Quad · Bud · [Adaptive].
 * The 4th slot shows "Me" by default, but when the user enters a major
 * workspace it morphs into a Context Navigator (the most relevant
 * secondary destination). See useAdaptiveContext for the transition logic.
 */

const ACADEMIC_PATHS = [
  "/academics", "/study", "/course", "/agenda", "/tasks", "/collaboration",
  "/exam", "/notes", "/attendance", "/assignments", "/projects", "/exams",
  "/timetable", "/calendar", "/office-hours", "/study-sessions", "/results",
];

const QUAD_PATHS = [
  "/quad", "/communities", "/community", "/clubs", "/social", "/connect",
  "/messages", "/shorts", "/podcasts", "/creator-studio", "/discover",
  "/following", "/friends", "/events", "/study-groups", "/mentorship",
  "/mentor", "/challenges", "/student-government", "/student-support",
  "/marketplace", "/lost-found",
];

const ME_PATHS = [
  "/security", "/notifications", "/smart-notifications",
  "/notification-preferences", "/academic-timeline", "/bud/notifications",
];

/** Which permanent tab represents the current route. */
export function getDomain(pathname) {
  if (pathname === "/me" || pathname.startsWith("/me/")) return "me";
  if (ME_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "me";
  if (pathname === "/bud") return "bud";
  if (ACADEMIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "academic";
  if (QUAD_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return "quad";
  return "standalone";
}

/** Ordered context-navigator destinations for major workspaces. */
const CONTEXT_MAP = [
  { match: /^\/academics/, label: "Study", to: "/study", icon: BookOpen },
  { match: /^\/study(?!\/library)/, label: "Planner", to: "/study/planner", icon: CalendarClock },
  { match: /^\/course/, label: "Agenda", to: "/agenda", icon: CalendarDays },
  { match: /^\/agenda/, label: "Tasks", to: "/tasks", icon: CheckSquare },
  { match: /^\/tasks/, label: "Agenda", to: "/agenda", icon: CalendarDays },
  { match: /^\/collaboration/, label: "Tasks", to: "/tasks", icon: CheckSquare },
  { match: /^\/exam/, label: "Coach", to: "/exam/coach", icon: Sparkles },
  { match: /^\/marketplace/, label: "Browse", to: "/marketplace", icon: ShoppingBag },
  { match: /^\/career/, label: "Opportunities", to: "/opportunities", icon: Briefcase },
  { match: /^\/opportunities/, label: "Scholarships", to: "/scholarships", icon: Award },
  { match: /^\/scholarships/, label: "Opportunities", to: "/opportunities", icon: Briefcase },
  { match: /^\/research/, label: "Portfolio", to: "/portfolio", icon: Briefcase },
  { match: /^\/portfolio/, label: "Opportunities", to: "/opportunities", icon: Briefcase },
  { match: /^\/cv-builder/, label: "Portfolio", to: "/portfolio", icon: Briefcase },
  { match: /^\/companies/, label: "Opportunities", to: "/opportunities", icon: Briefcase },
  { match: /^\/knowledge/, label: "Library", to: "/study/library", icon: Bookmark },
  { match: /^\/wallet/, label: "Transactions", to: "/wallet", icon: ArrowLeftRight },
  { match: /^\/finance/, label: "Wallet", to: "/wallet", icon: ArrowLeftRight },
  { match: /^\/social/, label: "Messages", to: "/messages", icon: MessageSquare },
  { match: /^\/connect/, label: "Messages", to: "/messages", icon: MessageSquare },
  { match: /^\/messages/, label: "Social", to: "/social", icon: Users },
  { match: /^\/communities/, label: "Quad", to: "/quad", icon: MessageSquareText },
  { match: /^\/community/, label: "Quad", to: "/quad", icon: MessageSquareText },
  { match: /^\/clubs/, label: "Communities", to: "/communities", icon: Users },
  { match: /^\/quad/, label: "Communities", to: "/communities", icon: Users },
  { match: /^\/events/, label: "Communities", to: "/communities", icon: Users },
];

/** The context-navigator destination for the current route, or null. */
export function resolveContext(pathname) {
  return CONTEXT_MAP.find((c) => c.match.test(pathname)) || null;
}