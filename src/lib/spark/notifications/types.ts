/**
 * Spark Notification Engine — type vocabulary.
 *
 * Priority + category are the two axes the engine (and Bud's attention
 * optimizer) reason about. Priorities are weighted so the UI can sort and
 * so silent notifications never interrupt study sessions.
 */
export type NotificationPriority =
  | "critical"
  | "high"
  | "normal"
  | "low"
  | "silent";

export type NotificationCategory =
  | "system"
  | "bud"
  | "study_group"
  | "assignment"
  | "campus"
  | "opportunity"
  | "achievement"
  | "social"
  | "emergency";

export const PRIORITY_WEIGHT: Record<NotificationPriority, number> = {
  critical: 5,
  high: 4,
  normal: 3,
  low: 2,
  silent: 1,
};

/** Priorities that must never interrupt the user. */
export const SILENT_PRIORITIES: NotificationPriority[] = ["silent", "low"];

export const PRIORITY_LABEL: Record<NotificationPriority, string> = {
  critical: "Critical",
  high: "High",
  normal: "Normal",
  low: "Low",
  silent: "Silent",
};

/**
 * Canonical Spark event names. Every module (StudyGroup, Assignment, Bud,
 * Oracle, Management, …) publishes one of these — never an ad-hoc string —
 * so the engine always finds a matching rule.
 */
export const SPARK_EVENTS = {
  TASK_ASSIGNED: "task.assigned",
  TASK_UPDATED: "task.updated",
  TASK_COMPLETED: "task.completed",
  COMMENT_ADDED: "comment.added",
  MENTION: "mention",
  REPLY: "reply",
  DEADLINE_REMINDER: "deadline.reminder",
  ASSIGNMENT_DUE: "assignment.due",
  EXAM_REMINDER: "exam.reminder",
  CLASS_STARTING: "class.starting",
  LIVE_LECTURE_STARTED: "live.lecture.started",
  STUDY_SESSION_INVITATION: "study.session.invitation",
  GROUP_INVITATION: "group.invitation",
  FRIEND_REQUEST: "friend.request",
  MESSAGE_NEW: "message.new",
  BUD_RECOMMENDATION: "bud.recommendation",
  ACADEMIC_INSIGHT: "academic.insight",
  GRADE_RELEASED: "grade.released",
  ATTENDANCE_ALERT: "attendance.alert",
  ACHIEVEMENT_UNLOCKED: "achievement.unlocked",
  STUDY_STREAK: "study.streak",
  SYSTEM_ANNOUNCEMENT: "system.announcement",
  EMERGENCY_ALERT: "emergency.alert",
  MANAGEMENT_BROADCAST: "management.broadcast",
  UNIVERSITY_BROADCAST: "university.broadcast",
  CAMPUS_EVENT: "campus.event",
  OPPORTUNITY: "opportunity",
  SCHOLARSHIP: "scholarship",
  INTERNSHIP: "internship",
  MARKETPLACE: "marketplace",
  LIBRARY_REMINDER: "library.reminder",
  TRANSPORT_REMINDER: "transport.reminder",
  TIMETABLE_CHANGES: "timetable.changes",
} as const;

export type SparkEventName = (typeof SPARK_EVENTS)[keyof typeof SPARK_EVENTS];