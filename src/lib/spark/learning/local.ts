import type { FeedbackEntry, LearningService } from "./interface";

const RATING_WEIGHT: Record<FeedbackEntry["rating"], number> = {
  positive: 1,
  neutral: 0,
  negative: -1,
};

/**
 * In-memory feedback store with a simple aggregate scoring function.
 * This is the seed of continuous improvement / adaptive personalization —
 * it does not train any model, it just tracks signal for later use.
 */
export class LocalLearningService implements LearningService {
  private feedback: FeedbackEntry[] = [];
  private counter = 0;

  recordFeedback(input: {
    subject: string;
    rating: FeedbackEntry["rating"];
    note?: string;
  }): FeedbackEntry {
    const entry: FeedbackEntry = {
      id: `fb_${++this.counter}_${Date.now()}`,
      subject: input.subject,
      rating: input.rating,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    this.feedback.push(entry);
    return entry;
  }

  getFeedback(subject: string): FeedbackEntry[] {
    return this.feedback.filter((f) => f.subject === subject);
  }

  score(subject: string): number {
    const entries = this.getFeedback(subject);
    if (!entries.length) return 0;
    const total = entries.reduce((sum, e) => sum + RATING_WEIGHT[e.rating], 0);
    return total / entries.length;
  }
}
