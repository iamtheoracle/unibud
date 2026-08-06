/**
 * UNIBUD Ecosystem Boundary — the implementation baseline.
 *
 * UNIBUD is ONE platform containing TWO independent ecosystems:
 *
 *   1. Academic  — learning, courses, exams, study, career development
 *   2. Social    — community, campus life, connections, marketplace, media
 *
 * Shared services (used by both ecosystems, owned by neither):
 *   authentication · profile · Bud · notifications · search · settings ·
 *   design system · AI foundation · wallet/finance · security · institution
 *
 * Separate per ecosystem (where appropriate):
 *   navigation · workflows · screens · components · APIs · business logic ·
 *   user journeys
 *
 * This manifest is the single source of truth for the boundary. Every route,
 * backend function, workflow, agent, and entity is classified as
 * "academic" | "social" | "shared". Future work must respect this boundary:
 * academic code does not import social code (and vice versa) except through
 * the shared services listed here.
 */

// ─── Ecosystems ────────────────────────────────────────────────────────────
export const ECOSYSTEMS = {
  academic: {
    id: "academic",
    name: "Academic",
    tagline: "Learning, courses, exams, study & career development",
    defaultRoute: "/academics",
  },
  social: {
    id: "social",
    name: "Social",
    tagline: "Community, campus life, connections, marketplace & media",
    defaultRoute: "/social",
  },
};

// ─── Shared services (owned by the platform, used by both ecosystems) ──────
export const SHARED_SERVICES = [
  "auth", "profile", "bud", "notifications", "search", "settings",
  "designSystem", "aiFoundation", "wallet", "finance", "security",
  "institution", "platformOps",
];

export function isSharedService(name) {
  return SHARED_SERVICES.includes(name);
}

// ─── Dock-highlightable route subsets (consumed by navigation) ─────────────
export const ACADEMIC_NAV_PATHS = [
  "/campus", "/academics", "/study", "/course", "/agenda", "/tasks", "/collaboration",
  "/exam", "/notes", "/attendance", "/assignments", "/projects", "/exams",
  "/timetable", "/calendar", "/office-hours", "/study-sessions", "/results",
  "/report",
];

export const SOCIAL_NAV_PATHS = [
  "/square", "/quad", "/communities", "/community", "/clubs", "/social", "/connect",
  "/messages", "/shorts", "/podcasts", "/creator-studio", "/discover",
  "/following", "/friends", "/events", "/study-groups", "/mentorship",
  "/mentor", "/challenges", "/student-government", "/student-support",
];

export const ME_PATHS = [
  "/security", "/notifications", "/smart-notifications",
  "/notification-preferences", "/academic-timeline", "/bud/notifications",
];

// ─── Full ecosystem route classification ─────────────────────────────────────
export const ACADEMIC_ROUTES = [
  ...ACADEMIC_NAV_PATHS,
  "/career", "/opportunities", "/scholarships", "/research", "/portfolio",
  "/cv-builder", "/companies", "/knowledge", "/smart-attendance", "/classroom",
];

export const SOCIAL_ROUTES = [
  ...SOCIAL_NAV_PATHS,
  "/marketplace", "/lost-found",
];

export const SHARED_ROUTES = [
  "/home", "/bud", "/me", "/weather", "/wallet", "/finance", "/communication",
  "/institution", "/lecturer", "/oracle", "/management",
  "/operator", "/architect", "/automation", "/admin", ...ME_PATHS,
];

// ─── Backend function classification ───────────────────────────────────────
export const ACADEMIC_FUNCTIONS = [
  "deadlineReminders", "examReminders", "streakReminders", "taskReminders",
];

export const SOCIAL_FUNCTIONS = [
  "eventReminders", "socialProfile", "studyGroupEventBridge", "transcribeEpisode",
];

export const SHARED_FUNCTIONS = [
  "activateAnnouncements", "budReminders", "deleteAccount", "googleCalendarSync",
  "outreachFollowup", "providerSecrets",
  "runAutomation", "studentSearch", "trustProfile",
  "universityConnectBgSync", "universityConnectSync", "updateProfile",
  "welcomeNewStudent",
];

// ─── Workflow classification ───────────────────────────────────────────────
export const ACADEMIC_WORKFLOWS = [
  "Deadline Reminders", "Exam Countdown", "Study Streak Reminders",
  "Task Deadline Reminders",
];

export const SOCIAL_WORKFLOWS = [
  "Event Reminders", "Study Group Message Notifications",
  "Study Group Task Notifications",
];

export const SHARED_WORKFLOWS = [
  "Activate Scheduled Announcements", "Bud Notification Engine", "Bud Reminders",
  "Outreach Follow-up", "University Connect Background Sync", "Welcome New Student",
];

