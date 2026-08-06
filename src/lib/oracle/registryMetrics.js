/**
 * UNIBUD Operations Center — Live Registry Metrics Engine
 *
 * Pure, framework-agnostic derivations. Every number comes from real
 * registry entities (the single source of truth). No mock values,
 * no hardcoded counts. If the registry changes, metrics change.
 *
 * Scoped by filters: institution, faculty, department, semester,
 * academic session and date range.
 */

const LIMITS = {
  User: 2000,
  StudentRecord: 2000,
  Presence: 2000,
  Course: 1000,
  Assignment: 1000,
  AttendanceRecord: 1000,
  LiveClass: 500,
  Exam: 1000,
  ExamAttempt: 1000,
  BudConversation: 1000,
  AIServiceMetric: 500,
  Notification: 1000,
  Community: 1000,
  Club: 1000,
  QuadPost: 1000,
  Message: 1000,
  Institution: 1000,
  Staff: 1000,
  AuditLog: 200,
  AutomationRun: 500,
  ProviderLog: 500,
  SecurityEvent: 500,
  StudentDocument: 1000,
};

export const REGISTRY_ENTITIES = Object.keys(LIMITS);

// Which scope fields each entity actually owns.
// institution name (string) vs institution id — both carried by the filter.
const ENTITY_SCOPE = {
  StudentRecord: { nameFields: ["university"], idFields: [], extra: ["faculty", "department"] },
  Course: { nameFields: [], idFields: [], extra: ["faculty", "department", "semester"] },
  QuadPost: { nameFields: ["university"], idFields: [], extra: ["department"] },
  Community: { nameFields: ["university"], idFields: [], extra: ["faculty", "department"] },
  Club: { nameFields: ["university"], idFields: [], extra: [] },
  Staff: { nameFields: [], idFields: ["institution_id"], extra: [] },
  AttendanceRecord: { nameFields: [], idFields: ["institution_id"], extra: [] },
  LiveClass: { nameFields: [], idFields: ["institution_id"], extra: [] },
  StaffAnnouncement: { nameFields: [], idFields: ["institution_id"], extra: [] },
};

// Which date field a date-range filter should target (default: created_date).
const ENTITY_DATE_FIELD = {
  AttendanceRecord: "date",
  Exam: "date",
};

/**
 * Build a per-entity query object from the active filters.
 * Only applies a filter dimension when the entity actually owns that field,
 * so entities never get zeroed-out by an irrelevant filter.
 */
export function buildEntityFilter(entityName, f = {}) {
  const scope = ENTITY_SCOPE[entityName];
  const q = {};
  if (scope) {
    if (f.institutionName && scope.nameFields.length) {
      scope.nameFields.forEach((k) => (q[k] = f.institutionName));
    }
    if (f.institutionId && scope.idFields.length) {
      scope.idFields.forEach((k) => (q[k] = f.institutionId));
    }
    scope.extra.forEach((k) => {
      if (f[k]) q[k] = f[k];
    });
  }
  if (f.dateFrom || f.dateTo) {
    const d = {};
    if (f.dateFrom) d.$gte = new Date(f.dateFrom).toISOString();
    if (f.dateTo) {
      const end = new Date(f.dateTo);
      end.setHours(23, 59, 59, 999);
      d.$lte = end.toISOString();
    }
    q[ENTITY_DATE_FIELD[entityName] || "created_date"] = d;
  }
  return q;
}

export function registryLimit(entityName) {
  return LIMITS[entityName] || 1000;
}

// ─── Date helpers ───────────────────────────────────────────────────────────
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayKey = (d) => d.toISOString().slice(0, 10);
const sameDay = (iso, ref) => iso && dayKey(new Date(iso)) === dayKey(ref);
const withinDays = (iso, ref, n) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= ref.getTime() - n * 86400000 && t <= ref.getTime();
};

