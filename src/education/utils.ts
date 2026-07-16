/**
 * Education Module — Shared Utilities
 */

let _counter = 0;

/** Generates a deterministic-ish unique ID. Replace with uuid in production. */
export function generateId(): string {
  _counter += 1;
  return `edu_${Date.now()}_${_counter}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Generates a URL-safe random token for invitations. */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
