/**
 * Entity Sync Registry
 *
 * Maps each entity type to:
 *  - queryPrefixes: React Query key prefixes to invalidate on change
 *  - domains: which UNIBUD domains are affected (for the sync bus event)
 *
 * When an entity changes (create/update/delete), the RealtimeSyncProvider
 * invalidates all listed prefixes and emits a cross-domain sync event.
 * This causes every component, widget, dashboard, and feed displaying that
 * data to refetch automatically — no manual refresh needed.
 */
export const SYNC_REGISTRY = {
  // ── Academic ──
  Assignment: { prefixes: ["assignments", "upcoming-deadlines", "academic-hub", "agenda", "deadline-alerts", "academic-snapshot", "today-schedule", "tasks"], domains: ["academic", "calendar", "bud"] },
  Exam: { prefixes: ["exams", "academic-hub", "exam"], domains: ["academic", "bud"] },
  Course: { prefixes: ["courses", "academic-hub", "course"], domains: ["academic"] },
  TimetableEntry: { prefixes: ["timetable", "academic-hub", "today-schedule"], domains: ["academic", "calendar"] },
  Grade: { prefixes: ["grades", "results", "academic-hub", "gpa", "academic-insights"], domains: ["academic", "me", "bud"] },
  CalendarEvent: { prefixes: ["calendar-events", "calendar", "academic-hub"], domains: ["calendar", "academic"] },
  Note: { prefixes: ["notes", "academic-hub"], domains: ["academic"] },
  TaskManagement: { prefixes: ["tasks", "academic-hub", "task"], domains: ["academic", "bud"] },
  StudyGroup: { prefixes: ["study-groups", "connect"], domains: ["academic", "connect"] },
  StudyGroupResource: { prefixes: ["org-files", "study-group-resources", "resources"], domains: ["academic"] },
  Flashcard: { prefixes: ["flashcards"], domains: ["academic"] },
  AcademicFile: { prefixes: ["academic-files", "files"], domains: ["academic"] },
  StudentGoal: { prefixes: ["goals", "study-goals"], domains: ["academic", "me"] },
  StudySession: { prefixes: ["study-sessions", "study"], domains: ["academic"] },
  Project: { prefixes: ["projects", "academic-hub"], domains: ["academic"] },

  // ── Social ──
  QuadPost: { prefixes: ["quad-posts", "community-posts", "feed", "quad"], domains: ["social", "search"] },
  ShortVideo: { prefixes: ["shorts", "short-videos"], domains: ["social", "search"] },
  Story: { prefixes: ["stories"], domains: ["social"] },
  Podcast: { prefixes: ["podcasts", "podcast"], domains: ["social"] },
  PodcastEpisode: { prefixes: ["episodes", "podcasts", "podcast"], domains: ["social"] },
  Highlight: { prefixes: ["highlights"], domains: ["social"] },
  Community: { prefixes: ["communities", "community"], domains: ["social", "connect"] },
  MarketplaceListing: { prefixes: ["marketplace", "listings"], domains: ["social", "search"] },
  LostFoundItem: { prefixes: ["lost-found", "lost-items"], domains: ["social"] },

  // ── Organization ──
  Club: { prefixes: ["clubs", "club"], domains: ["social", "connect"] },
  ClubDiscussion: { prefixes: ["org-discussions"], domains: ["social", "connect"] },
  ClubElection: { prefixes: ["org-elections"], domains: ["social"] },
  ClubFinance: { prefixes: ["org-finance"], domains: ["social"] },
  ClubAttendance: { prefixes: ["org-attendance"], domains: ["social"] },

  // ── Connect ──
  Message: { prefixes: ["messages", "conversations"], domains: ["connect"] },
  Conversation: { prefixes: ["conversations", "messages"], domains: ["connect"] },
  Follow: { prefixes: ["follows", "following", "friends"], domains: ["connect", "social"] },
  FriendRequest: { prefixes: ["friend-requests", "friends"], domains: ["connect"] },

  // ── Notifications ──
  Notification: { prefixes: ["notifications", "notification-center", "unread", "notification"], domains: ["all"] },

  // ── Career ──
  Opportunity: { prefixes: ["opportunities", "career"], domains: ["career", "search"] },
  ApplicationTracker: { prefixes: ["applications", "career"], domains: ["career", "me"] },
  Mentor: { prefixes: ["mentors", "mentorship"], domains: ["career", "connect"] },
  MentorshipRequest: { prefixes: ["mentorship-requests"], domains: ["career", "connect"] },

  // ── Me ──
  StudentAchievement: { prefixes: ["achievements", "me"], domains: ["me", "academic"] },
  WellnessEntry: { prefixes: ["wellness", "me"], domains: ["me", "bud"] },
  PortfolioItem: { prefixes: ["portfolio", "me"], domains: ["me", "career"] },

  // ── Campus ──
  CampusEvent: { prefixes: ["events", "campus-events", "community-events", "org-events", "campus", "academic-hub-events"], domains: ["social", "calendar", "connect", "campus"] },
  CampusLocation: { prefixes: ["campus-locations", "campus"], domains: ["campus"] },

  // ── University Profile (official) ──
  StaffAnnouncement: { prefixes: ["announcements", "staff-announcements"], domains: ["notifications", "bud"] },
  EmergencyNotice: { prefixes: ["emergencies", "emergency-notices"], domains: ["notifications", "bud"] },
  AcademicCalendarEvent: { prefixes: ["academic-calendar", "calendar"], domains: ["calendar", "bud"] },
  ExamSchedule: { prefixes: ["exam-schedule", "exams"], domains: ["academic", "calendar", "bud"] },
  Faculty: { prefixes: ["faculties", "university-profile"], domains: ["bud"] },
  Department: { prefixes: ["departments", "university-profile"], domains: ["bud"] },
  CourseCatalogEntry: { prefixes: ["course-catalog", "university-profile"], domains: ["academic"] },

  // ── Tutor ──
  TutorProfile: { prefixes: ["tutors", "tutor"], domains: ["academic"] },
  TutorBooking: { prefixes: ["tutor-bookings", "bookings"], domains: ["academic", "notifications"] },

  // ── External Content (provenance-tracked) ──
  ExternalContent: { prefixes: ["external-content", "integration-transition"], domains: ["social", "search", "bud"] },
};

/**
 * Domains that should always be invalidated when "all" is in the domains list.
 */
export const ALL_DOMAINS = ["academic", "social", "connect", "me", "notifications", "calendar", "bud", "career", "campus", "search"];