const safeNum = (v, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Derive the full metric tree from raw registry arrays.
 * `raw` is keyed by entity name. All counts are live.
 */
export function deriveMetrics(raw = {}, filters = {}) {
  const now = new Date();
  const todayStr = dayKey(now);
  const cap = (arr, limit) => (arr && arr.length === limit ? `${arr.length}+` : arr ? arr.length : 0);

  const students = raw.StudentRecord || [];
  const users = raw.User || [];
  const presence = raw.Presence || [];
  const courses = raw.Course || [];
  const assignments = raw.Assignment || [];
  const attendance = raw.AttendanceRecord || [];
  const liveClasses = raw.LiveClass || [];
  const exams = raw.Exam || [];
  const examAttempts = raw.ExamAttempt || [];
  const budConvos = raw.BudConversation || [];
  const aiMetrics = raw.AIServiceMetric || [];
  const notifications = raw.Notification || [];
  const communities = raw.Community || [];
  const clubs = raw.Club || [];
  const posts = raw.QuadPost || [];
  const messages = raw.Message || [];
  const institutions = raw.Institution || [];
  const staff = raw.Staff || [];
  const autoRuns = raw.AutomationRun || [];
  const providerLogs = raw.ProviderLog || [];
  const securityEvents = raw.SecurityEvent || [];
  const documents = raw.StudentDocument || [];

  const sLimit = LIMITS.StudentRecord;
  const uLimit = LIMITS.User;

  // ── Students ──
  const activeToday = students.filter((s) => sameDay(s.last_active_at, now)).length;
  const activeThisWeek = students.filter((s) => withinDays(s.last_active_at, now, 7)).length;
  const onlineNow = presence.filter((p) => p.status === "online").length;
  const newRegistrationsToday = users.filter((u) => sameDay(u.created_date, now)).length;
  const verifiedStudents = students.filter((s) => s.is_verified).length;
  const suspendedStudents = students.filter((s) => s.status === "suspended").length;

  // ── Academics ──
  const activeCourses = courses.filter((c) => c.status === "active").length;
  const studentsEnrolled = students.filter((s) => s.status === "active").length;
  const enrolledCourseCodes = new Set(students.map((s) => s.course_code).filter(Boolean));
  const coursesWithNoEnrollment = courses.filter((c) => c.code && !enrolledCourseCodes.has(c.code)).length;
  const averageCourseLoad = activeCourses > 0 ? round1(studentsEnrolled / activeCourses) : 0;

  // ── Attendance ──
  const attendanceToday = attendance.filter((a) => a.date === todayStr).length;
  const checkInsToday = attendance.filter((a) => a.date === todayStr && a.status === "present").length;
  const liveClassesNow = liveClasses.filter((l) => l.status === "live").length;
  const attendanceRate = attendanceToday > 0 ? Math.round((checkInsToday / attendanceToday) * 100) : 0;

  // ── Assignments ──
  const submittedToday = assignments.filter((a) => a.status === "submitted" && sameDay(a.updated_date, now)).length;
  const pending = assignments.filter((a) => a.status === "pending").length;
  const late = assignments.filter((a) => a.status === "late").length;
  const overdue = assignments.filter(
    (a) => a.status === "pending" && a.due_date && new Date(a.due_date) < now
  ).length;

  // ── Examinations ──
  const upcomingExams = exams.filter((e) => e.status === "upcoming" && (!e.date || e.date >= todayStr)).length;
  const activeExams = examAttempts.filter((a) => a.status === "in_progress").length;
  const completedExams = exams.filter((e) => e.status === "completed").length;

  // ── Bud AI ──
  const activeConversations = budConvos.filter((c) => withinDays(c.last_message_at, now, 0.0035)).length; // ~5 min
  const questionsToday = budConvos.filter((c) => sameDay(c.created_date, now)).length;
  const aiSessionsRunning = aiMetrics.length;
  const responseTimes = aiMetrics.map((m) => safeNum(m.response_time_ms)).filter((n) => n > 0);
  const averageResponseTime = responseTimes.length
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // ── Platform ──
  const activeSessions = presence.filter(
    (p) => p.status === "online" || p.status === "in_class" || p.status === "studying"
  ).length;
  const onlineUsers = onlineNow;
  const dailyLogins = presence.filter((p) => sameDay(p.last_active, now)).length;
  const weeklyActiveUsers = presence.filter((p) => withinDays(p.last_active, now, 7)).length;
  const monthlyActiveUsers = presence.filter((p) => withinDays(p.last_active, now, 30)).length;

  // ── Community ──
  const postsToday = posts.filter((p) => sameDay(p.created_date, now)).length;
  const messagesToday = messages.filter((m) => sameDay(m.created_date, now)).length;
  const activeCommunities = communities.filter((c) => safeNum(c.members_count) > 0).length;
  const activeClubs = clubs.filter((c) => c.is_recruiting || safeNum(c.members_count) > 0).length;

  // ── Institutions ──
  const universities = institutions.filter((i) => /university/i.test(i.type || "")).length;
  const faculties = new Set(courses.map((c) => c.faculty).filter(Boolean)).size;
  const departments = new Set(courses.map((c) => c.department).filter(Boolean)).size;
  const lecturers = staff.filter((s) => s.type === "academic").length;
  const staffCount = staff.length;

  // ── System ──
  const activeNotifications = notifications.filter((n) => !n.archived && !n.dismissed).length;
  const backgroundJobs = autoRuns.filter((r) => r.status === "running").length;
  const queueSize = autoRuns.filter((r) => r.status === "running").length;
  const failedJobs = autoRuns.filter((r) => r.status === "failed").length;
  const failedApi = providerLogs.filter((p) => p.ok === false).length;
  const apiRequests = providerLogs.length;
  const storageUsage = documents.length;

  const metrics = {
    students: {
      totalRegisteredStudents: cap(students, sLimit),
      activeToday,
      activeThisWeek,
      onlineNow,
      newRegistrationsToday,
      verifiedStudents,
      suspendedStudents,
    },
    academics: {
      totalCourses: courses.length,
      activeCourses,
      courseRegistrations: students.length,
      studentsCurrentlyEnrolled: studentsEnrolled,
      averageCourseLoad,
      coursesWithNoEnrollment,
    },
    attendance: {
      attendanceToday,
      checkInsToday,
      liveClasses: liveClassesNow,
      attendanceRate,
    },
    assignments: {
      totalAssignments: assignments.length,
      submittedToday,
      pending,
      late,
      overdue,
    },
    examinations: {
      upcomingExams,
      activeExams,
      completedExams,
    },
    budAi: {
      activeConversations,
      questionsToday,
      aiSessionsRunning,
      averageResponseTime,
    },
    platform: {
      activeSessions,
      onlineUsers,
      newAccountsToday: newRegistrationsToday,
      dailyLogins,
      weeklyActiveUsers,
      monthlyActiveUsers,
    },
    community: {
      postsToday,
      messagesToday,
      activeCommunities,
      activeClubs,
    },
    institutions: {
      universities,
      faculties,
      departments,
      lecturers,
      staff: staffCount,
    },
    system: {
      activeNotifications,
      backgroundJobs,
      queueSize,
      failedJobs,
      apiRequests,
      failedApi,
      storageUsage,
    },
  };

  return { metrics, health: computeHealth(metrics, securityEvents) };
}

/**
 * Platform health — Excellent / Healthy / Warning / Critical.
 * Score 0–100 from live registry signals.
 */
export function computeHealth(m, securityEvents = []) {
  const securityCritical = securityEvents.filter((s) => s.severity === "critical").length;
  let score = 100;
  const signals = [];

  if (m.system.failedJobs > 0) {
    score -= Math.min(30, m.system.failedJobs * 12);
    signals.push({ label: "Failed background jobs", value: m.system.failedJobs, tone: "critical" });
  }
  if (securityCritical > 0) {
    score -= Math.min(25, securityCritical * 12);
    signals.push({ label: "Critical security events", value: securityCritical, tone: "critical" });
  }
  if (m.budAi.averageResponseTime > 3000) {
    score -= 15;
    signals.push({ label: "AI response degraded", value: `${m.budAi.averageResponseTime}ms`, tone: "warning" });
  }
  if (m.assignments.overdue > 0) {
    score -= Math.min(10, m.assignments.overdue);
    signals.push({ label: "Overdue assignments", value: m.assignments.overdue, tone: "warning" });
  }
  if (m.students.suspendedStudents > 0) {
    score -= Math.min(8, m.students.suspendedStudents);
    signals.push({ label: "Suspended students", value: m.students.suspendedStudents, tone: "warning" });
  }
  if (m.attendance.attendanceRate > 0 && m.attendance.attendanceRate < 50) {
    score -= 10;
    signals.push({ label: "Low attendance rate", value: `${m.attendance.attendanceRate}%`, tone: "warning" });
  }
  if (m.system.failedApi > 0) {
    score -= Math.min(10, m.system.failedApi);
    signals.push({ label: "Failed API calls", value: m.system.failedApi, tone: "warning" });
  }
  if (m.platform.onlineUsers === 0) {
    score -= 5;
    signals.push({ label: "No users online", value: 0, tone: "info" });
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  let status = "critical";
  if (score >= 85) status = "excellent";
  else if (score >= 65) status = "healthy";
  else if (score >= 40) status = "warning";

  return { score, status, signals };
}

/**
 * Map an audit log entry to a friendly Live Activity event.
 * Falls back to the raw action text — never invents events.
 */
const ACTIVITY_MAP = [
  { test: (a) => /register|sign[\s-]?up|user[\s_]?create/i.test(a.action) || a.target_type === "user", label: "Student registered", icon: "UserPlus" },
  { test: (a) => a.target_type === "assignment" || /assign/i.test(a.action), label: "Assignment submitted", icon: "FileCheck" },
  { test: (a) => a.target_type === "course" || /course/i.test(a.action), label: "Course created", icon: "BookPlus" },
  { test: (a) => a.target_type === "exam" || /exam/i.test(a.action), label: "Exam started", icon: "ClipboardCheck" },
  { test: (a) => /bud|conversation/i.test(a.target_type || "") || /bud/i.test(a.action), label: "Bud conversation started", icon: "Sparkles" },
  { test: (a) => a.target_type === "community" || /communit/i.test(a.action), label: "Community created", icon: "Users" },
  { test: (a) => a.target_type === "institution" || /institution/i.test(a.action), label: "Institution updated", icon: "Building2" },
  { test: (a) => a.target_type === "notification" || /notif/i.test(a.action), label: "Notification sent", icon: "Bell" },
];

export function mapActivity(a) {
  const hit = ACTIVITY_MAP.find((m) => m.test(a));
  return {
    id: a.id,
    label: hit ? hit.label : a.action,
    icon: hit ? hit.icon : "Activity",
    actor: a.actor_name,
    target: a.target_name || a.target_type || "",
    time: a.created_date,
    severity: a.severity,
    raw: a.action,
  };
}