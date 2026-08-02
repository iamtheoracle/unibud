/**
 * UNIBUD Content Architecture Constitution
 *
 * Internal operating system documents (Constitutions, Founder Vision, Release
 * Gates, AI Rules, Non-Negotiables, Developer Notes) must never appear inside
 * user-facing spaces. UNIBUD has five primary user spaces — Square, Campus,
 * Discovery, Quad, and Me — each with a specific responsibility. Internal OS
 * infrastructure belongs to a separate administrative layer.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const CONTENT_ARCH_PREAMBLE = {
  title: "UNIBUD Content Architecture",
  statement:
    "The content architecture separates UNIBUD into five primary user spaces (Square, Campus, " +
    "Discovery, Quad, Me) and a separate internal operating system layer. Internal OS documents " +
    "belong to the administrative layer and are never displayed in any user-facing feed, " +
    "recommendation, search result, or timeline unless accessed explicitly by a Founder or " +
    "Administrator. This separation is a permanent architectural rule of UNIBUD OS.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const CONTENT_ARCH_GLOBAL_RULE = {
  id: "ca_global",
  rule:
    "The five user spaces (Square, Campus, Discovery, Quad, and Me) may only consume user-facing " +
    "content. Internal operating system documents belong to a separate administrative layer and " +
    "are never displayed in any user-facing feed, recommendation, search result, or timeline " +
    "unless accessed explicitly by a Founder or Administrator. This separation is a permanent " +
    "architectural rule of UNIBUD OS.",
  severity: "critical",
};

// ── User Space Definitions ──
export const USER_SPACES = [
  {
    id: "square",
    name: "Square",
    responsibility: "University social timeline",
    icon: "LayoutGrid",
    allowed: [
      "Student posts",
      "Lecturer posts",
      "Campus photos",
      "Videos",
      "Reels",
      "Polls",
      "Questions",
      "Achievements",
      "Announcements",
      "Campus moments",
      "Club posts",
      "Event updates",
    ],
    forbidden: [
      "Constitutions",
      "Founder Vision",
      "AI Rules",
      "Release Gates",
      "System documents",
      "Internal documentation",
    ],
  },
  {
    id: "campus",
    name: "Campus",
    responsibility: "University ecosystem",
    icon: "Building2",
    allowed: [
      "Faculties",
      "Departments",
      "Courses",
      "Clubs",
      "Student organizations",
      "Events",
      "Timetables",
      "Study groups",
      "Marketplace",
      "Lost & Found",
      "Jobs",
      "Internships",
      "Campus services",
    ],
    forbidden: [
      "Internal OS documents",
      "System configuration",
      "Developer notes",
    ],
  },
  {
    id: "discovery",
    name: "Discovery",
    responsibility: "Find people and opportunities",
    icon: "Compass",
    allowed: [
      "People",
      "Communities",
      "Clubs",
      "Events",
      "Businesses",
      "Creators",
      "Trending discussions",
      "Recommended courses",
      "Marketplace listings",
      "Universities",
      "Research",
      "Scholarships",
    ],
    forbidden: [
      "Internal documents",
      "System documents",
      "Founder documents",
    ],
  },
  {
    id: "quad",
    name: "Quad",
    responsibility: "Collaboration space",
    icon: "MessagesSquare",
    allowed: [
      "Chats",
      "Group chats",
      "Communities",
      "Class groups",
      "Club discussions",
      "Project workspaces",
      "Shared notes",
      "Collaboration spaces",
      "Voice rooms",
      "Files",
    ],
    forbidden: [
      "Founder documents",
      "Constitutions",
      "Internal OS documents",
    ],
  },
  {
    id: "me",
    name: "Me",
    responsibility: "Private operating space (owner-only)",
    icon: "User",
    allowed: [
      "Profile",
      "Academic progress",
      "Saved posts",
      "Saved notes",
      "Assignments",
      "Projects",
      "Calendar",
      "Achievements",
      "Settings",
      "Preferences",
      "Bud history",
      "Notifications",
    ],
    forbidden: [
      "Other users' private data",
      "Internal OS documents (unless admin)",
    ],
  },
];

// ── Internal OS Layer ──
export const INTERNAL_OS_ITEMS = [
  "Founder Vision",
  "Constitution",
  "Permanent Principles",
  "Release Gates",
  "AI Rules",
  "Oracle Rules",
  "Bud Rules",
  "Developer Notes",
  "Internal Documentation",
  "System Configuration",
];

// ── Architectural Rules ──
export const CONTENT_ARCH_RULES = [
  {
    id: "ca_square_only_social",
    rule: "Square may only display social timeline content (posts, photos, videos, polls, achievements, announcements, club posts, event updates)",
    space: "square",
    severity: "critical",
  },
  {
    id: "ca_campus_only_operational",
    rule: "Campus may only display operational university content (faculties, departments, courses, clubs, events, timetables, services)",
    space: "campus",
    severity: "critical",
  },
  {
    id: "ca_discovery_only_people_opps",
    rule: "Discovery may only display people, communities, opportunities, and recommendations",
    space: "discovery",
    severity: "critical",
  },
  {
    id: "ca_quad_only_collab",
    rule: "Quad may only display collaboration content (chats, groups, communities, workspaces, shared notes, files)",
    space: "quad",
    severity: "critical",
  },
  {
    id: "ca_me_only_owner",
    rule: "Me may only display the owner's private data (profile, academics, saved content, calendar, achievements, settings, Bud history)",
    space: "me",
    severity: "critical",
  },
  {
    id: "ca_no_internal_in_feeds",
    rule: "Internal OS documents must never appear in any user-facing feed, recommendation, search result, or timeline",
    severity: "critical",
  },
  {
    id: "ca_no_system_in_square",
    rule: "Square must never display constitutions, founder vision, AI rules, release gates, or system documents",
    space: "square",
    severity: "critical",
  },
  {
    id: "ca_internal_layer_separate",
    rule: "Internal operating system infrastructure must exist in a completely separate administrative layer",
    severity: "critical",
  },
  {
    id: "ca_internal_admin_only",
    rule: "Internal OS documents are accessible only to Founders and Administrators via explicit access",
    severity: "critical",
  },
  {
    id: "ca_spaces_never_query_internal",
    rule: "The five user spaces (Square, Campus, Discovery, Quad, Me) may never query internal operating system documents",
    severity: "critical",
  },
  {
    id: "ca_spaces_user_facing_only",
    rule: "The five user spaces may only consume user-facing content",
    severity: "critical",
  },
  {
    id: "ca_separation_permanent",
    rule: "This content separation is a permanent architectural rule of UNIBUD OS and cannot be overridden",
    severity: "critical",
  },
];

export function getContentArchRuleCount() {
  return CONTENT_ARCH_RULES.length;
}