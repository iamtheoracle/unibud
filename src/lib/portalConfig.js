/**
 * UNIBUD Platform Operations Portal — Configuration
 * Central registry for modules, roles, and portal navigation.
 */

// ─── Platform Modules ───────────────────────────────────────────────────────
export const PLATFORM_MODULES = [
  // Student Experience
  { key: "campus", display_name: "Campus", category: "student_experience", icon: "Home", description: "Student home dashboard with morning briefing, schedule, and campus life.", enabled: true, sort_order: 1 },
  { key: "quad", display_name: "Quad", category: "student_experience", icon: "Compass", description: "Campus social feed with posts, discussions, polls, and communities.", enabled: true, sort_order: 2 },
  { key: "connect", display_name: "Connect", category: "student_experience", icon: "Users", description: "Study matching, mentorship, events, and career networking.", enabled: true, sort_order: 3 },
  { key: "bud", display_name: "Bud", category: "student_experience", icon: "Sparkles", description: "Trusted university companion for study help and guidance.", enabled: true, sort_order: 4 },
  { key: "library", display_name: "Library", category: "student_experience", icon: "Library", description: "Digital library with books, journals, past questions, and notes.", enabled: true, sort_order: 5 },
  { key: "notifications", display_name: "Notifications", category: "student_experience", icon: "Bell", description: "Centralised notification center for all platform alerts.", enabled: true, sort_order: 6 },
  { key: "search", display_name: "Search", category: "student_experience", icon: "Search", description: "Universal search across modules, resources, and people.", enabled: true, sort_order: 7 },
  { key: "profile", display_name: "Profile", category: "student_experience", icon: "User", description: "Student profile with academic progress and achievements.", enabled: true, sort_order: 8 },
  { key: "settings", display_name: "Settings", category: "student_experience", icon: "Settings", description: "Student account and app preferences.", enabled: true, sort_order: 9 },

  // Academic
  { key: "assignments", display_name: "Assignments", category: "academic", icon: "ClipboardList", description: "Assignment tracking with deadlines, submission, and grading.", enabled: true, sort_order: 10 },
  { key: "examinations", display_name: "Examinations", category: "academic", icon: "FileText", description: "Exam schedules, revision tracking, and results.", enabled: true, sort_order: 11 },
  { key: "timetable", display_name: "Timetable", category: "academic", icon: "CalendarDays", description: "Weekly class timetable and schedule management.", enabled: true, sort_order: 12 },
  { key: "live", display_name: "UNIBUD Live", category: "academic", icon: "Video", description: "Virtual classroom with live lectures, recordings, and study groups.", enabled: true, sort_order: 13 },
  { key: "research", display_name: "Research", category: "academic", icon: "FlaskConical", description: "Research projects, publications, and collaboration tools.", enabled: true, sort_order: 14 },

  // Social
  { key: "study_groups", display_name: "Study Groups", category: "social", icon: "UsersRound", description: "Course, department, revision, and project study groups with voice and video rooms.", enabled: true, sort_order: 15 },
  { key: "communities", display_name: "Communities", category: "social", icon: "Heart", description: "Student communities, clubs, and interest-based groups.", enabled: true, sort_order: 16 },
  { key: "events", display_name: "Events", category: "social", icon: "CalendarHeart", description: "Campus events, workshops, and activity calendar.", enabled: true, sort_order: 17 },

  // Opportunities
  { key: "scholarships", display_name: "Scholarships", category: "opportunities", icon: "Award", description: "Scholarship discovery, tracking, and applications.", enabled: true, sort_order: 18 },
  { key: "internships", display_name: "Internships", category: "opportunities", icon: "Briefcase", description: "Internship opportunities and application tracking.", enabled: true, sort_order: 19 },
  { key: "marketplace", display_name: "Marketplace", category: "opportunities", icon: "ShoppingBag", description: "Campus marketplace for textbooks, electronics, and services.", enabled: true, sort_order: 20 },
  { key: "career_hub", display_name: "Career Hub", category: "opportunities", icon: "TrendingUp", description: "Career guidance, job postings, and professional development.", enabled: true, sort_order: 21 },

  // Campus Services
  { key: "campus_navigation", display_name: "Campus Navigation", category: "campus_services", icon: "MapPin", description: "Interactive campus maps and navigation.", enabled: true, sort_order: 22 },
  { key: "accommodation", display_name: "Accommodation", category: "campus_services", icon: "Building2", description: "Student housing listings and accommodation services.", enabled: true, sort_order: 23 },
  { key: "transport", display_name: "Transport", category: "campus_services", icon: "Bus", description: "Campus transport schedules and shuttle tracking.", enabled: true, sort_order: 24 },
  { key: "dining", display_name: "Dining", category: "campus_services", icon: "UtensilsCrossed", description: "Campus dining halls, menus, and meal plans.", enabled: true, sort_order: 25 },

  // Wellbeing
  { key: "student_support", display_name: "Student Support", category: "wellbeing", icon: "HeartHandshake", description: "Dedicated wellbeing space for stress, anxiety, and student life support.", enabled: true, sort_order: 26 },

  // Portals
  { key: "lecturer_portal", display_name: "Lecturer Portal", category: "portals", icon: "GraduationCap", description: "Lecturer dashboard for classes, assignments, attendance, and analytics.", enabled: true, sort_order: 27 },
  { key: "department_portal", display_name: "Department Portal", category: "portals", icon: "Layers", description: "Department administrator dashboard for courses, lecturers, and students.", enabled: true, sort_order: 28 },
  { key: "faculty_portal", display_name: "Faculty Portal", category: "portals", icon: "Building", description: "Faculty administrator dashboard for departments, programs, and reports.", enabled: true, sort_order: 29 },
  { key: "university_portal", display_name: "University Portal", category: "portals", icon: "Landmark", description: "University administrator dashboard for faculties, students, and settings.", enabled: true, sort_order: 30 },

  // Platform
  { key: "reports", display_name: "Reports", category: "platform", icon: "BarChart3", description: "Platform-wide reports and data exports.", enabled: true, sort_order: 31 },
  { key: "analytics", display_name: "Analytics", category: "platform", icon: "LineChart", description: "Platform analytics, growth metrics, and business intelligence.", enabled: true, sort_order: 32 },
  { key: "bud_management", display_name: "Bud Management", category: "platform", icon: "Bot", description: "Bud configuration, knowledge base, and behavior tuning.", enabled: true, sort_order: 33 },
  { key: "media", display_name: "Media", category: "platform", icon: "Image", description: "Media library and asset management.", enabled: true, sort_order: 34 },
  { key: "content", display_name: "Content", category: "platform", icon: "FileEdit", description: "Content management for announcements, articles, and resources.", enabled: true, sort_order: 35 },
  { key: "support", display_name: "Support", category: "platform", icon: "LifeBuoy", description: "Support ticket management and customer success.", enabled: true, sort_order: 36 },
  { key: "administration", display_name: "Administration", category: "platform", icon: "Shield", description: "Platform administration, security, and system configuration.", enabled: true, sort_order: 37 },
];

