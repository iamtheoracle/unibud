/**
 * Course Normalizer (Spark)
 * Transforms informal/abbreviated course input into canonical programme names
 * for search and analytics, while preserving the student's original text.
 *
 * Examples:
 *   "Computer sci"   → "Computer Science"
 *   "Comp Sci"       → "Computer Science"
 *   "Civil Eng"       → "Civil Engineering"
 *   "Mass Comm"       → "Mass Communication"
 *   "Econs"           → "Economics"
 *   "Info Tech"       → "Information Technology"
 *
 * Never silently overwrites what the user typed — the caller shows a
 * confirmation when a high-confidence match differs from the original.
 */

import { ALL_COURSES } from "@/data/nigerianCourses";

// Hand-curated alias map (lowercased, punctuation-stripped keys).
const ALIASES = {
  "computer sci": "Computer Science",
  "comp sci": "Computer Science",
  "compsci": "Computer Science",
  "cs": "Computer Science",
  "computer science": "Computer Science",
  "info tech": "Information Technology",
  "infotech": "Information Technology",
  "it": "Information Technology",
  "information technology": "Information Technology",
  "software eng": "Software Engineering",
  "software engg": "Software Engineering",
  "se": "Software Engineering",
  "cyber security": "Cyber Security",
  "cybersecurity": "Cyber Security",
  "data science": "Data Science",
  "civil eng": "Civil Engineering",
  "civil engg": "Civil Engineering",
  "civil": "Civil Engineering",
  "elect eng": "Electrical Engineering",
  "elec eng": "Electrical Engineering",
  "electrical eng": "Electrical Engineering",
  "electrical and electronics engineering": "Electrical & Electronics Engineering",
  "eee": "Electrical & Electronics Engineering",
  "mech eng": "Mechanical Engineering",
  "mechanical eng": "Mechanical Engineering",
  "mechanical": "Mechanical Engineering",
  "chemical eng": "Chemical Engineering",
  "chemical": "Chemical Engineering",
  "petroleum eng": "Petroleum Engineering",
  "petroleum": "Petroleum Engineering",
  "mechatronics": "Mechatronics Engineering",
  "mass comm": "Mass Communication",
  "mass communication": "Mass Communication",
  "masscomm": "Mass Communication",
  "econs": "Economics",
  "economics": "Economics",
  "political sci": "Political Science",
  "pol sci": "Political Science",
  "political science": "Political Science",
  "psych": "Psychology",
  "psychology": "Psychology",
  "soc": "Sociology",
  "sociology": "Sociology",
  "accounting": "Accounting",
  "accountancy": "Accounting",
  "acc": "Accounting",
  "bus admin": "Business Administration",
  "business admin": "Business Administration",
  "business administration": "Business Administration",
  "bba": "Business Administration",
  "marketing": "Marketing",
  "finance": "Finance",
  "banking and finance": "Finance",
  "banking & finance": "Finance",
  "public admin": "Public Administration",
  "public administration": "Public Administration",
  "law": "Law",
  "medicine": "Medicine & Surgery",
  "medicine and surgery": "Medicine & Surgery",
  "mbbs": "Medicine & Surgery",
  "nursing": "Nursing Sciences",
  "nursing sciences": "Nursing Sciences",
  "pharmacy": "Pharmacy",
  "medical lab science": "Medical Laboratory Science",
  "medical laboratory science": "Medical Laboratory Science",
  "mls": "Medical Laboratory Science",
  "public health": "Public Health",
  "anatomy": "Anatomy",
  "physiology": "Physiology",
  "biochem": "Biochemistry",
  "biochemistry": "Biochemistry",
  "microbio": "Microbiology",
  "microbiology": "Microbiology",
  "maths": "Mathematics",
  "math": "Mathematics",
  "mathematics": "Mathematics",
  "stats": "Statistics",
  "statistics": "Statistics",
  "physics": "Physics",
  "chem": "Chemistry",
  "chemistry": "Chemistry",
  "geology": "Geology",
  "english": "English & Literary Studies",
  "english and literary studies": "English & Literary Studies",
  "history": "History & International Studies",
  "linguistics": "Linguistics",
  "philosophy": "Philosophy",
  "theatre arts": "Theatre Arts",
  "architecture": "Architecture",
  "estate mgmt": "Estate Management",
  "estate management": "Estate Management",
  "urban and regional planning": "Urban & Regional Planning",
  "urp": "Urban & Regional Planning",
  "quantity surveying": "Quantity Surveying",
  "qs": "Quantity Surveying",
  "agric": "Agriculture",
  "agriculture": "Agriculture",
  "animal science": "Animal Science",
  "food science and technology": "Food Science & Technology",
  "food tech": "Food Science & Technology",
  "education": "Education",
};

