/**
 * Feature Flags Service — platform module on/off state.
 * Reuses the PlatformModule entity and the PLATFORM_MODULES fallback
 * (src/lib/portalConfig). For React components that need synchronous
 * state, prefer the useFeatureFlags() hook; this service is the
 * non-React / service-layer interface with a short TTL cache.
 */
import { PLATFORM_MODULES } from "@/lib/portalConfig";

let cache = null;
let cacheAt = 0;
const TTL = 60000;

async function load(base44) {
  if (cache && Date.now() - cacheAt < TTL) return cache;
  try {
    cache = await base44.entities.PlatformModule.list();
    cacheAt = Date.now();
  } catch {
    cache = cache || PLATFORM_MODULES;
  }
  return cache || PLATFORM_MODULES;
}

export function featureFlagsService(base44) {
  return {
    /** Resolve whether a module key is enabled (defaults to true when absent). */
    isEnabled: async (key) => {
      const mods = await load(base44);
      const m = mods.find((x) => x.key === key);
      return !m || m.enabled !== false;
    },

    /** Fetch a single module record by key. */
    getModule: async (key) => {
      const mods = await load(base44);
      return mods.find((x) => x.key === key) || null;
    },

    /** All module records. */
    list: async () => load(base44),

    /** Force a re-fetch on next call. */
    refresh: () => { cache = null; },
  };
}