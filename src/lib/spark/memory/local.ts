import type { MemoryKind, MemoryQuery, MemoryRecord, MemoryService } from "./interface";

/**
 * In-memory implementation covering short-term, long-term, semantic,
 * episodic and workspace memory kinds through a single flat store with
 * a `kind` discriminator. No persistence, no network calls.
 */
export class InMemoryMemoryService implements MemoryService {
  private records = new Map<string, MemoryRecord>();
  private counter = 0;

  remember(input: {
    kind: MemoryKind;
    content: string;
    sessionId?: string;
    userId?: string;
    tags?: string[];
  }): MemoryRecord {
    const sequence = ++this.counter;
    const record: MemoryRecord = {
      id: `mem_${sequence}_${Date.now()}`,
      kind: input.kind,
      sessionId: input.sessionId,
      userId: input.userId,
      content: input.content,
      tags: input.tags ?? [],
      createdAt: new Date().toISOString(),
      sequence,
    };
    this.records.set(record.id, record);
    return record;
  }

  recall(query: MemoryQuery): MemoryRecord[] {
    let results = Array.from(this.records.values());
    if (query.kind) results = results.filter((r) => r.kind === query.kind);
    if (query.sessionId)
      results = results.filter((r) => r.sessionId === query.sessionId);
    if (query.userId) results = results.filter((r) => r.userId === query.userId);
    if (query.tag)
      results = results.filter((r) => (r.tags ?? []).includes(query.tag!));
    if (query.text) {
      const needle = query.text.toLowerCase();
      results = results.filter((r) => r.content.toLowerCase().includes(needle));
    }
    results.sort((a, b) => {
      const timeDiff =
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return timeDiff !== 0 ? timeDiff : b.sequence - a.sequence;
    });
    return query.limit ? results.slice(0, query.limit) : results;
  }

  forget(id: string): boolean {
    return this.records.delete(id);
  }

  clearSession(sessionId: string): number {
    let cleared = 0;
    for (const [id, record] of this.records) {
      if (record.sessionId === sessionId) {
        this.records.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  size(): number {
    return this.records.size;
  }
}