// ─── Role Hierarchy ──────────────────────────────────────────────────────────
export const ROLE_HIERARCHY = [
  { key: "student", name: "Student", level: 1, description: "Access to the student application only.", isPortal: false },
  { key: "lecturer", name: "Lecturer", level: 2, description: "Manage classes, assignments, attendance, and assessments.", isPortal: true },
  { key: "department_admin", name: "Department Administrator", level: 3, description: "Manage department courses, lecturers, and students.", isPortal: true },
  { key: "faculty_admin", name: "Faculty Administrator", level: 4, description: "Manage faculty departments, programs, and reports.", isPortal: true },
  { key: "university_admin", name: "University Administrator", level: 5, description: "Manage university faculties, students, and settings.", isPortal: true },
  { key: "operations_staff", name: "Operations Staff", level: 6, description: "Support, moderation, content, and university onboarding.", isPortal: true },
  { key: "executive", name: "Executive / Co-Founder", level: 7, description: "Strategic dashboards, growth, and business intelligence.", isPortal: true },
  { key: "oracle", name: "Oracle", level: 8, description: "Supreme platform authority. Full control over all modules and settings.", isPortal: true },
];

// Legacy role mapping
const LEGACY_ROLE_MAP = {
  user: "student",
  admin: "oracle",
};

export function normalizeRole(role) {
  return LEGACY_ROLE_MAP[role] || role || "student";
}

export function isPortalRole(role) {
  const normalized = normalizeRole(role);
  return ROLE_HIERARCHY.find((r) => r.key === normalized)?.isPortal ?? false;
}

export function getRoleName(role) {
  const normalized = normalizeRole(role);
  return ROLE_HIERARCHY.find((r) => r.key === normalized)?.name || "Student";
}

