/**
 * Static configuration only. No behavior lives here — these are just
 * the knobs the orchestrator reads.
 */
export interface BudLimits {
  /** Max prior memory records recalled per turn. */
  memoryRecallLimit: number;
  /** Max knowledge/search results considered per turn. */
  knowledgeSearchLimit: number;
}

export const DEFAULT_BUD_LIMITS: BudLimits = {
  memoryRecallLimit: 10,
  knowledgeSearchLimit: 5,
};

export interface BudConfigOptions {
  name?: string;
  limits?: Partial<BudLimits>;
}

export function resolveLimits(overrides?: Partial<BudLimits>): BudLimits {
  return { ...DEFAULT_BUD_LIMITS, ...overrides };
}
