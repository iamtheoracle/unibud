/**
 * Oracle Permission-Driven Workspace Router
 *
 * After authentication, Oracle silently evaluates the user's role, user_type,
 * and platform access to determine the correct workspace. No extra login,
 * no different URL, no visible admin portal — everything is permission-driven.
 *
 * Student          → Student Workspace
 * Lecturer         → Lecturer Workspace
 * Researcher       → Research Workspace
 * Institution Admin→ Institution Dashboard
 * Platform Moderator → Trust Operations
 * Business Admin   → Business Operations
 * Platform Admin   → Platform Operations
 * Founder          → Founder Workspace
 * Super Admin      → Oracle Command Center
 */

export const WORKSPACE_MAP = {
  // ── Platform operations ──
  super_admin: { path: "/oracle", label: "Oracle Command Center", group: "platform" },
  platform_admin: { path: "/oracle", label: "Platform Operations", group: "platform" },
  oracle: { path: "/oracle", label: "Oracle Command Center", group: "platform" },
  executive: { path: "/oracle", label: "Executive Overview", group: "platform" },
  developer: { path: "/architect", label: "Engineering Workspace", group: "platform" },

  // ── Institution administration ──
  institution_owner: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  university_admin: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  registrar: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  dean: { path: "/lecturer/portal", label: "Faculty Workspace", group: "institution" },
  head_of_department: { path: "/lecturer/portal", label: "Department Workspace", group: "institution" },

  // ── Teaching ──
  lecturer: { path: "/lecturer/portal", label: "Lecturer Workspace", group: "academic" },
  teaching_assistant: { path: "/lecturer/portal", label: "Teaching Workspace", group: "academic" },

  // ── Operations & Trust ──
  moderator: { path: "/operator", label: "Trust Operations", group: "operations" },
  operator: { path: "/operator", label: "Operations Workspace", group: "operations" },
  senior_operator: { path: "/operator", label: "Operations Workspace", group: "operations" },
  operations_staff: { path: "/operator", label: "Operations Workspace", group: "operations" },
  compliance_officer: { path: "/security", label: "Compliance Center", group: "operations" },
  support_manager: { path: "/operator", label: "Support Operations", group: "operations" },

  // ── Finance ──
  finance_manager: { path: "/finance", label: "Business Operations", group: "finance" },

  // ── Academic journey ──
  student: { path: "/home", label: "Student Workspace", group: "academic" },
  postgraduate: { path: "/home", label: "Research Workspace", group: "academic" },
  alumni: { path: "/home", label: "Alumni Workspace", group: "academic" },

  // ── Guardian ──
  guardian: { path: "/parent/portal", label: "Guardian Portal", group: "guardian" },

  // ── Staff & default ──
  staff: { path: "/operator", label: "Staff Workspace", group: "operations" },
  guest: { path: "/home", label: "UNIBUD", group: "default" },
};

/**
 * Resolves the correct workspace for an authenticated user.
 * Evaluates role, user_type, and onboarding state.
 */
export function resolveWorkspace(user) {
  if (!user) return { path: "/login", label: "Sign In", group: "auth" };

  const role = user.role || "student";

  // Future students (pre-university) route to onboarding
  if (user.user_type === "future_student") {
    return { path: "/onboarding/conversation", label: "Welcome", group: "onboarding" };
  }

  // New students who haven't completed onboarding
  if (role === "student" && !user.university && !user.course) {
    return { path: "/onboarding/conversation", label: "Welcome", group: "onboarding" };
  }

  return WORKSPACE_MAP[role] || WORKSPACE_MAP.student;
}

/**
 * Returns true if the role grants access to platform-level operations.
 */
export function isPlatformStaff(role) {
  return ["super_admin", "platform_admin", "oracle", "executive", "developer"].includes(role);
}

/**
 * Returns true if the role is an institution-level administrator.
 */
export function isInstitutionAdmin(role) {
  return ["institution_owner", "university_admin", "registrar", "dean", "head_of_department"].includes(role);
}