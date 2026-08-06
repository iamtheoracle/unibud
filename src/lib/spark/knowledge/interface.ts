export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  addedAt: string;
}

export interface KnowledgeQueryResult {
  document: KnowledgeDocument;
  score: number;
}

export interface KnowledgeService {
  addDocument(input: {
    title: string;
    content: string;
    tags?: string[];
  }): KnowledgeDocument;
  getDocument(id: string): KnowledgeDocument | undefined;
  removeDocument(id: string): boolean;
  /** Simple relevance query. Real embeddings can replace scoring later. */
  query(text: string, limit?: number): KnowledgeQueryResult[];
  size(): number;
}
