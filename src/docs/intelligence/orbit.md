# Orbit — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Internal
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `orbit` |
| Name | Orbit |
| Layer | Intelligence Layer (Internal) |
| Status | Active |

---

## Purpose

The live intelligence and monitoring engine of the platform.

---

## Mission

Continuously monitor campus updates, education news, technology trends, scholarships, competitions, research, AI, global news, and trending topics — and return live intelligence to Spark and platform products.

---

## Vision

Students are always aware of what matters to them, in real time, without having to search or browse — because Orbit watches the world for them.

---

## Primary Responsibility

Continuous monitoring of campus, education, technology, scholarships, competitions, research, AI, global news, and trending topics.

---

## Responsibilities

1. Monitor campus announcement feeds
2. Track education and scholarship opportunities
3. Monitor technology and AI news
4. Track global news and trending topics
5. Aggregate and normalise live intelligence
6. Push live updates to Spark and Square
7. Maintain category-filtered intelligence streams
8. Surface time-sensitive alerts

---

## Goals

- Keep students informed without requiring active searching
- Deliver relevant intelligence to each product in real time
- Filter noise and surface what matters
- Support scholarship and competition discovery

---

## Intelligence Categories

| Category | Description |
|---|---|
| `campus` | University announcements, events, alerts |
| `education` | Education news and policy |
| `technology` | Tech news and product launches |
| `scholarships` | New scholarship opportunities |
| `competitions` | Hackathons, awards, challenges |
| `research` | Academic research publications |
| `ai` | AI and machine learning developments |
| `global_news` | Major world events |
| `trending` | Cross-category trending topics |

---

## Inputs

| Input | Description |
|---|---|
| Category subscriptions | Student and product preferences |
| Campus RSS/API feeds | University announcement sources |
| External news APIs | Global and technology news feeds |
| Trending signals | Platform and web trending data |
| Scholarship databases | Scholarship and competition feeds |

---

## Outputs

| Output | Description |
|---|---|
| Orbit pulse events | Batches of new intelligence items |
| Trending topic lists | Per category, refreshed continuously |
| Time-sensitive alerts | Urgent campus and global events |
| Feed items for Square | Curated items for the discovery feed |

---

## Workflow

```
1. Subscribe to configured intelligence sources on boot
             ↓
2. Poll or stream new content at configured intervals
             ↓
3. Normalise content to OrbitItem schema
             ↓
4. Classify content by category
             ↓
5. Filter duplicates and low-quality content
             ↓
6. Publish `orbit:pulse` event for each batch of new items
             ↓
7. Maintain rolling cache of recent items per category
```

---

## Dependencies

None. Orbit pulls from external sources directly.

---

## Consumers

| Intelligence / Product | Reason |
|---|---|
| Spark | Receives live intelligence for response assembly |
| Square | Powers the discovery feed, trending, and news sections |

---

## Events

| Event | Direction | Description |
|---|---|---|
| `orbit:pulse` | Publishes | New live intelligence items available |
| `orbit:alert` | Publishes | Time-sensitive campus or global alert |
| `orbit:subscribe` | Subscribes | Category subscription request from Spark or Square |

---

## API Contracts

### `getLatest(categories, limit?)`

```typescript
getLatest(categories: OrbitCategory[], limit?: number): Promise<OrbitItem[]>
```

### `getTrending(category?)`

```typescript
getTrending(category?: OrbitCategory): Promise<OrbitTrendItem[]>
```

### `subscribe(categories, callback)`

```typescript
subscribe(
  categories: OrbitCategory[],
  callback: (items: OrbitItem[]) => void
): () => void // unsubscribe
```

---

## Data Contracts

### `OrbitItem`
```typescript
{
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl?: string;
  category: OrbitCategory;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  stale?: boolean;
}
```

---

## Failure Behaviour

If a source is unreachable, Orbit continues monitoring remaining sources. If all sources fail, Orbit returns cached items with a staleness flag.

## Fallback Strategy

Serve cached items from the last successful fetch. Clearly mark items as potentially stale. Retry failed sources with exponential backoff.

---

## Metrics

| Metric | Description |
|---|---|
| `items_processed_per_minute` | Processing throughput |
| `source_availability_rate` | % of sources currently reachable |
| `category_freshness_p50` | Median age of cached items per category |
| `alert_delivery_latency` | Time from alert event to publication |
| `duplicate_filter_rate` | % of items filtered as duplicates |
| `subscriber_count_per_category` | Active subscribers per category |

---

## Future Expansion

- University-specific feed integrations
- Student-personalised intelligence streams
- Sentiment analysis on campus news
- Predictive event detection
- Competition deadline tracking