function normalizeKey(input) {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function tokenize(key) {
  return key.split(" ").filter(Boolean);
}

/** Find best canonical match for a normalized key using token overlap. */
function bestTokenMatch(key) {
  const inputTokens = new Set(tokenize(key));
  if (inputTokens.size === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const course of ALL_COURSES) {
    const courseKey = normalizeKey(course.name);
    const courseTokens = new Set(tokenize(courseKey));
    let overlap = 0;
    inputTokens.forEach((t) => {
      if (courseTokens.has(t)) overlap++;
    });
    // Coverage: how much of the input is explained by the course
    const coverage = overlap / inputTokens.size;
    // Precision: how much of the course is explained by the input (penalize vague matches)
    const precision = overlap / courseTokens.size;
    const score = coverage * 0.7 + precision * 0.3;
    if (score > bestScore && coverage >= 0.5) {
      bestScore = score;
      best = { course, score, coverage };
    }
  }
  return best ? { course: best.course, confidence: best.score } : null;
}

/**
 * Normalize a course input.
 * @returns { original, normalized, matched, confidence, suggestions[] }
 *  - matched true  → confidence >= 0.7 (strong match, show confirmation)
 *  - suggestions  → 1-3 close matches when confidence is moderate
 *  - matched false, suggestions [] → no good match (manual entry, Bud asks)
 */
export function normalizeCourse(input) {
  const original = (input || "").trim();
  if (!original) {
    return { original: "", normalized: null, matched: false, confidence: 0, suggestions: [] };
  }
  const key = normalizeKey(original);

  // 1) Exact alias lookup
  if (ALIASES[key]) {
    const canonical = ALL_COURSES.find((c) => c.name === ALIASES[key]) || { name: ALIASES[key], faculty: "", department: "" };
    return { original, normalized: canonical.name, matched: true, confidence: 1, suggestions: [], faculty: canonical.faculty, department: canonical.department };
  }

  // 2) Exact canonical name
  const exact = ALL_COURSES.find((c) => normalizeKey(c.name) === key);
  if (exact) {
    return { original, normalized: exact.name, matched: true, confidence: 1, suggestions: [], faculty: exact.faculty, department: exact.department };
  }

  // 3) Substring / token match
  const best = bestTokenMatch(key);
  if (best && best.confidence >= 0.7) {
    return {
      original,
      normalized: best.course.name,
      matched: true,
      confidence: best.confidence,
      suggestions: [],
      faculty: best.course.faculty,
      department: best.course.department,
    };
  }

  // 4) Suggestions (moderate confidence)
  if (best && best.confidence >= 0.4) {
    const sugKey = key;
    const ranked = ALL_COURSES.map((c) => {
      const ck = normalizeKey(c.name);
      let overlap = 0;
      tokenize(sugKey).forEach((t) => {
        if (ck.includes(t)) overlap++;
      });
      const score = overlap / Math.max(tokenize(sugKey).length, 1);
      return { course: c, score };
    })
      .filter((r) => r.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.course);
    return { original, normalized: null, matched: false, confidence: best.confidence, suggestions: ranked };
  }

  // 5) No match — manual entry
  return { original, normalized: null, matched: false, confidence: 0, suggestions: [] };
}