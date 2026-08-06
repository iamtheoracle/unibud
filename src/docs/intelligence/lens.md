# Lens — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Internal
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `lens` |
| Name | Lens |
| Layer | Intelligence Layer (Internal) |
| Status | Active |

---

## Purpose

The universal search intelligence of the platform.

---

## Mission

Find anything on the platform or the web — instantly, intelligently, and across every surface — then return structured results to Spark.

---

## Vision

No student ever fails to find what they are looking for on UNIBUD.

---

## Primary Responsibility

Universal search across all platform surfaces and the web.

---

## Responsibilities

1. Search the platform (communities, courses, library, files, notes)
2. Search media (videos, podcasts, images, documents)
3. Search people (students, mentors, faculty)
4. Search campus data (events, clubs, buildings)
5. Search knowledge (articles, policies, FAQs)
6. Delegate web search to Oracle
7. Return ranked, structured search results to Spark
8. Support semantic and keyword search modes

---

## Goals

- Return relevant results in under 200ms for platform search
- Support natural-language queries
- Rank results by relevance and student context
- Surface the most useful result first

---

## Search Scopes

| Scope | Description |
|---|---|
| `all` | All platform surfaces + web |
| `platform` | All platform surfaces only |
| `web` | Web search via Oracle |
| `communities` | Campus communities |
| `courses` | Course catalogue |
| `library` | Documents, notes, resources |
| `people` | Students, faculty, mentors |
| `media` | Videos, podcasts, images |
| `campus` | Events, clubs, buildings |
| `knowledge` | Policies, FAQs, documentation |

---

## Inputs

| Input | Description |
|---|---|
| Search query from Spark | Text query + filters + scope |
| Student context | Current screen and recent activity |
| Search scope | Determines which surfaces to search |

---

## Outputs

| Output | Description |
|---|---|
| Ranked results | Titles, snippets, and deep links |
| Entity results | Typed results (course, person, community, etc.) |
| Search metadata | Total count, query interpretation |

---

## Workflow

```
1. Receive search request from Spark via `lens:search` event
             ↓
2. Parse query → extract intent, filters, and scope
             ↓
3. Execute platform search in parallel with web search (if scoped)
             ↓
4. Rank results by relevance + student context
             ↓
5. Return structured results via `lens:results` event
```

---

## Dependencies

| Intelligence | Reason |
|---|---|
| Oracle | Web search is always delegated to Oracle |

---

## Consumers

| Intelligence | Reason |
|---|---|
| Spark | Receives search results for response assembly |

---

## Events

| Event | Direction | Description |
|---|---|---|
| `lens:search` | Subscribes | Receives search request from Spark |
| `lens:results` | Publishes | Returns ranked results to Spark |

---

## API Contracts

### `search(request)`

```typescript
search(request: LensSearchRequest): Promise<LensSearchResult>

interface LensSearchRequest {
  query: string;
  scope?: LensScope;
  filters?: LensFilters;
  limit?: number;
  userId?: string;
}
```

### `suggest(prefix)`

```typescript
suggest(prefix: string): Promise<string[]>
```

---

## Data Contracts

### `LensSearchResult`
```typescript
{
  query: string;
  results: LensResult[];
  totalCount: number;
  interpretedAs?: string;
  durationMs: number;
}
```

### `LensResult`
```typescript
{
  id: string;
  type: LensResultType;
  title: string;
  snippet: string;
  imageUrl?: string;
  deepLink: string;
  score: number;  // 0–1
  source: "platform" | "web";
}
```

---

## Failure Behaviour

If platform search fails, attempt cached index. If Oracle (web search) is unreachable, return platform-only results with a note.

## Fallback Strategy

Return keyword-matched results from local index when semantic search is unavailable. Never return empty results without a helpful message.

---

## Metrics

| Metric | Description |
|---|---|
| `search_latency_p50` | Median search response time |
| `search_latency_p95` | 95th percentile search time |
| `result_click_through_rate` | % of results clicked |
| `zero_result_rate` | % of queries returning zero results |
| `query_parse_accuracy` | % of queries parsed with correct intent |
| `semantic_vs_keyword_ratio` | Balance of semantic vs keyword searches |

---

## Future Expansion

- Visual search (search by image)
- Voice search
- Search within documents and PDFs
- Cross-campus search federation
- Search history and saved searches
