export type WritingTone = "neutral" | "formal" | "casual" | "concise";

export interface WritingRequest {
  prompt: string;
  tone?: WritingTone;
  maxLength?: number;
}

export interface WritingResult {
  text: string;
  tone: WritingTone;
  provider: string;
}

export interface WritingService {
  draft(request: WritingRequest): Promise<WritingResult>;
}
