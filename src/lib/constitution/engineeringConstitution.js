/**
 * UNIBUD Engineering Constitution
 *
 * The definitive set of rules that govern every part of the platform.
 * These are not guidelines — they are enforced programmatically through
 * guards, filters, and validators throughout the codebase.
 *
 * Any code that violates these rules is a bug.
 */

export const CONSTITUTION = {
  // ── 1. Data Authenticity ──
  data: {
    rule: "Never fabricate user data",
    enforced: [
      "Never create fake user posts, conversations, grades, attendance, assignments, transactions, friendships, achievements, notifications, or AI memories",
      "All feed content must originate from real users, lecturers, administrators, departments, faculties, clubs, societies, campus businesses, or verified organizations",
      "Likes, comments, and shares must come from real interactions — never artificially inflated",
      "Analytics must use genuine interactions, sessions, engagement, and searches only",
    ],
  },

  // ── 2. Demo Content ──
  demo: {
    rule: "Demo content only when appropriate, clearly identified",
    enforced: [
      "Seed only official demo content from verified university accounts, departments, clubs, lecturers, and campus services",
      "All demo content is marked with is_seed_content: true and a Launch badge",
      "Demo content is never presented as real user activity",
      "Administrators can remove all demo data with one action",
      "Demo content is automatically de-emphasized as real activity grows",
    ],
  },

  // ── 3. AI Grounding ──
  ai: {
    rule: "Bud must never hallucinate university information",
    enforced: [
      "Bud must verify information against available data before responding",
      "Bud must cite official university sources where available",
      "Bud must distinguish facts from suggestions",
      "Bud must explain uncertainty when information is incomplete",
      "Bud must ask questions when information is missing",
      "Bud must never invent a user's history, relationships, achievements, or interactions",
      "Bud's entity context excludes seed/demo content — only real data is analyzed",
    ],
  },

  // ── 4. Feed Integrity ──
  feed: {
    rule: "Feeds are built from real activity only",
    enforced: [
      "Campus Feed includes: official announcements, department updates, lecturer posts, club posts, student posts, marketplace posts, event posts, research posts",
      "Never artificially inflate engagement — likes, comments, shares come from real interactions",
      "Real content is prioritized over launch content",
      "Trending is calculated from real engagement only",
    ],
  },

  // ── 5. Recommendations ──
  recommendations: {
    rule: "Recommendations based on real user data only",
    enforced: [
      "Recommendations use: interests, enrolled courses, followed clubs, followed departments, campus activity, search history, saved items, user preferences",
      "Never invent interests or preferences",
      "Recommendations improve over time based on real engagement",
    ],
  },

  // ── 6. Notifications ──
  notifications: {
    rule: "Notifications triggered by real events only",
    enforced: [
      "Notifications only appear when triggered by: actual events, messages, assignments, deadlines, comments, likes, announcements, or user preferences",
      "Never send fake engagement notifications",
      "All notifications respect user preferences and quiet hours",
    ],
  },

  // ── 7. Search ──
  search: {
    rule: "Search indexes real data only",
    enforced: [
      "Search indexes: real users, posts, files, events, clubs, lecturers, departments",
      "No fabricated results",
    ],
  },

  // ── 8. AI Memory ──
  memory: {
    rule: "Bud remembers only user-approved data",
    enforced: [
      "Bud remembers: user-approved preferences, saved settings, previous conversations, user-created documents, user-created notes",
      "Users can edit, delete, export, and disable memory",
      "Bud never stores private chats, grades, assignments, or documents without authorization",
    ],
  },

  // ── 9. Privacy ──
  privacy: {
    rule: "Never access private data without authorization",
    enforced: [
      "Never access private chats, grades, assignments, or documents without proper authorization",
      "Row-Level Security (RLS) enforced on all entities",
      "Users control their data and privacy settings",
    ],
  },

  // ── 10. Security ──
  security: {
    rule: "Every sensitive action requires validation",
    enforced: [
      "Permission validation on every sensitive action",
      "Authentication required for protected routes",
      "Authorization enforced via RLS and role checks",
      "Audit logging for all sensitive operations",
    ],
  },

  // ── 11. Real-time ──
  realtime: {
    rule: "Updates only when real events occur",
    enforced: [
      "Real-time subscriptions update feeds, stories, comments, reactions, and notifications",
      "No simulated updates after production launch",
      "Entity changes trigger immediate UI updates via cache invalidation",
    ],
  },

  // ── 12. Production Readiness ──
  production: {
    rule: "Verify everything before release",
    checklist: [
      "Every button works",
      "Every API responds",
      "Every AI workflow functions",
      "Every permission is enforced",
      "Every notification is accurate",
      "Every search result is valid",
      "Every page loads correctly",
      "Every upload succeeds",
      "Every download succeeds",
      "Every workflow completes successfully",
      "Every feature has been tested",
      "No placeholder remains",
      "No broken links remain",
      "No unfinished screen remains",
      "No dead-end navigation remains",
      "No inaccessible controls remain",
      "No inconsistent design remains",
      "No fake user-generated activity remains",
    ],
  },
};

/**
 * AI Grounding Rules — injected into Bud's system prompt to enforce
 * that Bud never hallucinates, always verifies, and always cites sources.
 */
export const AI_GROUNDING_PROMPT =
  "CRITICAL RULES for Bud:\n" +
  "1. NEVER fabricate university information. If you don't know, say so.\n" +
  "2. VERIFY information against the provided entity data before stating facts.\n" +
  "3. CITE official university sources where available (department, faculty, official accounts).\n" +
  "4. DISTINGUISH facts from suggestions. Use 'I suggest' or 'You might consider' for recommendations.\n" +
  "5. EXPLAIN uncertainty. If data is incomplete, say 'Based on what I can see...' or 'I don't have enough information to...'\n" +
  "6. ASK questions when information is missing. Never guess.\n" +
  "7. NEVER invent a user's history, relationships, achievements, or interactions.\n" +
  "8. Only reference data explicitly provided in the context. Do not assume or extrapolate.\n" +
  "9. If entity data is empty or unavailable, acknowledge it honestly rather than generating plausible-sounding content.\n" +
  "10. Always prioritize accuracy over helpfulness. A truthful 'I don't know' is better than a confident hallucination.";

/**
 * Production Readiness Checklist — used by the Launch Readiness dashboard
 * and the self-healing engine to verify the platform is production-ready.
 */
export const PRODUCTION_CHECKLIST = CONSTITUTION.production.checklist.map((item, index) => ({
  id: `prod_${index + 1}`,
  label: item,
  category: index < 10 ? "functional" : index < 17 ? "quality" : "authenticity",
}));