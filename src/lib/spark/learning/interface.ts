export interface FeedbackEntry {
  id: string;
  subject: string;
  rating: "positive" | "negative" | "neutral";
  note?: string;
  createdAt: string;
}

export interface LearningService {
  recordFeedback(input: {
    subject: string;
    rating: "positive" | "negative" | "neutral";
    note?: string;
  }): FeedbackEntry;
  getFeedback(subject: string): FeedbackEntry[];
  /** Simple aggregate score in [-1, 1] based on recorded feedback. */
  score(subject: string): number;
}
