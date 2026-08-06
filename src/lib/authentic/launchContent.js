/**
 * Neutralized — no seed/launch content.
 * Real content comes from real users only. All functions are no-ops.
 */
export const LAUNCH_BATCH = "launch_v1";
export const OFFICIAL_ACCOUNTS = [];
export const LAUNCH_CONTENT = [];

export async function seedLaunchContent() { return { status: "disabled", created: 0 }; }
export async function removeAllSeedContent() { return { status: "disabled", removed: 0 }; }
export async function removeSeedContent() { return { status: "disabled", removed: 0 }; }
export async function getLaunchContent() { return []; }
export async function getLaunchContentStatus() { return { seeded: false, ratio: 0, total: 0, seed: 0 }; }