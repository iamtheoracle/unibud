/**
 * UNIBUD University Portal — Configuration
 * Separate from the Platform Operations Center (/portal) and Student App.
 * Own roles, navigation, and RBAC for university staff.
 */

// ─── University Staff Roles ──────────────────────────────────────────────────
export const UNI_ROLES = [
  { key: "lecturer", name: "Lecturer", level: 1, description: "Teach courses, manage assignments, attendance, and grades." },
  { key: "course_coordinator", name: "Course Coordinator", level: 2, description: "Coordinate courses across multiple lecturers and sections." },
  { key: "department_admin", name: "Department Administrator", level: 3, description: "Manage department lecturers, courses, students, and approvals." },
  { key: "faculty_admin", name: "Faculty Administrator", level: 4, description: "Manage faculty departments, programmes, and analytics." },
  { key: "university_admin", name: "University Administrator", level: 5, description: "Manage the entire university, faculties, students, and settings." },
];

const UNI_ROLE_KEYS = UNI_ROLES.map((r) => r.key);

export function isUniRole(role) {
  return UNI_ROLE_KEYS.includes(role);
}

export function getUniRoleName(role) {
  return UNI_ROLES.find((r) => r.key === role)?.name || "Staff";
}

export function getUniRoleLevel(role) {
  return UNI_ROLES.find((r) => r.key === role)?.level || 1;
}

// ─── Navigation ──────────────────────────────────────────────────────────────
// Full 20-item sidebar. Each item lists the roles that may see it.
const ALL_UNI = ["lecturer", "course_coordinator", "department_admin", "faculty_admin", "university_admin"];
const ADMIN_UP = ["department_admin", "faculty_admin", "university_admin"];
const COORD_UP = ["course_coordinator", "department_admin", "faculty_admin", "university_admin"];
const FAC_UP = ["faculty_admin", "university_admin"];
const UNI_ONLY = ["university_admin"];

export const UNI_NAV_ITEMS = [
  { label: "Dashboard", icon: "LayoutDashboard", path: "/uni-portal", roles: ALL_UNI, section: "Overview" },
  { label: "Academic", icon: "BookOpen", path: "/uni-portal/academic", roles: ALL_UNI, section: "Overview" },
  { label: "Students", icon: "Users", path: "/uni-portal/students", roles: ALL_UNI, section: "Overview" },
  { label: "Courses", icon: "Library", path: "/uni-portal/courses", roles: ALL_UNI, section: "Overview" },

  { label: "Assignments", icon: "ClipboardList", path: "/uni-portal/assignments", roles: ALL_UNI, section: "Teaching" },
  { label: "Examinations", icon: "FileText", path: "/uni-portal/examinations", roles: ALL_UNI, section: "Teaching" },
  { label: "Attendance", icon: "CheckSquare", path: "/uni-portal/attendance", roles: ALL_UNI, section: "Teaching" },
  { label: "Live Classes", icon: "Video", path: "/uni-portal/live", roles: ALL_UNI, section: "Teaching" },

  { label: "Resources", icon: "FolderOpen", path: "/uni-portal/resources", roles: ALL_UNI, section: "Resources" },
  { label: "Study Groups", icon: "UsersRound", path: "/uni-portal/study-groups", roles: ALL_UNI, section: "Resources" },
  { label: "Research", icon: "FlaskConical", path: "/uni-portal/research", roles: COORD_UP, section: "Resources" },

  { label: "Campus Events", icon: "CalendarDays", path: "/uni-portal/events", roles: ADMIN_UP, section: "Campus" },
  { label: "Announcements", icon: "Megaphone", path: "/uni-portal/announcements", roles: ALL_UNI, section: "Campus" },
  { label: "Messaging", icon: "MessageSquare", path: "/uni-portal/messaging", roles: ALL_UNI, section: "Campus" },

  { label: "Reports", icon: "BarChart3", path: "/uni-portal/reports", roles: ADMIN_UP, section: "Insights" },
  { label: "Analytics", icon: "LineChart", path: "/uni-portal/analytics", roles: ADMIN_UP, section: "Insights" },
  { label: "Approvals", icon: "ClipboardCheck", path: "/uni-portal/approvals", roles: COORD_UP, section: "Insights" },

  { label: "Notifications", icon: "Bell", path: "/uni-portal/notifications", roles: ALL_UNI, section: "Account" },
  { label: "Settings", icon: "Settings", path: "/uni-portal/settings", roles: UNI_ONLY, section: "Account" },
  { label: "Profile", icon: "User", path: "/uni-portal/profile", roles: ALL_UNI, section: "Account" },
];

export function getUniNav(role) {
  return UNI_NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function canAccessUniPath(role, path) {
  const item = UNI_NAV_ITEMS.find(
    (n) => n.path === path || (n.path !== "/uni-portal" && path.startsWith(n.path))
  );
  if (!item) return true; // unlisted paths (dashboard index) open to all uni staff
  return item.roles.includes(role);
}

// ─── Quick Actions per role ──────────────────────────────────────────────────
export const UNI_QUICK_ACTIONS = [
  { label: "Take Attendance", icon: "CheckSquare", path: "/uni-portal/attendance", roles: ["lecturer", "course_coordinator"] },
  { label: "Create Assignment", icon: "ClipboardList", path: "/uni-portal/assignments", roles: ALL_UNI },
  { label: "Start Live Class", icon: "Video", path: "/uni-portal/live", roles: ALL_UNI },
  { label: "Upload Resource", icon: "FolderOpen", path: "/uni-portal/resources", roles: ALL_UNI },
  { label: "Send Announcement", icon: "Megaphone", path: "/uni-portal/announcements", roles: ALL_UNI },
  { label: "Message Students", icon: "MessageSquare", path: "/uni-portal/messaging", roles: ALL_UNI },
  { label: "Create Course", icon: "Library", path: "/uni-portal/courses", roles: ADMIN_UP },
  { label: "Create Exam", icon: "FileText", path: "/uni-portal/examinations", roles: ALL_UNI },
];

export function getUniQuickActions(role) {
  return UNI_QUICK_ACTIONS.filter((a) => a.roles.includes(role));
}