/**
 * UNIBUD Platform Operations Portal — Configuration
 * Central registry for modules, roles, and portal navigation.
 */

// ─── Platform Modules ───────────────────────────────────────────────────────
export const PLATFORM_MODULES = [
  // ── Phase 1 (visible) — Student Experience ──
  { key: "campus", display_name: "Home", category: "student_experience", icon: "Home", description: "Student home dashboard with morning briefing, schedule, and campus life.", enabled: true, sort_order: 1 },
  { key: "bud", display_name: "Bud", category: "student_experience", icon: "Sparkles", description: "Trusted university companion for study help and guidance.", enabled: true, sort_order: 2 },
  { key: "search", display_name: "Search", category: "student_experience", icon: "Search", description: "Universal search across modules, resources, and people.", enabled: true, sort_order: 3 },
  { key: "profile", display_name: "Profile", category: "student_experience", icon: "User", description: "Student profile with academic progress and achievements.", enabled: true, sort_order: 4 },
  { key: "settings", display_name: "Settings", category: "student_experience", icon: "Settings", description: "Student account and app preferences.", enabled: true, sort_order: 5 },

  // ── Phase 1 (visible) — Academic ──
  { key: "assignments", display_name: "Assignments", category: "academic", icon: "ClipboardList", description: "Assignment tracking with deadlines, submission, and grading.", enabled: true, sort_order: 10 },
  { key: "examinations", display_name: "Examinations", category: "academic", icon: "FileText", description: "Exam schedules, revision tracking, and results.", enabled: true, sort_order: 11 },
  { key: "timetable", display_name: "Calendar", category: "academic", icon: "CalendarDays", description: "Weekly class timetable and schedule management.", enabled: true, sort_order: 12 },

  // ── Phase 2 (hidden behind feature flags) — Social ──
  { key: "quad", display_name: "Quad", category: "student_experience", icon: "Compass", description: "Campus social feed with posts, discussions, polls, and communities.", enabled: false, sort_order: 6 },
  { key: "connect", display_name: "Connect", category: "student_experience", icon: "Users", description: "Study matching, mentorship, events, and career networking.", enabled: false, sort_order: 7 },
  { key: "library", display_name: "Library", category: "student_experience", icon: "Library", description: "Digital library with books, journals, past questions, and notes.", enabled: false, sort_order: 8 },
  { key: "notifications", display_name: "Notifications", category: "student_experience", icon: "Bell", description: "Centralised notification center for all platform alerts.", enabled: false, sort_order: 9 },
  { key: "live", display_name: "UNIBUD Live", category: "academic", icon: "Video", description: "Virtual classroom with live lectures, recordings, and study groups.", enabled: false, sort_order: 13 },
  { key: "research", display_name: "Research", category: "academic", icon: "FlaskConical", description: "Research projects, publications, and collaboration tools.", enabled: false, sort_order: 14 },
  { key: "study_groups", display_name: "Study Groups", category: "social", icon: "UsersRound", description: "Course, department, revision, and project study groups with voice and video rooms.", enabled: false, sort_order: 15 },
  { key: "communities", display_name: "Communities", category: "social", icon: "Heart", description: "Student communities, clubs, and interest-based groups.", enabled: false, sort_order: 16 },
  { key: "events", display_name: "Events", category: "social", icon: "CalendarHeart", description: "Campus events, workshops, and activity calendar.", enabled: false, sort_order: 17 },

  // ── Phase 2 (hidden) — Opportunities ──
  { key: "scholarships", display_name: "Scholarships", category: "opportunities", icon: "Award", description: "Scholarship discovery, tracking, and applications.", enabled: false, sort_order: 18 },
  { key: "internships", display_name: "Internships", category: "opportunities", icon: "Briefcase", description: "Internship opportunities and application tracking.", enabled: false, sort_order: 19 },
  { key: "marketplace", display_name: "Marketplace", category: "student_experience", icon: "ShoppingBag", description: "Free campus marketplace — buy, sell & share with students directly. No fees.", enabled: true, sort_order: 9 },
  { key: "career_hub", display_name: "Career Hub", category: "opportunities", icon: "TrendingUp", description: "Career guidance, job postings, and professional development.", enabled: false, sort_order: 21 },

  // ── Phase 2 (hidden) — Campus Services ──
  { key: "campus_navigation", display_name: "Campus Navigation", category: "campus_services", icon: "MapPin", description: "Interactive campus maps and navigation.", enabled: false, sort_order: 22 },
  { key: "accommodation", display_name: "Accommodation", category: "campus_services", icon: "Building2", description: "Student housing listings and accommodation services.", enabled: false, sort_order: 23 },
  { key: "transport", display_name: "Transport", category: "campus_services", icon: "Bus", description: "Campus transport schedules and shuttle tracking.", enabled: false, sort_order: 24 },
  { key: "dining", display_name: "Dining", category: "campus_services", icon: "UtensilsCrossed", description: "Campus dining halls, menus, and meal plans.", enabled: false, sort_order: 25 },

  // ── Phase 2 (hidden) — Wellbeing ──
  { key: "student_support", display_name: "Student Support", category: "wellbeing", icon: "HeartHandshake", description: "Dedicated wellbeing space for stress, anxiety, and student life support.", enabled: false, sort_order: 26 },

  // ── Phase 2 (hidden) — Portals ──
  { key: "lecturer_portal", display_name: "Lecturer Portal", category: "portals", icon: "GraduationCap", description: "Lecturer dashboard for classes, assignments, attendance, and analytics.", enabled: false, sort_order: 27 },
  { key: "department_portal", display_name: "Department Portal", category: "portals", icon: "Layers", description: "Department administrator dashboard for courses, lecturers, and students.", enabled: false, sort_order: 28 },
  { key: "faculty_portal", display_name: "Faculty Portal", category: "portals", icon: "Building", description: "Faculty administrator dashboard for departments, programs, and reports.", enabled: false, sort_order: 29 },
  { key: "university_portal", display_name: "University Portal", category: "portals", icon: "Landmark", description: "University administrator dashboard for faculties, students, and settings.", enabled: false, sort_order: 30 },

  // ── Phase 2 (hidden) — Platform ──
  { key: "reports", display_name: "Reports", category: "platform", icon: "BarChart3", description: "Platform-wide reports and data exports.", enabled: false, sort_order: 31 },
  { key: "analytics", display_name: "Analytics", category: "platform", icon: "LineChart", description: "Platform analytics, growth metrics, and business intelligence.", enabled: false, sort_order: 32 },
  { key: "bud_management", display_name: "Bud Management", category: "platform", icon: "Bot", description: "Bud configuration, knowledge base, and behavior tuning.", enabled: false, sort_order: 33 },
  { key: "media", display_name: "Media", category: "platform", icon: "Image", description: "Media library and asset management.", enabled: false, sort_order: 34 },
  { key: "content", display_name: "Content", category: "platform", icon: "FileEdit", description: "Content management for announcements, articles, and resources.", enabled: false, sort_order: 35 },
  { key: "support", display_name: "Support", category: "platform", icon: "LifeBuoy", description: "Support ticket management and customer success.", enabled: false, sort_order: 36 },
  { key: "administration", display_name: "Administration", category: "platform", icon: "Shield", description: "Platform administration, security, and system configuration.", enabled: false, sort_order: 37 },
];

