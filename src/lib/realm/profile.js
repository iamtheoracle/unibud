/**
 * User Profile Service — one reusable profile shared across all My Realm apps.
 * Stores profile, university, department, faculty, level, courses, interests,
 * accessibility, preferences, and connected apps (all on the user record).
 */
export function profileService(base44) {
  const FIELDS = [
    "university", "department", "faculty", "level", "courses", "interests",
    "accessibility", "preferences", "connectedApps", "preferred_name",
    "avatar_url", "institution_id",
  ];

  return {
    get: async () => base44.auth.me(),
    update: (data) => base44.auth.updateMe(data),
    /** Normalise a raw user record into a Realm profile shape. */
    normalize: (user) => {
      if (!user) return null;
      const d = user.data || {};
      const out = { id: user.id, email: user.email, full_name: user.full_name, role: user.role };
      FIELDS.forEach((f) => { if (d[f] !== undefined) out[f] = d[f]; });
      return out;
    },
  };
}