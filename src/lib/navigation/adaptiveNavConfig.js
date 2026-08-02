import {
  Users as SocialIcon,
  BookOpen as AcademicIcon,
} from "lucide-react";

/**
 * Adaptive Navigation configuration — simplified to 3 primary destinations.
 *
 * UNIBUD is no longer a collection of separate apps. Users navigate between
 * only three high-level areas:
 *   - Social    → everything student life (feed, friends, events, marketplace)
 *   - Academic  → the complete academic workspace (classes, assignments, exams)
 *   - Me        → personal space (profile, settings, achievements)
 *
 * Bud is NOT a navigation item — it's permanently available across the app
 * through the persistent input and conversational interface.
 */

export const PRIMARY_NAV = [
  { key: "social", label: "Social", to: "/social", icon: SocialIcon },
  { key: "academic", label: "Academic", to: "/academics", icon: AcademicIcon },
  { key: "me", label: "Me", to: "/me", icon: null }, // icon handled separately as a circular profile button
];

/** Legacy compat — kept for any code still referencing MODE_HOME */
export const MODE_HOME = {
  academic: "/academics",
  social: "/social",
};