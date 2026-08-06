/**
 * Adaptive Navigation configuration — four primary destinations.
 *
 * UNIBUD Navigation OS: users navigate between four visible tabs.
 * Bud is NOT a tab — it is accessible through Me, the Command Bar,
 * voice, and quick actions.
 *
 *   Square  → Global discovery
 *   Quad    → Campus Operating System (Academic + Social)
 *   Connect → Communication
 *   Me      → Personal Operating System (includes Bud Home)
 */
import { PRIMARY_DESTINATIONS } from "@/lib/navigation/registry";

export const PRIMARY_NAV = PRIMARY_DESTINATIONS.map(({ id, label, to }) => ({
  key: id,
  label,
  to,
  icon: null, // Icons are resolved in PrimaryNavBar from the icon string in PRIMARY_DESTINATIONS
}));

/** Legacy compat — kept for any code still referencing MODE_HOME */
export const MODE_HOME = {
  academic: "/quad",
  social: "/square",
};
