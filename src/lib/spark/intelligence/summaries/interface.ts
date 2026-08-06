export interface SummaryRequest {
  text: string;
  maxSentences?: number;
}

export interface SummaryResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

export interface SummariesService {
  summarize(request: SummaryRequest): SummaryResult;
}
