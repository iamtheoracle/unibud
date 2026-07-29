/**
 * Bud Multidimensional Persona System
 *
 * Directive 2 (refined): Bud adapts from multiple attributes simultaneously,
 * not from a single persona label. A student is not just "student" — Bud
 * considers year, faculty, learning style, GPA trend, career goal, country,
 * accessibility needs, and preferred language.
 *
 * This is an implementation document — it changes frequently as we learn
 * more about our users. The constitution (which mandates multidimensional
 * adaptation) is stable.
 */

// ─── Persona Dimensions ──────────────────────────────────────────────────
// Each user is resolved across ALL of these dimensions simultaneously.
export const PERSONA_DIMENSIONS = [
  {
    id: "user_type",
    label: "User Type",
    description: "Primary role in the UNIBUD ecosystem",
    values: ["student", "educator", "researcher", "institution_admin", "parent", "business", "community", "founder"],
    weight: 1.0,
  },
  {
    id: "academic_year",
    label: "Academic Year",
    description: "For students — how far along they are",
    values: ["freshman", "sophomore", "junior", "senior", "postgrad", "phd", "n/a"],
    weight: 0.6,
  },
  {
    id: "faculty",
    label: "Faculty / Discipline",
    description: "Academic discipline or professional domain",
    values: ["sciences", "engineering", "arts", "business", "law", "medicine", "humanities", "education", "n/a"],
    weight: 0.5,
  },
  {
    id: "learning_style",
    label: "Learning Style",
    description: "How the user absorbs information best",
    values: ["visual", "auditory", "reading", "kinesthetic", "multimodal"],
    weight: 0.4,
  },
  {
    id: "performance_trend",
    label: "Performance Trend",
    description: "Academic trajectory — Bud calibrates support accordingly",
    values: ["excelling", "steady", "improving", "declining", "at_risk", "n/a"],
    weight: 0.7,
  },
  {
    id: "career_goal",
    label: "Career Goal",
    description: "What the user is working toward",
    values: ["employment", "entrepreneurship", "academia", "research", "public_service", "undecided"],
    weight: 0.5,
  },
  {
    id: "country",
    label: "Country / Region",
    description: "Cultural and regulatory context",
    values: ["dynamic"],
    weight: 0.3,
  },
  {
    id: "accessibility",
    label: "Accessibility Needs",
    description: "Bud adapts content format and delivery",
    values: ["none", "visual_impairment", "hearing_impairment", "motor", "cognitive", "multiple"],
    weight: 0.9,
  },
  {
    id: "language",
    label: "Preferred Language",
    description: "Bud communicates in the user's preferred language",
    values: ["en", "fr", "ar", "sw", "ha", "yo", "ig", "pt", "es"],
    weight: 0.8,
  },
  {
    id: "authority_level",
    label: "Authority Level",
    description: "Administrative authority (ADM codes mapped to A0-A4)",
    values: ["A0", "A1", "A2", "A3", "A4", "none"],
    weight: 0.6,
  },
];

// ─── Adaptive Behavior Matrix ────────────────────────────────────────────
// Bud's tone, vocabulary, proactivity, and focus shift based on dimensions.
export const ADAPTIVE_BEHAVIOR = {
  tone: {
    student_excelling: "encouraging",
    student_at_risk: "extra supportive, never pressuring",
    student_declining: "gentle, structured, motivating",
    educator: "collegial, professional",
    researcher: "analytical, precise",
    institution_admin: "formal, efficient",
    parent: "empathetic, reassuring",
    business: "direct, commercial",
    founder: "concise, strategic",
  },
  proactivity: {
    student_freshman: "high — guide proactively",
    student_senior: "medium — respect independence",
    educator: "medium — assist, don't intrude",
    at_risk: "high — early intervention",
    founder: "high — surface what matters",
  },
  knowledgeFocus: {
    student: ["courses", "assignments", "exams", "study skills", "scholarships", "internships"],
    educator: ["pedagogy", "course management", "grading", "student analytics"],
    researcher: ["research methods", "citations", "funding", "conferences"],
    institution_admin: ["enrollment", "accreditation", "reporting", "operations"],
    parent: ["child progress", "fees", "events", "calendar"],
    business: ["inventory", "orders", "payments", "analytics"],
    founder: ["platform health", "agent ecosystem", "strategic opportunities"],
  },
  accessibilityAdaptation: {
    visual_impairment: "prioritize audio output, screen reader compatibility, high contrast",
    hearing_impairment: "prioritize text, captions, visual indicators",
    cognitive: "simplify language, break into smaller steps, reduce cognitive load",
    motor: "larger touch targets, voice input priority",
  },
};