// ─── Role Hierarchy ──────────────────────────────────────────────────────────
export const ROLE_HIERARCHY = [
  { key: "student", name: "Student", level: 1, description: "Access to the student application only.", isPortal: false },
  { key: "lecturer", name: "Lecturer", level: 2, description: "Manage classes, assignments, attendance, and assessments.", isPortal: true },
  { key: "department_admin", name: "Department Administrator", level: 3, description: "Manage department courses, lecturers, and students.", isPortal: true },
  { key: "faculty_admin", name: "Faculty Administrator", level: 4, description: "Manage faculty departments, programs, and reports.", isPortal: true },
  { key: "university_admin", name: "University Administrator", level: 5, description: "Manage university faculties, students, and settings.", isPortal: true },
  { key: "operations_staff", name: "Operations Staff", level: 6, description: "Support, moderation, content, and university onboarding.", isPortal: true },
  { key: "operator", name: "Operator", level: 6, description: "Platform operations support.", isPortal: true },
  { key: "senior_operator", name: "Senior Operator", level: 7, description: "Senior platform operations with expanded access.", isPortal: true },
  { key: "moderator", name: "Moderator", level: 6, description: "Content moderation and user management.", isPortal: true },
  { key: "finance_manager", name: "Finance Manager", level: 7, description: "Financial oversight and marketplace revenue.", isPortal: true },
  { key: "support_manager", name: "Support Manager", level: 7, description: "Support team management and ticket escalation.", isPortal: true },
  { key: "compliance_officer", name: "Compliance Officer", level: 8, description: "Platform compliance and audit oversight.", isPortal: true },
  { key: "developer", name: "Developer", level: 8, description: "System configuration and feature management.", isPortal: true },
  { key: "platform_admin", name: "Platform Admin", level: 9, description: "Platform administration with broad access.", isPortal: true },
  { key: "super_admin", name: "Super Admin", level: 10, description: "Highest platform authority below Oracle. Can manage all platform staff.", isPortal: true },
  { key: "executive", name: "Executive / Co-Founder", level: 7, description: "Strategic dashboards, growth, and business intelligence.", isPortal: true },
  { key: "oracle", name: "Oracle", level: 99, description: "Supreme platform authority. Full control over all modules and settings. Protected root account.", isPortal: true },
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

const PLATFORM_ROLES = [
  "operator", "senior_operator", "moderator", "finance_manager",
  "support_manager", "compliance_officer", "developer",
  "platform_admin", "super_admin", "operations_staff", "executive",
];

const UNIVERSITY_ROLES = ["lecturer", "department_admin", "faculty_admin", "university_admin"];

export function isPlatformRole(role) {
  const normalized = normalizeRole(role);
  return PLATFORM_ROLES.includes(normalized);
}

export function isUniversityRole(role) {
  const normalized = normalizeRole(role);
  return UNIVERSITY_ROLES.includes(normalized);
}

export function isOracleRole(role) {
  const normalized = normalizeRole(role);
  return normalized === "oracle";
}

const OPERATOR_ROLES = ["operator", "senior_operator"];

export function isOperatorRole(role) {
  const normalized = normalizeRole(role);
  return OPERATOR_ROLES.includes(normalized);
}

export function isProtectedRole(role) {
  return isOracleRole(role);
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
            { label: "Oracle Mission Control", icon: "Crown", path: "/portal/oracle" },
            { label: "Intelligence Core", icon: "Brain", path: "/portal/oracle-intelligence" },
            { label: "Agent Network", icon: "Network", path: "/portal/agent-network" },
          ],
        },
        {
          section: "Institutions",
          items: [
            { label: "Universities", icon: "Landmark", path: "/portal/universities" },
            { label: "Institution Config", icon: "Building2", path: "/portal/institution-config" },
            { label: "Outreach", icon: "Mail", path: "/portal/institution-outreach" },
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
          section: "Operations Centers",
          items: [
            { label: "Architect Center", icon: "Layers", path: "/portal/architect" },
            { label: "Management Center", icon: "ClipboardCheck", path: "/portal/management" },
            { label: "Operator Center", icon: "Settings", path: "/portal/operator" },
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
          section: "Institution",
          items: [
            { label: "Configuration Center", icon: "Building2", path: "/portal/institution-config" },
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
            { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
            { label: "Today's Classes", icon: "CalendarDays", path: "/portal/classes" },
            { label: "UNIBUD Live", icon: "Video", path: "/portal/live" },
            { label: "Assignments", icon: "ClipboardList", path: "/portal/assignments" },
            { label: "Quiz & Exam Center", icon: "FileText", path: "/portal/quiz-center" },
            { label: "Attendance", icon: "CheckSquare", path: "/portal/attendance" },
            { label: "Grades", icon: "GraduationCap", path: "/portal/grades" },
          ],
        },
        {
          section: "Insights",
          items: [
            { label: "Academic Analytics", icon: "LineChart", path: "/portal/academic-analytics" },
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

    case "operator":
    case "senior_operator":
    case "moderator":
    case "finance_manager":
    case "support_manager":
    case "compliance_officer":
    case "developer":
    case "platform_admin":
    case "super_admin":
    case "operations_staff":
    case "executive":
      return getPlatformNavigation(normalized);

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

function getPlatformNavigation(role) {
  const isSuperAdmin = role === "super_admin";
  const isPlatformAdmin = role === "platform_admin" || isSuperAdmin || role === "executive";
  const isDeveloper = role === "developer" || isPlatformAdmin;
  const isCompliance = role === "compliance_officer" || isPlatformAdmin;
  const isFinance = role === "finance_manager" || isPlatformAdmin;
  const isSupport = role === "support_manager" || role === "moderator" || role === "operator" || role === "senior_operator" || isPlatformAdmin;
  const isOpsStaff = role === "operations_staff" || isPlatformAdmin;

  const sections = [
    {
      section: "Overview",
      items: [
        { label: "Dashboard", icon: "LayoutDashboard", path: "/portal" },
      ],
    },
  ];

  if (isPlatformAdmin || isSupport) {
    sections.push({
      section: "Institutions",
      items: [
        { label: "Universities", icon: "Landmark", path: "/portal/universities" },
        { label: "Institution Config", icon: "Building2", path: "/portal/institution-config" },
        { label: "Outreach", icon: "Mail", path: "/portal/institution-outreach" },
        { label: "Faculties", icon: "Building", path: "/portal/faculties" },
        { label: "Departments", icon: "Layers", path: "/portal/departments" },
        { label: "Students", icon: "Users", path: "/portal/users" },
        { label: "Lecturers", icon: "GraduationCap", path: "/portal/lecturers" },
        { label: "Courses", icon: "BookOpen", path: "/portal/courses" },
      ],
    });
  }

  sections.push({
    section: "Platform",
    items: [
      { label: "Marketplace", icon: "ShoppingBag", path: "/portal/marketplace" },
      { label: "Events", icon: "CalendarDays", path: "/portal/events" },
      { label: "Content", icon: "FileEdit", path: "/portal/content" },
      { label: "Bud AI", icon: "Bot", path: "/portal/bud-config" },
    ],
  });

  sections.push({
    section: "Operations",
    items: [
      { label: "Support", icon: "LifeBuoy", path: "/portal/support" },
      { label: "Approvals", icon: "ClipboardCheck", path: "/portal/approvals" },
      { label: "Notifications", icon: "Bell", path: "/portal/notifications" },
    ],
  });

  // Operations Centers — available to all portal roles with access
  if (isPlatformAdmin || isDeveloper || isSupport || isOpsStaff || isCompliance || isFinance) {
    sections.push({
      section: "Operations Centers",
      items: [
        { label: "Architect Center", icon: "Layers", path: "/portal/architect" },
        { label: "Management Center", icon: "ClipboardCheck", path: "/portal/management" },
        { label: "Operator Center", icon: "Settings", path: "/portal/operator" },
        { label: "Agent Network", icon: "Network", path: "/portal/agent-network" },
      ],
    });
  }

  if (isFinance || isPlatformAdmin) {
    sections.push({
      section: "Intelligence",
      items: [
        { label: "Analytics", icon: "LineChart", path: "/portal/analytics" },
        { label: "Reports", icon: "BarChart3", path: "/portal/reports" },
      ],
    });
  }

  if (isDeveloper || isCompliance || isSuperAdmin) {
    sections.push({
      section: "System",
      items: [
        { label: "Feature Flags", icon: "Flag", path: "/portal/feature-flags" },
        { label: "Security", icon: "ShieldCheck", path: "/portal/security" },
        { label: "System Health", icon: "Activity", path: "/portal/system-health" },
        { label: "Audit Logs", icon: "ScrollText", path: "/portal/audit-logs" },
        { label: "Module Control", icon: "Boxes", path: "/portal/modules" },
        { label: "Maintenance", icon: "Wrench", path: "/portal/maintenance" },
      ],
    });
  }

  if (isSuperAdmin || isPlatformAdmin) {
    sections[sections.length - 1]?.items.push({ label: "Invitations", icon: "UserPlus", path: "/portal/invitations" });
    sections[sections.length - 1]?.items.push({ label: "Settings", icon: "Settings", path: "/portal/settings" });
  }

  return sections;
}

// ─── Access Control ───────────────────────────────────────────────────────────
const PATH_ACCESS = {
  "/portal/modules": ["oracle"],
  "/portal/users": ["oracle", "university_admin", "faculty_admin", "department_admin"],
  "/portal/security": ["oracle"],
  "/portal/audit-logs": ["oracle", "executive"],
  "/portal/system-health": ["oracle", "executive"],
  "/portal/universities": ["oracle", "operations_staff"],
  "/portal/institution-config": ["oracle", "university_admin", "operations_staff"],
  "/portal/institution-outreach": ["oracle", "operations_staff"],
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
  "/portal/courses": ["university_admin", "faculty_admin", "department_admin", "lecturer"],
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
  "/portal/quiz-center": ["lecturer", "university_admin"],
  "/portal/academic-analytics": ["lecturer", "university_admin", "faculty_admin"],
  "/portal/oracle": ["oracle"],
  "/portal/oracle-intelligence": ["oracle"],
  "/portal/agent-network": ["oracle", "super_admin", "platform_admin", "developer", "executive"],
  "/portal/architect": ["oracle", "super_admin", "developer", "executive"],
  "/portal/management": ["oracle", "super_admin", "platform_admin", "support_manager", "finance_manager", "compliance_officer"],
  "/portal/operator": ["oracle", "super_admin", "platform_admin", "operator", "senior_operator", "moderator", "operations_staff"],
  "/portal/approvals": ["oracle", "super_admin", "platform_admin", "support_manager"],
  "/portal/feature-flags": ["oracle", "super_admin", "platform_admin", "developer"],
  "/portal/notifications": ["oracle", "super_admin", "platform_admin", "support_manager"],
  "/portal/marketplace": ["oracle", "super_admin", "platform_admin", "finance_manager"],
  "/portal/marketplace/analytics": ["oracle", "super_admin", "platform_admin", "finance_manager"],
  "/portal/events": ["oracle", "super_admin", "platform_admin", "support_manager"],
  "/portal/invitations": ["oracle", "super_admin"],
};

export function canAccessPath(role, path) {
  const normalized = normalizeRole(role);
  if (normalized === "oracle" || normalized === "super_admin") return true;
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