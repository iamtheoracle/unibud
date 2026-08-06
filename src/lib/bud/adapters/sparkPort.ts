/**
 * BudSparkPort is the ONLY thing Bud's orchestration code depends on —
 * never the concrete Spark class directly. This keeps Bud honest about
 * "orchestration only": if a capability isn't listed here, Bud cannot
 * reach for it, including AI providers, which are deliberately absent
 * from this port.
 *
 * It is a subset of Spark's public API, re-typed narrowly so Bud's
 * intent (recall memory, search knowledge, reason, plan, draft text,
 * store memory) is visible at the type level.
 */
import type { IdentityContext } from "../../spark/core/identity/interface";
import type { ReasoningResult } from "../../spark/core/reasoning/interface";
import type { Plan } from "../../spark/core/planning/interface";
import type { MemoryKind, MemoryRecord } from "../../spark/memory/interface";
import type { SearchResult } from "../../spark/intelligence/search/interface";
import type {
  WritingResult,
  WritingTone,
} from "../../spark/intelligence/writing/interface";

export interface BudSparkPort {
  identity: {
    createContext(input: {
      userId: string;
      sessionId: string;
      product: string;
      locale?: string;
      timezone?: string;
    }): IdentityContext;
    getContext(sessionId: string): IdentityContext | undefined;
  };
  memory: {
    remember(input: {
      kind: MemoryKind;
      content: string;
      sessionId?: string;
      userId?: string;
      tags?: string[];
    }): MemoryRecord;
    recall(query: {
      sessionId?: string;
      userId?: string;
      kind?: MemoryKind;
      limit?: number;
    }): MemoryRecord[];
  };
  search: {
    search(query: string, limit?: number): Promise<SearchResult[]>;
  };
  reasoning: {
    analyze(input: {
      question: string;
      facts?: string[];
    }): Promise<ReasoningResult>;
  };
  planning: {
    createPlan(goal: string, taskTitles: string[]): Plan;
  };
  writing: {
    draft(input: {
      prompt: string;
      tone?: WritingTone;
      maxLength?: number;
    }): Promise<WritingResult>;
  };
}
