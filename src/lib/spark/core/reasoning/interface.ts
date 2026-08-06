export interface ReasoningInput {
  question: string;
  facts?: string[];
  context?: Record<string, unknown>;
}

export interface ReasoningStep {
  step: number;
  description: string;
}

export interface ReasoningResult {
  answer: string;
  confidence: number; // 0..1
  steps: ReasoningStep[];
  usedProvider: string;
}

export interface ReasoningService {
  /** Analyze input and produce a decision/answer with explainable steps. */
  analyze(input: ReasoningInput): Promise<ReasoningResult>;
}
