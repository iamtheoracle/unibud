/**
 * Authorization Service — role-based access + permission helpers.
 * Reuses the admin role registry (src/lib/admin/roles.js) and the
 * institution role model. Pure functions; no new permission logic.
 */
import { ADMIN_ROLES, ADMIN_SURFACES, getAdminRole, accessibleSurfaces } from "@/lib/admin/roles";

export function authzService(base44) {
  return {
    /** Resolve the effective admin role for a user object. */
    getRole: (user) => getAdminRole(user),

    /** True if the user holds the given admin role. */
    hasRole: (user, role) => getAdminRole(user) === role,

    /** True if the user may access an admin surface key (e.g. "oracle"). */
    canAccess: (user, surfaceKey) => {
      const role = getAdminRole(user);
      if (!role) return false;
      const surf = ADMIN_SURFACES[surfaceKey];
      return !!surf && surf.roles.includes(role);
    },

    /** List of admin surfaces the user is authorized to open. */
    accessibleSurfaces: (user) => accessibleSurfaces(getAdminRole(user)),

    /** Ownership helper for record-level permission checks. */
    owns: (record, userId) =>
      !!record && (record.created_by_id === userId || record.user_id === userId),

    /** Raw registries for callers that need to introspect roles/surfaces. */
    roles: ADMIN_ROLES,
    surfaces: ADMIN_SURFACES,
  };
}