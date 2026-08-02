import { loadPreferences, isAutomationEnabled } from "@/lib/autonomous/preferences";
import {
  generateSocialActivity,
  generateAcademicActivity,
  generateMarketplaceActivity,
  generateEventActivity,
  generateClubActivity,
} from "./activityGenerator";
import { simulateEngagement, simulateTrending } from "./engagement";

/**
 * Living Campus Engine — Main Coordinator
 *
 * Continuously simulates realistic university activity across the platform.
 * Runs on a periodic cycle, generating time-appropriate content and
 * organic engagement.
 *
 * Activity types vary by time of day:
 *  - Morning: academic posts, announcements, class reminders
 *  - Afternoon: social posts, study sessions, marketplace
 *  - Evening: social posts, events, club activity
 *  - Night: minimal social activity
 *  - Weekend: events, social, marketplace (less academic)
 */

const MIN_CYCLE_INTERVAL = 2 * 60 * 1000; // 2 minutes
let lastCycleTime = 0;

/**
 * Determines the current time period for activity generation.
 */
export function getTimePeriod() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday

  if (day === 0 || day === 6) return "weekend";
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

/**
 * Main entry point — runs one living campus cycle.
 * Called periodically by the useLivingCampus hook.
 */
export async function runLivingCampusCycle() {
  // Throttle — don't run more than once per MIN_CYCLE_INTERVAL
  const now = Date.now();
  if (now - lastCycleTime < MIN_CYCLE_INTERVAL) return;
  lastCycleTime = now;

  const prefs = loadPreferences();
  if (!isAutomationEnabled(prefs, "living_campus")) return;

  const timePeriod = getTimePeriod();
  const tasks = [];

  // ── Generate new activity based on time period ──

  // Social activity (all periods, reduced at night)
  if (isAutomationEnabled(prefs, "living_social")) {
    const socialChance = timePeriod === "night" ? 0.5 : 0.9;
    if (Math.random() < socialChance) {
      tasks.push(generateSocialActivity(timePeriod));
    }
  }

  // Academic activity (morning + afternoon, not at night/weekend)
  if (isAutomationEnabled(prefs, "living_academic")) {
    const academicChance =
      timePeriod === "morning" ? 0.6 :
      timePeriod === "afternoon" ? 0.4 :
      timePeriod === "evening" ? 0.2 :
      0; // night
    if (Math.random() < academicChance) {
      tasks.push(generateAcademicActivity());
    }
  }

  // Marketplace activity (afternoon + weekend, lower chance)
  if (isAutomationEnabled(prefs, "living_marketplace")) {
    const marketChance =
      timePeriod === "weekend" ? 0.3 :
      timePeriod === "afternoon" ? 0.25 :
      0.1;
    if (Math.random() < marketChance) {
      tasks.push(generateMarketplaceActivity());
    }
  }

  // Event activity (any time, lower chance)
  if (isAutomationEnabled(prefs, "living_events")) {
    const eventChance =
      timePeriod === "weekend" ? 0.3 :
      timePeriod === "evening" ? 0.2 :
      0.1;
    if (Math.random() < eventChance) {
      tasks.push(generateEventActivity());
    }
  }

  // Club activity (evening + weekend)
  if (isAutomationEnabled(prefs, "living_social")) {
    const clubChance =
      timePeriod === "evening" ? 0.3 :
      timePeriod === "weekend" ? 0.25 :
      0.1;
    if (Math.random() < clubChance) {
      tasks.push(generateClubActivity());
    }
  }

  // ── Engagement simulation ──

  if (isAutomationEnabled(prefs, "living_engagement")) {
    tasks.push(simulateEngagement());
    // Trending boost every few cycles
    if (Math.random() < 0.15) {
      tasks.push(simulateTrending());
    }
  }

  // Run all tasks in parallel
  await Promise.allSettled(tasks);
}