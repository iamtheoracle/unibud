/**
 * Search Intent Resolver (Spark)
 *
 * Understands what a student means — not just what they typed — across the
 * core UNIBUD domains: universities, courses/faculties/departments, and
 * content categories. Resolves abbreviations, synonyms and minor typos into
 * canonical interpretations the UI can route to.
 *
 * Examples:
 *   "Comp Sci"   → Computer Science          (course)
 *   "Law"        → Law · Faculty of Law        (course)
 *   "UNIBEN"     → University of Benin        (university)
 *   "Uniben"     → University of Benin        (university, typo-tolerant)
 *   "Scholarships" → Scholarships surface     (category)
 *   "jobs"       → Career Opportunities       (category)
 *
 * The resolver never claims certainty when uncertain: when no strong match
 * exists it falls back to a neutral "Search UNIBUD" interpretation rather
 * than guessing. It is pure and synchronous so the UI feels instant.
 */

import { INSTITUTIONS } from "@/data/nigerianInstitutions";
import { normalizeCourse } from "@/lib/academics/courseNormalizer";

// Content category synonyms → a single canonical surface.
// Ordered: first match wins, so place more specific keys before generic ones.
const CATEGORY_SYNONYMS = [
  { keys: ["scholarship", "scholarships", "funding", "grant", "grants", "bursary", "bursaries"], label: "Scholarships", route: "/scholarships", icon: "Award" },
  { keys: ["event", "events", "activity", "activities", "hangout", "meetup", "party"], label: "Campus Events", route: "/events", icon: "Calendar" },
  { keys: ["marketplace", "market", "buy", "sell", "shop", "store", "deal", "deals", "secondhand"], label: "Marketplace", route: "/marketplace", icon: "ShoppingBag" },
  { keys: ["note", "notes", "material", "materials", "past question", "past questions", "pdf", "handout", "handouts", "summary"], label: "Knowledge & Notes", route: "/knowledge", icon: "BookOpen" },
  { keys: ["job", "jobs", "internship", "internships", "career", "careers", "vacancy", "vacancies", "employment"], label: "Career Opportunities", route: "/career", icon: "Briefcase" },
  { keys: ["study group", "study groups", "study partner", "study buddy", "study session", "study sessions"], label: "Study Groups", route: "/study-groups", icon: "Users" },
  { keys: ["club", "clubs", "society", "societies"], label: "Clubs", route: "/clubs", icon: "Users" },
  { keys: ["community", "communities"], label: "Communities", route: "/communities", icon: "Users" },
  { keys: ["final year project", "fyp", "project", "projects", "research", "research project"], label: "Projects & Research", route: "/research", icon: "FlaskConical" },
  { keys: ["assignment", "assignments", "coursework", "homework"], label: "Assignments", route: "/assignments", icon: "ClipboardList" },
  { keys: ["course", "courses", "module", "modules", "class", "classes", "lecture", "lectures", "timetable"], label: "Courses", route: "/courses", icon: "BookOpen" },
  { keys: ["people", "student", "students", "classmate", "classmates", "friend", "friends", "connect", "find people"], label: "People", route: "/connect", icon: "UserSearch" },
  { keys: ["message", "messages", "dm", "chat", "chats", "inbox"], label: "Messages", route: "/messages", icon: "MessageSquare" },
  { keys: ["bud", "tutor", "mentor", "explain", "assistant", "help me"], label: "Bud", route: "/bud", icon: "Sparkles" },
];

function normalizeKey(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function resolveUniversity(key) {
  // 1) Exact abbreviation (UNIBEN, UNILAG …) — case-insensitive after normalize.
  const exactShort = INSTITUTIONS.find((i) => normalizeKey(i.short) === key);
  if (exactShort) {
    return { domain: "university", canonical: exactShort.name, label: exactShort.name, sub: `${exactShort.short} · ${exactShort.state}`, route: "/onboarding/university", confidence: 1, icon: "Building2" };
  }
  // 2) Typo-tolerant abbreviation match (e.g. "uniben", "unilg").
  let best = null;
  let bestDist = Infinity;
  for (const inst of INSTITUTIONS) {
    const sk = normalizeKey(inst.short);
    if (sk.length < 3 || sk.length > 8) continue;
    const d = levenshtein(key, sk);
    // Allow up to ~30% character distance for short abbreviations.
    if (d <= Math.max(1, Math.floor(sk.length * 0.3)) && d < bestDist) {
      bestDist = d;
      best = inst;
    }
  }
  if (best) {
    return { domain: "university", canonical: best.name, label: best.name, sub: `${best.short} · ${best.state}`, route: "/onboarding/university", confidence: 1 - bestDist / Math.max(key.length, 1), icon: "Building2" };
  }
  // 3) Full name contains the query ("university of benin").
  const nameMatch = INSTITUTIONS.find((i) => normalizeKey(i.name).includes(key));
  if (nameMatch) {
    return { domain: "university", canonical: nameMatch.name, label: nameMatch.name, sub: `${nameMatch.short} · ${nameMatch.state}`, route: "/onboarding/university", confidence: 0.95, icon: "Building2" };
  }
  return null;
}

function resolveCourse(original) {
  const course = normalizeCourse(original);
  if (course.matched) {
    const sub = course.faculty ? `Faculty of ${course.faculty}` : "Course";
    return { domain: "course", canonical: course.normalized, label: course.normalized, sub, route: "/courses", confidence: course.confidence, icon: "BookOpen" };
  }
  return null;
}

function resolveCategory(key) {
  for (const cat of CATEGORY_SYNONYMS) {
    if (cat.keys.some((k) => key === k || key.includes(k) || k.includes(key))) {
      return { domain: "category", canonical: cat.label, label: cat.label, sub: "Explore", route: cat.route, confidence: 0.9, icon: cat.icon };
    }
  }
  return null;
}

/**
 * Resolve a raw query into ranked canonical interpretations.
 * @returns { original, key, interpretations: [{ domain, canonical, label, sub, route, confidence, icon }] }
 */
export function resolveSearchIntent(query) {
  const original = (query || "").trim();
  const key = normalizeKey(original);
  if (!key) return { original, key: "", interpretations: [] };

  const interpretations = [];

  const uni = resolveUniversity(key);
  if (uni) interpretations.push(uni);

  const course = resolveCourse(original);
  if (course) interpretations.push(course);

  const cat = resolveCategory(key);
  if (cat) interpretations.push(cat);

  if (interpretations.length === 0) {
    interpretations.push({
      domain: "all",
      canonical: original,
      label: `Search UNIBUD for “${original}”`,
      sub: "People · Posts · Notes · Groups",
      route: "/discover",
      confidence: 0.5,
      icon: "Search",
    });
  }

  interpretations.sort((a, b) => b.confidence - a.confidence);
  return { original, key, interpretations };
}