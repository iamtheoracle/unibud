/**
 * TASK-002: Oracle Command System
 *
 * The Command System is the structured unit of work within Oracle. Every user
 * request is parsed into an OracleCommand before Oracle routes it. This gives
 * Oracle a consistent, inspectable representation of intent regardless of how
 * the request was formed (text, voice, button tap, etc.).
 *
 * Flow:
 *   raw input → CommandParser.parse() → OracleCommand → CommandRouter.route()
 *
 * Commands are immutable value objects. They are never mutated after creation.
 */

import { routeAgents } from "@/lib/agentRegistry";

// ─── Command Type Enum ────────────────────────────────────────────────────────

export const CommandType = Object.freeze({
  ACADEMIC_QUERY:    "ACADEMIC_QUERY",    // study plans, GPA, assignments, exams
  CAMPUS_QUERY:      "CAMPUS_QUERY",      // navigation, events, announcements
  CAREER_QUERY:      "CAREER_QUERY",      // jobs, CV, internships, scholarships
  SOCIAL_ACTION:     "SOCIAL_ACTION",     // connect, communities, clubs
  LIBRARY_QUERY:     "LIBRARY_QUERY",     // books, papers, citations
  MARKETPLACE_QUERY: "MARKETPLACE_QUERY", // buy, sell, lost & found
  WELLNESS_QUERY:    "WELLNESS_QUERY",    // wellbeing, stress, mental health
  PRODUCTIVITY:      "PRODUCTIVITY",      // Pomodoro, goals, focus sessions
  PERSONALIZATION:   "PERSONALIZATION",   // preferences, profile, memory
  GENERAL:           "GENERAL",           // anything not matched above
});

// ─── Command Shape ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} OracleCommand
 * @property {string}   requestId   - Propagated from the originating OracleRequest
 * @property {string}   type        - CommandType value
 * @property {string}   text        - Original user text
 * @property {string[]} agentIds    - Resolved agent IDs that should handle this command
 * @property {Object}   [context]   - Screen context passed from the caller
 * @property {string[]} [fileUrls]  - Attached file URLs
 * @property {number}   ts          - Parse timestamp
 */

// ─── Keyword → CommandType mapping ───────────────────────────────────────────

const COMMAND_RULES = [
  {
    type: CommandType.WELLNESS_QUERY,
    keywords: [
      "stress", "anxious", "anxiety", "wellbeing", "mental health", "tired",
      "overwhelmed", "burnout", "sad", "lonely", "depressed", "self-care",
      "can't cope", "struggling", "feeling",
    ],
  },
  {
    type: CommandType.ACADEMIC_QUERY,
    keywords: [
      "study plan", "gpa", "cgpa", "revision", "exam", "test", "quiz",
      "flashcard", "assignment", "deadline", "submit", "coursework",
      "homework", "course", "lecture", "grade", "timetable", "class schedule",
      "academic", "semester",
    ],
  },
  {
    type: CommandType.LIBRARY_QUERY,
    keywords: [
      "book", "journal", "lecture note", "past question", "textbook",
      "reading material", "research paper", "publication", "citation",
      "literature", "thesis", "dissertation",
    ],
  },
  {
    type: CommandType.CAREER_QUERY,
    keywords: [
      "cv", "resume", "linkedin", "interview", "job", "career",
      "internship", "scholarship", "grant", "competition", "fellowship",
      "opportunity", "professional", "cover letter",
    ],
  },
  {
    type: CommandType.CAMPUS_QUERY,
    keywords: [
      "where is", "how to find", "building", "hall", "office", "campus map",
      "directions", "navigate", "announcement", "campus news", "campus event",
      "sug", "faculty news", "weather", "transport",
    ],
  },
  {
    type: CommandType.SOCIAL_ACTION,
    keywords: [
      "friend", "community", "club", "society", "study partner", "study group",
      "accountability", "teammate", "meet people", "connect with", "mentor",
    ],
  },
  {
    type: CommandType.MARKETPLACE_QUERY,
    keywords: [
      "buy", "sell", "marketplace", "lost", "found", "item for sale",
      "purchase", "rent", "campus market", "price",
    ],
  },
  {
    type: CommandType.PRODUCTIVITY,
    keywords: [
      "pomodoro", "focus", "habit", "productivity", "study goal",
      "time management", "procrastination", "study session", "streak",
    ],
  },
];

// ─── CommandParser ────────────────────────────────────────────────────────────

export class CommandParser {
  /**
   * Parse raw user text into a structured OracleCommand.
   *
   * @param {string}   text       - Raw user input
   * @param {string}   requestId  - From the originating OracleRequest
   * @param {Object}   [context]  - Screen context
   * @param {string[]} [fileUrls] - Attached file URLs
   * @returns {OracleCommand}
   */
  static parse(text, requestId, context, fileUrls = []) {
    const lower = (text || "").toLowerCase();
    const type = CommandParser._resolveType(lower);
    const agentIds = routeAgents(text).map((a) => a.id);

    return Object.freeze({
      requestId,
      type,
      text,
      agentIds,
      context: context || null,
      fileUrls,
      ts: Date.now(),
    });
  }

  /**
   * Classify input text into a CommandType using keyword matching.
   * First match wins. Falls back to GENERAL.
   *
   * @param {string} lower - Lowercase input text
   * @returns {string}
   */
  static _resolveType(lower) {
    for (const rule of COMMAND_RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        return rule.type;
      }
    }
    return CommandType.GENERAL;
  }
}

// ─── CommandRouter ────────────────────────────────────────────────────────────

/**
 * Routes an OracleCommand to the appropriate handler function.
 *
 * Handlers are registered against CommandType values. Oracle registers its
 * built-in handler (the LLM call) during kernel initialisation. Services can
 * register domain-specific handlers via registerHandler().
 */
export class CommandRouter {
  constructor() {
    /** @type {Map<string, (cmd: OracleCommand, ctx: Object) => Promise<string>>} */
    this._handlers = new Map();
  }

  /**
   * Register a handler for a command type. Later registrations overwrite
   * earlier ones (last-writer-wins).
   *
   * @param {string} commandType - CommandType value
   * @param {(cmd: OracleCommand, ctx: Object) => Promise<string>} handler
   */
  registerHandler(commandType, handler) {
    this._handlers.set(commandType, handler);
  }

  /**
   * Route a command to its handler. Falls back to the GENERAL handler if no
   * specific handler is found. Throws if no GENERAL handler is registered.
   *
   * @param {OracleCommand} command
   * @param {Object} ctx - Runtime context (user, state, …)
   * @returns {Promise<string>}
   */
  async route(command, ctx) {
    const handler =
      this._handlers.get(command.type) ||
      this._handlers.get(CommandType.GENERAL);

    if (!handler) {
      throw new Error(
        `[Oracle:CommandRouter] No handler registered for type "${command.type}" and no GENERAL fallback.`
      );
    }

    return handler(command, ctx);
  }
}