// ─── In-app agent classification ────────────────────────────────────────────
export const ACADEMIC_AGENTS = ["study", "library", "career"];

export const SOCIAL_AGENTS = ["quad", "campus"];

export const SHARED_AGENTS = [
  "bud", "spark", "pulse", "oracle", "admin", "security", "notification",
  "search",
];

// ─── Entity classification (representative; remainder are shared) ───────────
export const ACADEMIC_ENTITIES = [
  "Course", "CourseMaterial", "CourseMaterialProgress", "Assignment", "Exam",
  "ExamPaper", "ExamQuestion", "ExamAttempt", "ExamCertificate", "Grade",
  "StudentGrade", "AttendanceRecord", "AttendanceSession", "TimetableEntry",
  "InstitutionTimetable", "Project", "FYPProject", "ResearchProject",
  "LearningPath", "Flashcard", "QuizAttempt", "Citation", "StudySession",
  "StudyGoal", "StudentGoal", "Milestone", "Note", "OfficeHoursSlot",
  "OfficeHoursBooking", "LiveClass", "LiveRecording", "CalendarEvent",
  "AcademicTimelineEntry", "Opportunity", "Scholarship", "ScholarshipAward",
  "CompanyPage", "PortfolioItem", "ApplicationTracker",
];

export const SOCIAL_ENTITIES = [
  "QuadPost", "QuadComment", "Story", "StoryView", "StoryReply", "ShortVideo",
  "ShortVideoComment", "Podcast", "PodcastEpisode", "PodcastListen", "Community",
  "Club", "CampusEvent", "CampusTradition", "Celebration", "LostFoundItem",
  "MarketplaceListing", "MarketplaceReview", "SocialConnection", "FriendRequest",
  "Follow", "Conversation", "Message", "StudyGroup", "StudyGroupTask",
  "StudyGroupMessage", "Mentor", "MentorshipRequest", "MentorReview",
  "StudentAchievement", "Challenge", "ClassLeadership", "StudentGovernmentBody",
  "ContentReport",
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function matches(pathname, list) {
  return list.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Ecosystem for a route: "academic" | "social" | "shared". */
export function getRouteEcosystem(pathname) {
  if (!pathname) return "shared";
  if (matches(pathname, ACADEMIC_ROUTES)) return "academic";
  if (matches(pathname, SOCIAL_ROUTES)) return "social";
  return "shared";
}

export function getFunctionEcosystem(name) {
  if (ACADEMIC_FUNCTIONS.includes(name)) return "academic";
  if (SOCIAL_FUNCTIONS.includes(name)) return "social";
  return "shared";
}

export function getWorkflowEcosystem(name) {
  if (ACADEMIC_WORKFLOWS.includes(name)) return "academic";
  if (SOCIAL_WORKFLOWS.includes(name)) return "social";
  return "shared";
}

export function getAgentEcosystem(id) {
  if (ACADEMIC_AGENTS.includes(id)) return "academic";
  if (SOCIAL_AGENTS.includes(id)) return "social";
  return "shared";
}

export function getEntityEcosystem(name) {
  if (ACADEMIC_ENTITIES.includes(name)) return "academic";
  if (SOCIAL_ENTITIES.includes(name)) return "social";
  return "shared";
}

// ─── Boundary rules ─────────────────────────────────────────────────────────
export const BOUNDARY_RULES = [
  "Academic code must not import Social components, hooks, or services (and vice versa).",
  "Cross-ecosystem needs route through a Shared service, never directly.",
  "Shared services are owned by the platform and may be used by either ecosystem.",
  "Each ecosystem owns its own navigation, screens, workflows, and business logic.",
  "Authentication, profile, Bud, notifications, search, settings, design system, and the AI foundation are always Shared.",
  "New routes/functions/workflows/agents/entities must be classified in this manifest before implementation.",
];

export function getEcosystemManifest() {
  return {
    ecosystems: Object.values(ECOSYSTEMS),
    sharedServices: SHARED_SERVICES,
    routes: { academic: ACADEMIC_ROUTES, social: SOCIAL_ROUTES, shared: SHARED_ROUTES },
    functions: { academic: ACADEMIC_FUNCTIONS, social: SOCIAL_FUNCTIONS, shared: SHARED_FUNCTIONS },
    workflows: { academic: ACADEMIC_WORKFLOWS, social: SOCIAL_WORKFLOWS, shared: SHARED_WORKFLOWS },
    agents: { academic: ACADEMIC_AGENTS, social: SOCIAL_AGENTS, shared: SHARED_AGENTS },
    entities: { academic: ACADEMIC_ENTITIES, social: SOCIAL_ENTITIES, shared: "remainder" },
    rules: BOUNDARY_RULES,
  };
}