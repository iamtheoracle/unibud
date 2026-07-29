/**
 * Oracle Workspace Enforcement
 *
 * Oracle is the invisible operating system. It silently determines which
 * workspaces a user may access based on their role, permissions, and
 * organizational scope. This module maps routes to authorized role groups
 * so that direct navigation to an unauthorized workspace redirects silently.
 *
 * The user sees only the workspace they are authorized to use.
 */

// Reverse index: route prefix → roles authorized to access it.
// Derived from WORKSPACE_MAP in oracleRouter.js.
const ROUTE_ACCESS = {
  // Platform operations — Oracle Command Center
  "/oracle": ["super_admin", "platform_admin", "oracle", "executive"],
  "/architect": ["super_admin", "platform_admin", "oracle", "developer"],

  // Institution administration
  "/institution/console": ["institution_owner", "university_admin", "registrar", "super_admin", "platform_admin"],
  "/institution/onboard": ["institution_owner", "university_admin", "super_admin", "platform_admin"],

  // Teaching workspace
  "/lecturer/portal": ["lecturer", "teaching_assistant", "dean", "head_of_department", "super_admin", "platform_admin"],

  // Operations & Trust
  "/operator": ["moderator", "operator", "senior_operator", "operations_staff", "support_manager", "staff", "super_admin", "platform_admin"],
  "/security": ["compliance_officer", "moderator", "super_admin", "platform_admin"],

  // Finance
  "/finance": ["finance_manager", "super_admin", "platform_admin"],

  // Management
  "/management": ["institution_owner", "university_admin", "registrar", "super_admin", "platform_admin"],
};

/**
 * Returns true if the user's role is authorized for the given path.
 * Platform staff (super_admin, platform_admin) can access all workspaces.
 */
export function isAuthorizedFor(path, role) {
  // Find the matching route prefix (longest match wins)
  const matchedPrefix = Object.keys(ROUTE_ACCESS)
    .filter((prefix) => path === prefix || path.startsWith(prefix + "/") || path.startsWith(prefix))
    .sort((a, b) => b.length - a)[0];

  if (!matchedPrefix) return true; // Unrestricted route

  const allowedRoles = ROUTE_ACCESS[matchedPrefix];
  if (!allowedRoles) return true;

  // Platform staff have universal access
  if (["super_admin", "platform_admin", "oracle"].includes(role)) return true;

  return allowedRoles.includes(role);
}