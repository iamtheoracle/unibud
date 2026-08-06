/**
 * Platform Services — Moderation Service Interface
 *
 * The Moderation Service reviews user-generated content, media, and
 * communications for policy violations before they are published or
 * delivered.
 */

export type ModerationCategory =
  | "hate_speech"
  | "harassment"
  | "violence"
  | "spam"
  | "misinformation"
  | "explicit_content"
  | "self_harm"
  | "terrorism"
  | "copyright";

export interface ModerationFlag {
  category: ModerationCategory;
  confidence: number;
  excerpt?: string;
}

export interface ModerationResult {
  safe: boolean;
  flags: ModerationFlag[];
  /** Human-readable summary when content is flagged */
  reason?: string;
}

export interface ModerationService {
  /** Moderate a text string (post, comment, message, bio, etc.) */
  moderateText(text: string): Promise<ModerationResult>;

  /** Moderate a media URL (image, video) */
  moderateMedia(url: string, type: "image" | "video"): Promise<ModerationResult>;
}
