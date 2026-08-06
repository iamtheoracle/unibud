export type MemoryKind =
  | "short_term"
  | "long_term"
  | "semantic"
  | "episodic"
  | "workspace";

export interface MemoryRecord {
  id: string;
  kind: MemoryKind;
  sessionId?: string;
  userId?: string;
  content: string;
  tags?: string[];
  createdAt: string;
  /**
   * Monotonically increasing insertion order. `createdAt` alone is not a
   * reliable sort key — multiple records can share the same millisecond
   * timestamp. `recall()` implementations must use `sequence` as the
   * tiebreaker so "newest first" holds even for same-millisecond writes.
   */
  sequence: number;
}

export interface MemoryQuery {
  kind?: MemoryKind;
  sessionId?: string;
  userId?: string;
  tag?: string;
  text?: string;
  limit?: number;
}

export interface MemoryService {
  remember(input: {
    kind: MemoryKind;
    content: string;
    sessionId?: string;
    userId?: string;
    tags?: string[];
  }): MemoryRecord;
  recall(query: MemoryQuery): MemoryRecord[];
  forget(id: string): boolean;
  clearSession(sessionId: string): number;
  size(): number;
}
