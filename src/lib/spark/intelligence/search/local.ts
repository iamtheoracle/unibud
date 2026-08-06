import type { SearchService, SearchResult } from "./interface";
import type { KnowledgeService } from "../../knowledge/interface";

/**
 * Search is a thin, focused layer over Knowledge retrieval. It depends
 * on the KnowledgeService abstraction rather than reaching into Memory
 * directly, keeping the dependency graph shallow: Search -> Knowledge.
 */
export class LocalSearchService implements SearchService {
  constructor(private readonly knowledge: KnowledgeService) {}

  async search(query: string, limit = 5): Promise<SearchResult[]> {
    const matches = this.knowledge.query(query, limit);
    return matches.map((m) => ({
      id: m.document.id,
      title: m.document.title,
      snippet: m.document.content.slice(0, 160),
      score: m.score,
    }));
  }
}