export function getRoleLevel(role) {
  const normalized = normalizeRole(role);
  return ROLE_HIERARCHY.find((r) => r.key === normalized)?.level || 1;
}

// ─── Portal Navigation ───────────────────────────────────────────────────────
export function getPortalNavigation(role) {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "oracle":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
            { label: "Oracle", icon: "Crown", path: "/portal/oracle" },
          ],
        },
        {
          section: "Institutions",
          items: [
            { label: "Universities", icon: "Landmark", path: "/portal/universities" },
            { label: "Faculties", icon: "Building", path: "/portal/faculties" },
            { label: "Departments", icon: "Layers", path: "/portal/departments" },
          ],
        },
        {
          section: "People",
          items: [
            { label: "Students", icon: "Users", path: "/portal/users" },
            { label: "Lecturers", icon: "GraduationCap", path: "/portal/lecturers" },
          ],
        },
        {
          section: "Academic",
          items: [
            { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
          ],
        },
        {
          section: "Platform",
          items: [
            { label: "Marketplace", icon: "ShoppingBag", path: "/portal/marketplace" },
            { label: "Events", icon: "CalendarDays", path: "/portal/events" },
            { label: "Content", icon: "FileEdit", path: "/portal/content" },
            { label: "Bud AI", icon: "Bot", path: "/portal/bud-config" },
          ],
        },
        {
          section: "Operations",
          items: [
            { label: "Support", icon: "LifeBuoy", path: "/portal/support" },
            { label: "Approvals", icon: "ClipboardCheck", path: "/portal/approvals" },
            { label: "Notifications", icon: "Bell", path: "/portal/notifications" },
          ],
        },
        {
          section: "Intelligence",
          items: [
            { label: "Analytics", icon: "LineChart", path: "/portal/analytics" },
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
        {
          section: "System",
          items: [
            { label: "Feature Flags", icon: "Flag", path: "/portal/feature-flags" },
            { label: "Security", icon: "ShieldCheck", path: "/portal/security" },
            { label: "System Health", icon: "Activity", path: "/portal/system-health" },
            { label: "Audit Logs", icon: "ScrollText", path: "/portal/audit-logs" },
            { label: "Module Control", icon: "Boxes", path: "/portal/modules" },
            { label: "Maintenance", icon: "Wrench", path: "/portal/maintenance" },
            { label: "Settings", icon: "Settings", path: "/portal/settings" },
          ],
        },
      ];

    case "executive":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
            { label: "System Health", icon: "Activity", path: "/portal/system-health" },
          ],
        },
        {
          section: "Intelligence",
          items: [
            { label: "Analytics", icon: "LineChart", path: "/portal/analytics" },
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
        {
          section: "Operations",
          items: [
            { label: "Support Center", icon: "LifeBuoy", path: "/portal/support" },
          ],
        },
      ];

    case "operations_staff":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
          ],
        },
        {
          section: "Support",
          items: [
            { label: "Support Tickets", icon: "LifeBuoy", path: "/portal/support" },
            { label: "Content", icon: "FileEdit", path: "/portal/content" },
          ],
        },
        {
          section: "Management",
          items: [
            { label: "University Onboarding", icon: "Landmark", path: "/portal/universities" },
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
      ];

    case "university_admin":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
            { label: "Analytics", icon: "LineChart", path: "/portal/analytics" },
          ],
        },
        {
          section: "University",
          items: [
            { label: "Faculties", icon: "Building", path: "/portal/faculties" },
            { label: "Departments", icon: "Layers", path: "/portal/departments" },
            { label: "Lecturers", icon: "GraduationCap", path: "/portal/lecturers" },
            { label: "Students", icon: "Users", path: "/portal/users" },
            { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
          ],
        },
        {
          section: "Academic",
          items: [
            { label: "Calendar", icon: "CalendarDays", path: "/portal/calendar" },
            { label: "Announcements", icon: "Megaphone", path: "/portal/announcements" },
          ],
        },
        {
          section: "Reports",
          items: [
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
      ];

    case "faculty_admin":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
          ],
        },
        {
          section: "Faculty",
          items: [
            { label: "Departments", icon: "Layers", path: "/portal/departments" },
            { label: "Lecturers", icon: "GraduationCap", path: "/portal/lecturers" },
            { label: "Students", icon: "Users", path: "/portal/users" },
            { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
          ],
        },
        {
          section: "Reports",
          items: [
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
      ];

    case "department_admin":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
          ],
        },
        {
          section: "Department",
          items: [
            { label: "Lecturers", icon: "GraduationCap", path: "/portal/lecturers" },
            { label: "Students", icon: "Users", path: "/portal/users" },
            { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
          ],
        },
        {
          section: "Reports",
          items: [
            { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
          ],
        },
      ];

    case "lecturer":
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
          ],
        },
        {
          section: "Teaching",
          items: [
            { label: "Today's Classes", icon: "CalendarDays", path: "/portal/classes" },
            { label: "UNIBUD Live", icon: "Video", path: "/portal/live" },
            { label: "Assignments", icon: "ClipboardList", path: "/portal/assignments" },
            { label: "Attendance", icon: "CheckSquare", path: "/portal/attendance" },
            { label: "Grades", icon: "GraduationCap", path: "/portal/grades" },
          ],
        },
        {
          section: "Resources",
          items: [
            { label: "Course Materials", icon: "FolderOpen", path: "/portal/materials" },
            { label: "Recorded Lectures", icon: "PlayCircle", path: "/portal/recordings" },
          ],
        },
        {
          section: "Communication",
          items: [
            { label: "Announcements", icon: "Megaphone", path: "/portal/announcements" },
            { label: "Study Groups", icon: "UsersRound", path: "/portal/study-groups" },
          ],
        },
      ];

    default:
      return [
        {
          section: "Overview",
          items: [
            { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
          ],
        },
      ];
  }
}

