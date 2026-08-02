/**
 * Workspace Card Registry — the single source of truth for all modular cards.
 *
 * Every card is an independent, reusable unit. The same card can appear in
 * multiple workspaces. Cards are lazy-loaded to keep initial bundle small.
 *
 * interface WorkspaceCardDef {
 *   id: string;
 *   type: string;
 *   title: string;
 *   workspace: "social" | "academic";
 *   priority: number;          // base priority (lower = higher in list)
 *   expandable: boolean;
 *   refreshable: boolean;
 *   component: React.LazyExoticComponent;
 * }
 */

import { lazy } from "react";

// ─── Academic Cards ─────────────────────────────────────────────

const TodayScheduleCard = lazy(() => import("@/components/workspace/cards/academic/TodayScheduleCard"));
const AssignmentsCard = lazy(() => import("@/components/workspace/cards/academic/AssignmentsCard"));
const TimetableCard = lazy(() => import("@/components/workspace/cards/academic/TimetableCard"));
const CoursesCard = lazy(() => import("@/components/workspace/cards/academic/CoursesCard"));
const ExamsCard = lazy(() => import("@/components/workspace/cards/academic/ExamsCard"));
const GPACard = lazy(() => import("@/components/workspace/cards/academic/GPACard"));
const AcademicQuickActionsCard = lazy(() => import("@/components/workspace/cards/academic/QuickActionsCard"));
const NotesCard = lazy(() => import("@/components/workspace/cards/academic/NotesCard"));
const LibraryCard = lazy(() => import("@/components/workspace/cards/academic/LibraryCard"));
const ResearchCard = lazy(() => import("@/components/workspace/cards/academic/ResearchCard"));
const ProgressCard = lazy(() => import("@/components/workspace/cards/academic/ProgressCard"));
const CalendarCard = lazy(() => import("@/components/workspace/cards/academic/CalendarCard"));
const CareerCard = lazy(() => import("@/components/workspace/cards/academic/CareerCard"));

// ─── Social Cards ────────────────────────────────────────────────

const FeedCard = lazy(() => import("@/components/workspace/cards/social/FeedCard"));
const FriendsCard = lazy(() => import("@/components/workspace/cards/social/FriendsCard"));
const EventsCard = lazy(() => import("@/components/workspace/cards/social/EventsCard"));
const CommunitiesCard = lazy(() => import("@/components/workspace/cards/social/CommunitiesCard"));
const MarketplaceCard = lazy(() => import("@/components/workspace/cards/social/MarketplaceCard"));
const OpportunitiesCard = lazy(() => import("@/components/workspace/cards/social/OpportunitiesCard"));
const DiscoverCard = lazy(() => import("@/components/workspace/cards/social/DiscoverCard"));
const ActivityCard = lazy(() => import("@/components/workspace/cards/social/ActivityCard"));
// ─── Registry ───────────────────────────────────────────────────

export const CARD_REGISTRY = [
  // Academic
  { id: "today_schedule", type: "academic", title: "Today's Classes", workspace: "academic", priority: 1, expandable: true, refreshable: true, component: TodayScheduleCard },
  { id: "assignments", type: "academic", title: "Assignments", workspace: "academic", priority: 2, expandable: true, refreshable: true, component: AssignmentsCard },
  { id: "exams", type: "academic", title: "Exams", workspace: "academic", priority: 3, expandable: true, refreshable: true, component: ExamsCard },
  { id: "gpa", type: "academic", title: "GPA Progress", workspace: "academic", priority: 4, expandable: false, refreshable: true, component: GPACard },
  { id: "timetable", type: "academic", title: "Timetable", workspace: "academic", priority: 5, expandable: true, refreshable: true, component: TimetableCard },
  { id: "courses", type: "academic", title: "Courses", workspace: "academic", priority: 6, expandable: true, refreshable: true, component: CoursesCard },
  { id: "academic_quick_actions", type: "academic", title: "Quick Actions", workspace: "academic", priority: 7, expandable: false, refreshable: false, component: AcademicQuickActionsCard },
  { id: "notes", type: "academic", title: "Notes", workspace: "academic", priority: 8, expandable: true, refreshable: true, component: NotesCard },
  { id: "library", type: "academic", title: "Library", workspace: "academic", priority: 9, expandable: true, refreshable: true, component: LibraryCard },
  { id: "research", type: "academic", title: "Research", workspace: "academic", priority: 10, expandable: true, refreshable: true, component: ResearchCard },
  { id: "progress", type: "academic", title: "Academic Progress", workspace: "academic", priority: 11, expandable: true, refreshable: true, component: ProgressCard },
  { id: "calendar", type: "academic", title: "Calendar", workspace: "academic", priority: 12, expandable: true, refreshable: true, component: CalendarCard },
  { id: "career", type: "academic", title: "Career", workspace: "academic", priority: 13, expandable: true, refreshable: true, component: CareerCard },

  // Social
  { id: "feed", type: "social", title: "Campus Feed", workspace: "social", priority: 1, expandable: true, refreshable: true, component: FeedCard },
  { id: "friends", type: "social", title: "Friends", workspace: "social", priority: 2, expandable: true, refreshable: true, component: FriendsCard },
  { id: "events", type: "social", title: "Campus Events", workspace: "social", priority: 3, expandable: true, refreshable: true, component: EventsCard },
  { id: "communities", type: "social", title: "Communities & Clubs", workspace: "social", priority: 4, expandable: true, refreshable: true, component: CommunitiesCard },
  { id: "opportunities", type: "social", title: "Opportunities", workspace: "social", priority: 5, expandable: true, refreshable: true, component: OpportunitiesCard },
  { id: "marketplace", type: "social", title: "Marketplace", workspace: "social", priority: 6, expandable: true, refreshable: true, component: MarketplaceCard },
  { id: "discover", type: "social", title: "Discover", workspace: "social", priority: 7, expandable: true, refreshable: true, component: DiscoverCard },
  { id: "activity", type: "social", title: "Activity", workspace: "social", priority: 8, expandable: true, refreshable: true, component: ActivityCard },
];

/**
 * Get all cards for a workspace, in base priority order.
 */
export function getCardsForWorkspace(workspace) {
  return CARD_REGISTRY
    .filter((c) => c.workspace === workspace)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get a single card definition by id.
 */
export function getCardById(id) {
  return CARD_REGISTRY.find((c) => c.id === id);
}