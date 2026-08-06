# Oracle — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Internal
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `oracle` |
| Name | Oracle |
| Layer | Intelligence Layer (Internal) |
| Status | Active |

---

## Purpose

The research and knowledge discovery engine of the platform.

---

## Mission

Research any topic, discover knowledge from academic and web sources, verify facts, and return structured research to Spark — never directly to students.

---

## Vision

Every student benefits from deep, verified, well-sourced information without ever having to leave the platform or question accuracy.

---

## Primary Responsibility

Research, knowledge discovery, verification, academic sources, web knowledge, and fact validation.

---

## Responsibilities

1. Conduct deep research on any topic
2. Discover knowledge from academic sources
3. Retrieve and validate web knowledge
4. Perform fact verification
5. Return structured research objects to Spark
6. **Never** communicate research directly to students
7. Cite all sources accurately

---

## Goals

- Provide the most accurate and well-sourced information available
- Validate claims before returning them to Spark
- Cover academic, professional, and general knowledge domains
- Minimise hallucination through structured retrieval

---

## Inputs

| Input | Description |
|---|---|
| Research request from Spark | Topic, depth, source preferences |
| Fact-check request from Spark | Claim to verify |
| Lens web search delegation | Search queries from Lens |

---

## Outputs

| Output | Description |
|---|---|
| Structured research object | Findings, sources, confidence score |
| Fact-check result | Verdict (verified/refuted/uncertain) + evidence |
| Source citations | Author, title, URL, date, type |

---

## Workflow

```
1. Receive research request from Spark via `oracle:research` event
             ↓
2. Classify request type (general, academic, factual)
             ↓
3. Query appropriate knowledge sources in parallel
             ↓
4. Validate findings against multiple sources
             ↓
5. Assemble structured research object
             ↓
6. Return to Spark via `oracle:result` event
```

---

## Dependencies

None. Oracle queries external sources directly.

---

## Consumers

| Intelligence | Reason |
|---|---|
| Spark | Receives structured research for response assembly |
| Lens | Delegates web search requests to Oracle |

---

## Events

| Event | Direction | Description |
|---|---|---|
| `oracle:research` | Subscribes | Receives research request from Spark |
| `oracle:result` | Publishes | Returns structured research to Spark |
| `oracle:fact_check` | Subscribes | Receives fact-check request from Spark |
| `oracle:fact_checked` | Publishes | Returns fact-check verdict to Spark |

---

## API Contracts

### `research(request)`

```typescript
research(request: OracleResearchRequest): Promise<OracleResearchResult>

interface OracleResearchRequest {
  topic: string;
  depth?: "shallow" | "deep";
  preferredSources?: Array<"academic" | "web" | "campus">;
  context?: string;
}
```

### `factCheck(request)`

```typescript
factCheck(request: OracleFactCheckRequest): Promise<OracleFactCheckResult>

interface OracleFactCheckRequest {
  claim: string;
  context?: string;
}
```

---

## Data Contracts

### `OracleResearchResult`
```typescript
{
  topic: string;
  findings: string[];
  sources: OracleSource[];
  confidence: number;   // 0–1
  timestamp: string;
  stale?: boolean;
}
```

### `OracleFactCheckResult`
```typescript
{
  claim: string;
  verdict: "verified" | "refuted" | "uncertain";
  evidence: string[];
  confidence: number;   // 0–1
}
```

### `OracleSource`
```typescript
{
  title: string;
  url?: string;
  author?: string;
  date?: string;
  type: "academic" | "web" | "campus";
}
```

---

## Failure Behaviour

If a knowledge source is unreachable, Oracle attempts remaining sources. If all sources fail, Oracle returns an empty result with `confidence: 0`.

## Fallback Strategy

Return cached research from the last successful query on the same topic. Flag stale results clearly in the response object.

---

## Metrics

| Metric | Description |
|---|---|
| `research_latency_p50` | Median research response time |
| `research_latency_p95` | 95th percentile research time |
| `source_retrieval_success_rate` | % of source queries that succeeded |
| `fact_check_accuracy` | % of fact-checks verified by independent validation |
| `citation_completeness_rate` | % of findings that include full citations |
| `confidence_score_distribution` | Distribution of confidence values |

---

## Future Expansion

- Real-time academic database integration
- Peer-reviewed paper summarisation
- Research graph construction
- Cross-domain knowledge synthesis
- Automated bibliography generation
