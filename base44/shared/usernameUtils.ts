/**
 * usernameUtils — shared username generation, validation, and uniqueness logic.
 * Used by usernameService and welcomeNewStudent functions.
 */

export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const RESERVED_USERNAMES = [
  "admin", "administrator", "root", "superuser", "system", "api",
  "bud", "unibud", "orbit", "spark", "oracle", "nexus", "guardian",
  "support", "help", "official", "verified", "moderator", "staff",
  "security", "info", "contact", "team", "welcome", "hello",
  "null", "undefined", "test", "demo", "example", "sample",
  "me", "self", "profile", "settings", "account", "dashboard",
  "posts", "feed", "messages", "notifications", "search",
  "university", "institution", "college", "school", "faculty",
  "department", "student", "lecturer", "professor", "dean",
  "chancellor", "vice_chancellor", "registrar", "bursar",
  "nigeria", "africa", "edu", "education", "campus",
];

/**
 * Sanitizes a string into a valid username base (lowercase, [a-z0-9_]).
 */
export function sanitize(str: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Generates candidate usernames from a full name and/or email.
 * Returns an ordered list of suggestions (most natural first).
 */
export function generateCandidates(fullName?: string, email?: string): string[] {
  const candidates: string[] = [];
  const year = new Date().getFullYear().toString();

  // Extract name parts from full_name
  if (fullName) {
    const parts = sanitize(fullName).split(/[\s_]+/).filter(Boolean);
    if (parts.length >= 2) {
      const [first, ...rest] = parts;
      const last = rest[rest.length - 1];
      candidates.push(first + last);
      candidates.push(first + "." + last);
      candidates.push(first + "_" + last);
      candidates.push(first);
      candidates.push(last + first);
      candidates.push(first + year.slice(-2));
      candidates.push(first + "_" + year.slice(-2));
    } else if (parts.length === 1) {
      const name = parts[0];
      candidates.push(name);
      candidates.push(name + year.slice(-2));
      candidates.push(name + "_" + year.slice(-2));
    }
  }

  // Fallback: extract from email
  if (email && candidates.length === 0) {
    const emailName = sanitize(email.split("@")[0]);
    if (emailName) {
      candidates.push(emailName);
      candidates.push(emailName + year.slice(-2));
    }
  }

  // Last resort
  if (candidates.length === 0) {
    candidates.push("student" + Math.floor(Math.random() * 10000));
  }

  // Deduplicate and filter valid
  const seen = new Set<string>();
  return candidates.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return USERNAME_RE.test(c) && !isReserved(c);
  });
}

/**
 * Checks if a username is in the reserved list.
 */
export function isReserved(username: string): boolean {
  const u = (username || "").toLowerCase().trim();
  return RESERVED_USERNAMES.includes(u);
}

/**
 * Given a base username and a list of existing usernames, returns a unique
 * username by appending a numeric suffix if needed.
 */
export function ensureUnique(baseUsername: string, existing: string[]): string {
  const taken = new Set(existing.map((u) => u.toLowerCase()));
  if (!taken.has(baseUsername) && USERNAME_RE.test(baseUsername) && !isReserved(baseUsername)) {
    return baseUsername;
  }
  for (let i = 1; i <= 999; i++) {
    const candidate = baseUsername + i;
    if (!taken.has(candidate) && USERNAME_RE.test(candidate) && !isReserved(candidate)) {
      return candidate;
    }
  }
  // Extreme fallback
  return baseUsername + Math.floor(Math.random() * 10000);
}

/**
 * Validates a username for format and reserved name compliance.
 * Returns { ok: boolean, reason?: string }.
 */
export function validateUsername(username: string): { ok: boolean; reason?: string } {
  const u = (username || "").toLowerCase().trim();
  if (!USERNAME_RE.test(u)) {
    return { ok: false, reason: "Username must be 3–20 characters: lowercase letters, numbers, or underscores." };
  }
  if (isReserved(u)) {
    return { ok: false, reason: "This username is reserved. Please choose another." };
  }
  return { ok: true };
}