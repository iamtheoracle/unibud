/**
 * UNIBUD Welcome Background Library
 * -------------------------------
 * A curated collection of premium, cinematic campus photographs used as the
 * ambient backdrop of the Welcome screen.
 *
 * Behaviour:
 *  • One background is chosen per app session (persists for the whole session).
 *  • Recently shown backgrounds are avoided across sessions.
 *  • If the user has selected a country, backgrounds tagged with a matching
 *    region are prioritised; otherwise beautiful campuses from around the world
 *    rotate.
 *
 * Each entry:
 *  id        — stable identifier (used for de-dup / recent tracking)
 *  url       — high-resolution image URL
 *  label     — human description (a11y)
 *  tone      — "dark" | "light"  (drives logo + text colour for readability)
 *  regions   — array of region/country keys this background belongs to.
 *              "global" = suitable for any country.
 *  category  — scene type (library, lab, graduation, etc.)
 *
 * To grow the library: add entries here. Country-specific photos should tag the
 * matching region key (see REGION_KEYS) so country-aware selection picks them up.
 */

export const REGION_KEYS = [
  "global",
  "nigeria",
  "ghana",
  "kenya",
  "south_africa",
  "united_kingdom",
  "united_states",
  "canada",
  "australia",
  "india",
  "germany",
  "france",
  "malaysia",
  "singapore",
  "japan",
  "south_korea",
  "turkey",
  "uae",
];

// Map full country names (as stored on the user profile) to region keys.
const COUNTRY_TO_REGION = {
  Nigeria: "nigeria",
  Ghana: "ghana",
  Kenya: "kenya",
  "South Africa": "south_africa",
  "United Kingdom": "united_kingdom",
  "United States": "united_states",
  Canada: "canada",
  Australia: "australia",
  India: "india",
  Germany: "germany",
  France: "france",
  Malaysia: "malaysia",
  Singapore: "singapore",
  Japan: "japan",
  "South Korea": "south_korea",
  Turkey: "turkey",
  "United Arab Emirates": "uae",
};

export function regionForCountry(country) {
  if (!country) return null;
  return COUNTRY_TO_REGION[country] || null;
}

export const WELCOME_BACKGROUNDS = [
  {
    id: "campus-modern-golden",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/236725826_generated_image.png",
    label: "Modern university campus at golden hour",
    tone: "dark",
    regions: ["global"],
    category: "modern_campus",
  },
  {
    id: "historic-library",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/2eda47bec_generated_image.png",
    label: "Historic university library with warm reading lamps",
    tone: "dark",
    regions: ["global"],
    category: "library",
  },
  {
    id: "graduation-sunset",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/0ec39f7cb_generated_image.png",
    label: "Graduation ceremony at sunset",
    tone: "dark",
    regions: ["global"],
    category: "graduation",
  },
  {
    id: "science-lab",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/fd3404100_generated_image.png",
    label: "Modern science laboratory",
    tone: "dark",
    regions: ["global"],
    category: "laboratory",
  },
  {
    id: "lecture-hall",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/be780766f_generated_image.png",
    label: "Grand university lecture hall",
    tone: "dark",
    regions: ["global"],
    category: "lecture_hall",
  },
  {
    id: "collaboration-space",
    url: "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/d9642cf73_generated_image.png",
    label: "Students collaborating in a campus study space",
    tone: "dark",
    regions: ["global"],
    category: "collaboration",
  },
];

// Accredited institutions shown as small trust marks on the Welcome screen.
// Rendered as elegant monochrome wordmarks (no external logo assets required).
export const ACCREDITED_INSTITUTIONS = [
  "UNIBEN",
  "Oxford",
  "MIT",
  "UCT",
  "UoN",
  "Cambridge",
];