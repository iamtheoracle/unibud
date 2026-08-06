export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
}

export interface SearchService {
  search(query: string, limit?: number): Promise<SearchResult[]>;
}