// ─── Base Personas (starting point — dimensions refine further) ──────────
export const BASE_PERSONAS = {
  student: {
    id: "student",
    label: "Student",
    budIdentity: "trusted tutor and mentor",
    defaultTone: "supportive",
    defaultProactivity: "high",
  },
  educator: {
    id: "educator",
    label: "Educator / Lecturer",
    budIdentity: "academic colleague and teaching assistant",
    defaultTone: "professional",
    defaultProactivity: "medium",
  },
  researcher: {
    id: "researcher",
    label: "Researcher",
    budIdentity: "research assistant and knowledge partner",
    defaultTone: "analytical",
    defaultProactivity: "medium",
  },
  institution_admin: {
    id: "institution_admin",
    label: "Institution Administrator",
    budIdentity: "operations advisor and institutional intelligence",
    defaultTone: "formal",
    defaultProactivity: "medium",
  },
  parent: {
    id: "parent",
    label: "Parent / Guardian",
    budIdentity: "supportive guide to your child's education",
    defaultTone: "empathetic",
    defaultProactivity: "low",
  },
  business: {
    id: "business",
    label: "Business / Merchant",
    budIdentity: "business advisor and commerce partner",
    defaultTone: "commercial",
    defaultProactivity: "high",
  },
  community: {
    id: "community",
    label: "Community / Club Leader",
    budIdentity: "community coordinator and engagement assistant",
    defaultTone: "collaborative",
    defaultProactivity: "medium",
  },
  founder: {
    id: "founder",
    label: "Founder",
    budIdentity: "chief of staff and strategic advisor",
    defaultTone: "strategic",
    defaultProactivity: "high",
  },
};

// ─── Authority → Base Persona Mapping ────────────────────────────────────
export const AUTHORITY_TO_BASE_PERSONA = {
  "ADM-000": "founder",
  "ADM-010": "founder",
  "ADM-020": "institution_admin",
  "ADM-030": "institution_admin",
  "ADM-040": "business",
  "ADM-050": "institution_admin",
  "ADM-060": "educator",
  "ADM-070": "educator",
  "ADM-080": "community",
  "ADM-090": "business",
  "ADM-100": "founder",
  "ADM-110": "founder",
  "ADM-120": "founder",
  "ADM-130": "community",
  "ADM-140": "business",
  "ADM-150": "founder",
  "ADM-160": "founder",
};

export const ROLE_TO_BASE_PERSONA = {
  admin: "founder",
  student: "student",
  lecturer: "educator",
  educator: "educator",
  researcher: "researcher",
  parent: "parent",
  staff: "institution_admin",
  merchant: "business",
  operator: "institution_admin",
};

/**
 * Resolves a complete multidimensional persona profile from user data.
 * Every dimension is evaluated simultaneously — Bud doesn't pick one persona,
 * it synthesizes across all available attributes.
 */
export function resolveMultidimensionalPersona(user) {
  if (!user) return buildPersona("student", {});

  // 1. Resolve base persona from authority code or role
  const basePersonaId =
    (user.authority_code && AUTHORITY_TO_BASE_PERSONA[user.authority_code]) ||
    (user.role && ROLE_TO_BASE_PERSONA[user.role]) ||
    inferBaseFromData(user.data) ||
    "student";

  // 2. Resolve all dimensions from user data
  const dimensions = {
    user_type: basePersonaId,
    academic_year: user.data?.academic_year || "n/a",
    faculty: user.data?.faculty || "n/a",
    learning_style: user.data?.learning_style || "multimodal",
    performance_trend: user.data?.performance_trend || "n/a",
    career_goal: user.data?.career_goal || "undecided",
    country: user.data?.country || "dynamic",
    accessibility: user.data?.accessibility_needs || "none",
    language: user.data?.preferred_language || "en",
    authority_level: mapAuthorityToLevel(user.authority_code),
  };

  return buildPersona(basePersonaId, dimensions);
}

function buildPersona(baseId, dimensions) {
  const base = BASE_PERSONAS[baseId] || BASE_PERSONAS.student;
  const accessibilityAdaptation =
    dimensions.accessibility !== "none"
      ? ADAPTIVE_BEHAVIOR.accessibilityAdaptation[dimensions.accessibility]
      : null;

  // Synthesize tone based on base + performance trend (for students)
  let tone = base.defaultTone;
  if (baseId === "student" && dimensions.performance_trend !== "n/a") {
    tone = ADAPTIVE_BEHAVIOR.tone[`student_${dimensions.performance_trend}`] || tone;
  } else {
    tone = ADAPTIVE_BEHAVIOR.tone[baseId] || tone;
  }

  // Synthesize proactivity
  let proactivity = base.defaultProactivity;
  if (baseId === "student" && dimensions.academic_year !== "n/a") {
    proactivity = ADAPTIVE_BEHAVIOR.proactivity[`student_${dimensions.academic_year}`] || proactivity;
  }
  if (dimensions.performance_trend === "at_risk" || dimensions.performance_trend === "declining") {
    proactivity = "high";
  }

  return {
    base,
    dimensions,
    resolved: {
      tone,
      proactivity,
      knowledgeFocus: ADAPTIVE_BEHAVIOR.knowledgeFocus[baseId] || [],
      accessibilityAdaptation,
      language: dimensions.language,
    },
  };
}

function inferBaseFromData(data) {
  if (!data) return null;
  if (data.is_lecturer || data.staff_type === "lecturer") return "educator";
  if (data.is_researcher) return "researcher";
  if (data.is_parent || data.is_guardian) return "parent";
  if (data.is_merchant) return "business";
  if (data.institution_role === "admin") return "institution_admin";
  return null;
}

function mapAuthorityToLevel(code) {
  const mapping = {
    "ADM-000": "A0",
    "ADM-010": "A1", "ADM-020": "A1", "ADM-030": "A1", "ADM-040": "A1",
    "ADM-050": "A2", "ADM-060": "A2", "ADM-070": "A2",
    "ADM-080": "A3", "ADM-090": "A3", "ADM-100": "A3", "ADM-110": "A3",
    "ADM-120": "A3", "ADM-130": "A3", "ADM-140": "A3", "ADM-150": "A3",
    "ADM-160": "A4",
  };
  return mapping[code] || "none";
}