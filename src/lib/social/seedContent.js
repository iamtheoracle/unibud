/**
 * Neutralized — no seed content generation.
 * Real content comes from real users and real events only.
 */
export async function seedFeed() { return { status: "disabled" }; }
export async function clearSeedContent() { return { status: "disabled" }; }
export async function getSeedStatus() { return { seeded: false, ratio: 0 }; }
export async function archiveSeedContent() { return { status: "disabled" }; }