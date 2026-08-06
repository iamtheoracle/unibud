import { AUTOMATIONS } from "./automations";

const STORAGE_KEY = "bud_autonomous_prefs";

/**
 * Load automation preferences from localStorage.
 * Defaults to each automation's defaultEnabled value.
 */
export function loadPreferences() {
  const defaults = {};
  for (const auto of AUTOMATIONS) {
    defaults[auto.id] = auto.defaultEnabled;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

/**
 * Save automation preferences to localStorage.
 */
export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

/**
 * Check if a specific automation is enabled.
 * Defaults to the automation's defaultEnabled if not set.
 */
export function isAutomationEnabled(prefs, automationId) {
  const auto = AUTOMATIONS.find((a) => a.id === automationId);
  if (!auto) return false;
  if (prefs[automationId] !== undefined) return prefs[automationId];
  return auto.defaultEnabled;
}

/**
 * Toggle a single automation's enabled state.
 */
export function toggleAutomation(automationId) {
  const prefs = loadPreferences();
  prefs[automationId] = !isAutomationEnabled(prefs, automationId);
  savePreferences(prefs);
  return prefs;
}

/**
 * Get the count of enabled automations.
 */
export function getEnabledCount() {
  const prefs = loadPreferences();
  return AUTOMATIONS.filter((a) => isAutomationEnabled(prefs, a.id)).length;
}