/**
 * The single canonical set of DI tokens used throughout Spark.
 *
 * Tokens are Symbols, not strings, so two independently-authored
 * modules can never collide on a token by accident even if they
 * happen to choose the same label. Every Symbol still carries its
 * original label as `description`, so diagnostics and logs stay
 * human-readable via `tokenLabel()` below.
 */
export const TOKENS = {
  Logger: Symbol("kernel.logger"),
  ProviderRegistry: Symbol("providers.registry"),
  Identity: Symbol("core.identity"),
  Memory: Symbol("core.memory"),
  Context: Symbol("core.context"),
  Knowledge: Symbol("core.knowledge"),
  Reasoning: Symbol("core.reasoning"),
  Planning: Symbol("core.planning"),
  Search: Symbol("intelligence.search"),
  Recommendations: Symbol("intelligence.recommendations"),
  Organization: Symbol("intelligence.organization"),
  Personalization: Symbol("intelligence.personalization"),
  Writing: Symbol("intelligence.writing"),
  Translation: Symbol("intelligence.translation"),
  Summaries: Symbol("intelligence.summaries"),
  Privacy: Symbol("trust.privacy"),
  Security: Symbol("trust.security"),
  Automation: Symbol("automation"),
  Learning: Symbol("learning"),
} as const;

export type Token = symbol;

/** Human-readable label for a token, for logs/diagnostics/health output. */
export function tokenLabel(token: Token): string {
  return token.description ?? token.toString();
}
