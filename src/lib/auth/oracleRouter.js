/**
 * Oracle — The Invisible Operating System
 *
 * Oracle never has its own login page. Oracle never has its own public
 * dashboard. Oracle silently determines: identity, permissions, workspace,
 * navigation, features, agent access, security, APIs, and platform operations.
 *
 * Every authenticated session is evaluated by Oracle before any interface
 * is rendered. The user sees only the workspace they are authorized to use.
 * Platform administrators never manually select a portal — Oracle
 * automatically assembles the correct workspace based on roles, permissions,
 * organizational scope, and security policies.
 *
 * Management Centers (agent-first, Bud-powered):
 *   1. Founder Workspace       → /oracle      (super_admin, oracle, executive)
 *   2. Platform Operations      → /oracle      (platform_admin, developer)
 *   3. Trust & Operations       → /operator    (moderator, compliance, operators)
 *   4. Experience & Business    → /finance     (finance_manager, business admin)
 */

export const WORKSPACE_MAP = {
  // ── Founder Workspace — strategic leadership ──
  super_admin: { path: "/oracle", label: "Founder Workspace", group: "platform", center: "founder" },
  oracle: { path: "/oracle", label: "Oracle Command Center", group: "platform", center: "founder" },
  executive: { path: "/oracle", label: "Executive Overview", group: "platform", center: "founder" },

  // ── Platform Operations — operate the platform ──
  platform_admin: { path: "/oracle", label: "Platform Operations", group: "platform", center: "platform-ops" },
  developer: { path: "/architect", label: "Engineering Workspace", group: "platform", center: "platform-ops" },

  // ── Trust & Operations — protect the platform ──
  moderator: { path: "/operator", label: "Trust & Operations", group: "operations", center: "trust-ops" },
  operator: { path: "/operator", label: "Operations Workspace", group: "operations", center: "trust-ops" },
  senior_operator: { path: "/operator", label: "Operations Workspace", group: "operations", center: "trust-ops" },
  operations_staff: { path: "/operator", label: "Operations Workspace", group: "operations", center: "trust-ops" },
  compliance_officer: { path: "/security", label: "Compliance Center", group: "operations", center: "trust-ops" },
  support_manager: { path: "/operator", label: "Support Operations", group: "operations", center: "trust-ops" },

  // ── Experience & Business — operate every product ──
  finance_manager: { path: "/finance", label: "Experience & Business", group: "finance", center: "experience-business" },

  // ── Institution administration ──
  institution_owner: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  university_admin: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  registrar: { path: "/institution/console", label: "Institution Dashboard", group: "institution" },
  dean: { path: "/lecturer/portal", label: "Faculty Workspace", group: "institution" },
  head_of_department: { path: "/lecturer/portal", label: "Department Workspace", group: "institution" },

  // ── Teaching ──
  lecturer: { path: "/lecturer/portal", label: "Lecturer Workspace", group: "academic" },
  teaching_assistant: { path: "/lecturer/portal", label: "Teaching Workspace", group: "academic" },

  // ── Academic journey ──
  student: { path: "/home", label: "Student Workspace", group: "academic" },
  postgraduate: { path: "/home", label: "Research Workspace", group: "academic" },
  alumni: { path: "/home", label: "Alumni Workspace", group: "academic" },

  // ── Guardian ──
  guardian: { path: "/parent/portal", label: "Guardian Portal", group: "guardian" },

  // ── Staff & default ──
  staff: { path: "/operator", label: "Staff Workspace", group: "operations", center: "trust-ops" },
  guest: { path: "/home", label: "UNIBUD", group: "default" },
};

/**
 * Resolves the correct workspace for an authenticated user.
 *
 * Oracle silently evaluates identity, permissions, organizational scope,
 * and security policies before any interface is rendered. The user sees
 * only the workspace they are authorized to use.
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
 * Returns the management center for a given role, or null if the role
 * is not a platform administration role.
 */
export function getManagementCenter(role) {
  const ws = WORKSPACE_MAP[role];
  return ws?.center || null;
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