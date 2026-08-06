/**
 * Display-name resolution for UNIBUD.
 *
 * Priority order (per IA milestone):
 *   1. User profile / preferred name
 *   2. Google / provider full name
 *   3. Never a Gmail username (email local part)
 *
 * Falls back to "" so callers can substitute a warm default ("there").
 */
export function resolveDisplayName(user) {
  if (!user) return "";
  const email = user.email || "";
  const localPart = email ? email.split("@")[0] : "";

  const candidates = [user.preferred_name, user.full_name, user.data?.preferred_name, user.data?.full_name];
  for (const c of candidates) {
    if (!c) continue;
    const t = String(c).trim();
    if (!t) continue;
    // Never surface a Gmail/email username as a display name.
    if (t === email || t === localPart) continue;
    return t;
  }
  return "";
}

export function resolveFirstName(user) {
  const full = resolveDisplayName(user);
  if (!full) return "there";
  return full.split(" ")[0];
}