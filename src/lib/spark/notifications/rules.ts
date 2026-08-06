import type { NotificationRule, NotificationEngineService } from "./interface";
import { SPARK_EVENTS as E } from "./types";

const field = (f: string) => ({ kind: "field", field: f }) as const;
const members = { kind: "members_except_actor" } as const;
const all = { kind: "all" } as const;

/**
 * Default rule catalog — one rule per notification type in the spec.
 * Each maps a canonical Spark event to category, priority, audience,
 * batching key/label, and a message template. Modules publish events;
 * the engine resolves these into notifications.
 */
export const DEFAULT_RULES: NotificationRule[] = [
  // ---- Study groups / tasks ----
  { eventName: E.TASK_ASSIGNED, category: "study_group", defaultPriority: "high", source: "StudyGroup", audience: field("assignee_id"), batchKey: (p) => (p?.group_id ? `task:${p.group_id}` : null), batchLabel: (p) => p?.group_name || "your group", template: (p) => ({ title: "New task assigned", message: `${p?.actor_name || "A member"} assigned you "${p?.task_title || "a task"}".`, icon: "CheckSquare", link: `/study-groups/${p?.group_id || ""}` }) },
  { eventName: E.TASK_UPDATED, category: "study_group", defaultPriority: "low", source: "StudyGroup", audience: field("assignee_id"), batchKey: (p) => (p?.group_id ? `task.updated:${p.group_id}` : null), batchLabel: (p) => p?.task_title || "a task", canInterrupt: () => false, template: (p) => ({ title: "Task updated", message: `${p?.actor_name || "A member"} updated "${p?.task_title || "a task"}".`, icon: "ListChecks", link: `/study-groups/${p?.group_id || ""}` }) },
  { eventName: E.TASK_COMPLETED, category: "study_group", defaultPriority: "normal", source: "StudyGroup", audience: field("owner_id"), template: (p) => ({ title: "Task completed", message: `${p?.actor_name || "A member"} completed "${p?.task_title || "a task"}".`, icon: "CheckCircle2", link: `/study-groups/${p?.group_id || ""}` }) },
  { eventName: E.COMMENT_ADDED, category: "social", defaultPriority: "low", source: "Quad", audience: members, canInterrupt: () => false, template: (p) => ({ title: "New comment", message: `${p?.actor_name || "Someone"} commented on your post.`, icon: "MessageSquare", link: p?.link || "/quad" }) },
  { eventName: E.MENTION, category: "social", defaultPriority: "high", source: "Connect", audience: field("mentioned_id"), template: (p) => ({ title: "You were mentioned", message: `${p?.actor_name || "Someone"} mentioned you.`, icon: "AtSign", link: p?.link || "/quad" }) },
  { eventName: E.REPLY, category: "social", defaultPriority: "normal", source: "Connect", audience: field("parent_author_id"), template: (p) => ({ title: "New reply", message: `${p?.actor_name || "Someone"} replied to your message.`, icon: "Reply", link: p?.link || "/quad" }) },

  // ---- Academic ----
  { eventName: E.DEADLINE_REMINDER, category: "assignment", defaultPriority: "high", source: "Assignment", audience: field("user_id"), template: (p) => ({ title: "Deadline reminder", message: `"${p?.title || "Assignment"}" is due ${p?.when || "soon"}.`, icon: "AlarmClock", link: "/assignments" }) },
  { eventName: E.ASSIGNMENT_DUE, category: "assignment", defaultPriority: "critical", source: "Assignment", audience: field("user_id"), template: (p) => ({ title: "Assignment due", message: `"${p?.title || "Assignment"}" is due now.`, icon: "FileWarning", link: "/assignments" }) },
  { eventName: E.EXAM_REMINDER, category: "assignment", defaultPriority: "critical", source: "Exam", audience: field("user_id"), template: (p) => ({ title: "Exam reminder", message: `${p?.title || "An exam"} begins ${p?.when || "soon"}.`, icon: "GraduationCap", link: "/academics" }) },
  { eventName: E.CLASS_STARTING, category: "campus", defaultPriority: "high", source: "Class", audience: field("user_id"), template: (p) => ({ title: "Class starting soon", message: `${p?.title || "A class"} starts in ${p?.in_minutes || 15} min.`, icon: "CalendarClock", link: "/live" }) },
  { eventName: E.LIVE_LECTURE_STARTED, category: "campus", defaultPriority: "high", source: "LiveClass", audience: members, template: (p) => ({ title: "Live lecture started", message: `${p?.title || "A lecture"} is now live.`, icon: "Radio", link: p?.link || "/live" }) },
  { eventName: E.GRADE_RELEASED, category: "assignment", defaultPriority: "high", source: "Grade", audience: field("user_id"), template: (p) => ({ title: "Grade released", message: `Your grade for "${p?.title || "a course"}" is available.`, icon: "TrendingUp", link: "/academic-analytics" }) },
  { eventName: E.ATTENDANCE_ALERT, category: "assignment", defaultPriority: "normal", source: "Class", audience: field("user_id"), canInterrupt: () => false, template: (p) => ({ title: "Attendance alert", message: p?.message || "Your attendance is below the required threshold.", icon: "UserCheck", link: "/academics" }) },
  { eventName: E.TIMETABLE_CHANGES, category: "campus", defaultPriority: "normal", source: "Class", audience: all, template: (p) => ({ title: "Timetable updated", message: p?.message || "Your class timetable has changed.", icon: "CalendarX", link: "/calendar" }) },

  // ---- Study / achievements ----
  { eventName: E.STUDY_SESSION_INVITATION, category: "study_group", defaultPriority: "normal", source: "StudyGroup", audience: field("invitee_id"), template: (p) => ({ title: "Study session invitation", message: `${p?.actor_name || "Someone"} invited you to a study session.`, icon: "Users", link: "/study-groups" }) },
  { eventName: E.STUDY_STREAK, category: "achievement", defaultPriority: "normal", source: "Bud", audience: field("user_id"), canInterrupt: () => false, template: (p) => ({ title: "Study streak", message: p?.message || "You're on a study streak. Keep it up!", icon: "Flame", link: "/me" }) },
  { eventName: E.ACHIEVEMENT_UNLOCKED, category: "achievement", defaultPriority: "high", source: "Bud", audience: field("user_id"), template: (p) => ({ title: "Achievement unlocked", message: p?.message || "You unlocked a new achievement.", icon: "Trophy", link: "/achievements" }) },

  // ---- Social ----
  { eventName: E.GROUP_INVITATION, category: "social", defaultPriority: "normal", source: "StudyGroup", audience: field("invitee_id"), template: (p) => ({ title: "Group invitation", message: `${p?.actor_name || "Someone"} invited you to join "${p?.group_name || "a group"}".`, icon: "UserPlus", link: "/study-groups" }) },
  { eventName: E.FRIEND_REQUEST, category: "social", defaultPriority: "normal", source: "Connect", audience: field("to_id"), template: (p) => ({ title: "New connection", message: `${p?.actor_name || "Someone"} wants to connect with you.`, icon: "UserPlus", link: "/connect" }) },
  { eventName: E.MESSAGE_NEW, category: "social", defaultPriority: "normal", source: "Connect", audience: field("to_id"), batchKey: (p) => (p?.conversation_id ? `msg:${p.conversation_id}` : null), batchLabel: (p) => p?.conversation_title || "a conversation", template: (p) => ({ title: "New message", message: `${p?.actor_name || "Someone"}: ${p?.preview || ""}`, icon: "MessageCircle", link: `/messages/${p?.conversation_id || ""}` }) },

  // ---- Bud ----
  { eventName: E.BUD_RECOMMENDATION, category: "bud", defaultPriority: "low", source: "Bud", audience: field("user_id"), canInterrupt: () => false, template: (p) => ({ title: "Bud suggestion", message: p?.message || "Bud has a recommendation for you.", icon: "Sparkles", link: "/bud" }) },
  { eventName: E.ACADEMIC_INSIGHT, category: "bud", defaultPriority: "low", source: "Bud", audience: field("user_id"), canInterrupt: () => false, template: (p) => ({ title: "Academic insight", message: p?.message || "Bud noticed a pattern in your studies.", icon: "Lightbulb", link: "/academic-analytics" }) },

  // ---- Campus ----
  { eventName: E.CAMPUS_EVENT, category: "campus", defaultPriority: "normal", source: "Campus", audience: all, template: (p) => ({ title: "Campus event", message: p?.message || "A new campus event was posted.", icon: "CalendarDays", link: "/events" }) },
  { eventName: E.LIBRARY_REMINDER, category: "campus", defaultPriority: "low", source: "Library", audience: field("user_id"), canInterrupt: () => false, template: (p) => ({ title: "Library reminder", message: p?.message || "A borrowed resource is due soon.", icon: "BookOpen", link: "/library" }) },
  { eventName: E.TRANSPORT_REMINDER, category: "campus", defaultPriority: "low", source: "Campus", audience: all, canInterrupt: () => false, template: (p) => ({ title: "Transport reminder", message: p?.message || "Campus transport schedule update.", icon: "Bus", link: "/calendar" }) },

  // ---- Opportunities ----
  { eventName: E.OPPORTUNITY, category: "opportunity", defaultPriority: "normal", source: "Campus", audience: all, template: (p) => ({ title: "New opportunity", message: p?.message || "A new opportunity matched your profile.", icon: "Briefcase", link: "/opportunities" }) },
  { eventName: E.SCHOLARSHIP, category: "opportunity", defaultPriority: "high", source: "Campus", audience: all, template: (p) => ({ title: "Scholarship open", message: p?.message || "A scholarship you may be eligible for is now open.", icon: "Award", link: "/scholarships" }) },
  { eventName: E.INTERNSHIP, category: "opportunity", defaultPriority: "normal", source: "Campus", audience: all, template: (p) => ({ title: "Internship posted", message: p?.message || "A new internship is available.", icon: "Building2", link: "/career" }) },
  { eventName: E.MARKETPLACE, category: "campus", defaultPriority: "low", source: "Campus", audience: all, canInterrupt: () => false, template: (p) => ({ title: "Marketplace update", message: p?.message || "New listing on the campus marketplace.", icon: "ShoppingBag", link: "/marketplace" }) },

  // ---- System ----
  { eventName: E.SYSTEM_ANNOUNCEMENT, category: "system", defaultPriority: "high", source: "System", audience: all, template: (p) => ({ title: "System announcement", message: p?.message || "UNIBUD system update.", icon: "Info", link: "/" }) },
  { eventName: E.EMERGENCY_ALERT, category: "emergency", defaultPriority: "critical", source: "System", audience: all, template: (p) => ({ title: "Emergency alert", message: p?.message || "An emergency alert was issued.", icon: "AlertTriangle", link: "/" }) },
  { eventName: E.MANAGEMENT_BROADCAST, category: "system", defaultPriority: "high", source: "Management", audience: all, template: (p) => ({ title: "Management broadcast", message: p?.message || "A message from institutional management.", icon: "Megaphone", link: "/" }) },
  { eventName: E.UNIVERSITY_BROADCAST, category: "system", defaultPriority: "normal", source: "Management", audience: all, template: (p) => ({ title: "University broadcast", message: p?.message || "A message from your university.", icon: "Building", link: "/" }) },
];

/** Register the full default catalog onto an engine instance. */
export function registerDefaultRules(engine: NotificationEngineService): void {
  for (const rule of DEFAULT_RULES) engine.registerRule(rule);
}