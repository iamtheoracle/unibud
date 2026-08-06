import type {
  KnowledgeDocument,
  KnowledgeQueryResult,
  KnowledgeService,
} from "./interface";

/**
 * In-memory knowledge store with naive keyword-overlap scoring. This
 * stands in for a knowledge graph / embeddings-backed retrieval system;
 * the KnowledgeService interface is stable so a real backend can be
 * swapped in without changing consumers.
 */
export class LocalKnowledgeService implements KnowledgeService {
  private documents = new Map<string, KnowledgeDocument>();
  private counter = 0;

  addDocument(input: {
    title: string;
    content: string;
    tags?: string[];
  }): KnowledgeDocument {
    const doc: KnowledgeDocument = {
      id: `doc_${++this.counter}_${Date.now()}`,
      title: input.title,
      content: input.content,
      tags: input.tags ?? [],
      addedAt: new Date().toISOString(),
    };
    this.documents.set(doc.id, doc);
    return doc;
  }

  getDocument(id: string): KnowledgeDocument | undefined {
    return this.documents.get(id);
  }

  removeDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  query(text: string, limit = 5): KnowledgeQueryResult[] {
    const queryWords = new Set(
      text.toLowerCase().split(/\W+/).filter(Boolean)
    );
    const scored: KnowledgeQueryResult[] = Array.from(
      this.documents.values()
    ).map((document) => {
      const docWords = `${document.title} ${document.content}`
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean);
      const overlap = docWords.filter((w) => queryWords.has(w)).length;
      const score = docWords.length ? overlap / docWords.length : 0;
      return { document, score };
    });
    return scored
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  size(): number {
    return this.documents.size;
  }
}