// ─── Access Control ───────────────────────────────────────────────────────────
const PATH_ACCESS = {
  "/portal/modules": ["oracle"],
  "/portal/users": ["oracle", "university_admin", "faculty_admin", "department_admin"],
  "/portal/security": ["oracle"],
  "/portal/audit-logs": ["oracle", "executive"],
  "/portal/system-health": ["oracle", "executive"],
  "/portal/universities": ["oracle", "operations_staff"],
  "/portal/maintenance": ["oracle"],
  "/portal/settings": ["oracle"],
  "/portal/bud-config": ["oracle"],
  "/portal/analytics": ["oracle", "executive", "university_admin"],
  "/portal/reports": ["oracle", "executive", "university_admin", "faculty_admin", "department_admin", "operations_staff"],
  "/portal/support": ["oracle", "operations_staff", "executive"],
  "/portal/content": ["oracle", "operations_staff"],
  "/portal/faculties": ["university_admin"],
  "/portal/departments": ["university_admin", "faculty_admin"],
  "/portal/lecturers": ["university_admin", "faculty_admin", "department_admin"],
  "/portal/courses": ["university_admin", "faculty_admin", "department_admin"],
  "/portal/calendar": ["university_admin"],
  "/portal/announcements": ["university_admin", "lecturer"],
  "/portal/classes": ["lecturer"],
  "/portal/live": ["lecturer"],
  "/portal/assignments": ["lecturer"],
  "/portal/attendance": ["lecturer"],
  "/portal/grades": ["lecturer"],
  "/portal/materials": ["lecturer"],
  "/portal/recordings": ["lecturer"],
  "/portal/study-groups": ["lecturer"],
  "/portal/oracle": ["oracle"],
  "/portal/approvals": ["oracle"],
  "/portal/feature-flags": ["oracle"],
  "/portal/notifications": ["oracle"],
  "/portal/marketplace": ["oracle"],
  "/portal/events": ["oracle"],
};

export function canAccessPath(role, path) {
  const normalized = normalizeRole(role);
  if (normalized === "oracle") return true;
  const allowed = PATH_ACCESS[path];
  if (!allowed) return true; // Dashboard and unlisted paths are open to all portal users
  return allowed.includes(normalized);
}

// ─── Module Categories ───────────────────────────────────────────────────────
export const MODULE_CATEGORIES = [
  { key: "student_experience", label: "Student Experience", color: "primary" },
  { key: "academic", label: "Academic", color: "info" },
  { key: "social", label: "Social", color: "purple" },
  { key: "opportunities", label: "Opportunities", color: "success" },
  { key: "campus_services", label: "Campus Services", color: "warning" },
  { key: "wellbeing", label: "Wellbeing", color: "error" },
  { key: "portals", label: "Portals", color: "blue" },
  { key: "platform", label: "Platform", color: "n5" },
];