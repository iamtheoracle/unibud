# Bud — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Core Experiences
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `bud` |
| Name | Bud |
| Layer | Core Experiences (Visible) |
| Status | Active |

---

## Purpose

The only visible AI companion every student interacts with.

---

## Mission

Deliver warm, natural, intelligent conversations that help students learn, navigate, and grow — by orchestrating all other intelligences invisibly.

---

## Vision

Every student has a knowledgeable companion who knows their goals, their campus, and their needs — and always responds as one coherent voice.

---

## Primary Responsibility

Communication, teaching, guidance, and coaching.

---

## Responsibilities

1. Receive all student messages and requests
2. Understand student intent
3. Delegate work to appropriate intelligences
4. Combine results from all intelligences
5. Deliver a single, natural, coherent response
6. Maintain conversational context and memory
7. Coach, guide, and encourage students
8. Never expose internal intelligence names or processes

---

## Goals

- Be the sole conversational interface for students
- Reduce student friction to zero
- Ensure every response feels personal and contextual
- Maintain trust through accuracy and honesty

---

## Inputs

| Input | Description |
|---|---|
| Student message | Text or voice from the student |
| Screen context | Current page, entities visible |
| Conversation history | Prior turns in this session |
| Session metadata | User ID, session ID, timestamps |

---

## Outputs

| Output | Description |
|---|---|
| Unified response | Single natural-language reply |
| Suggested actions | Follow-up actions for the student |
| Proactive nudges | Unprompted helpful reminders and briefings |

---

## Workflow

```
1. Receive student message
          ↓
2. Understand intent via Spark
          ↓
3. Delegate to Oracle / Orbit / Lens / Artist as needed
          ↓
4. Spark assembles combined response
          ↓
5. Bud delivers response in its voice
          ↓
6. Bud stores interaction in memory via Spark
```

---

## Dependencies

| Intelligence | Reason |
|---|---|
| Spark | All cognitive work is delegated here |

---

## Consumers

None. Bud is the terminal output layer — it talks to students, not to other intelligences.

---

## Ownership

**Owner:** Platform Core Team

**Who calls Bud:** Students (directly), PlatformCore (proactive)

**Who depends on Bud:** No intelligence depends on Bud for work — Bud is the output layer.

---

## Permissions

- `read:conversation_history`
- `write:conversation_history`
- `invoke:spark`
- `invoke:notifications`

---

## Restrictions

- Must **never** perform research directly
- Must **never** generate recommendations directly
- Must **never** run search directly
- Must **never** expose internal agent names to students
- Must route all substantive work through Spark

---

## Events

| Event | Direction | Description |
|---|---|---|
| `bud:request` | Publishes | Bud delegates a task to the intelligence layer |
| `bud:response_delivered` | Publishes | Bud has delivered a response to the student |
| `spark:assemble` | Subscribes | Bud receives Spark-assembled responses for delivery |

---

## API Contracts

### `respond(message, session)`

```typescript
respond(message: string, session: BudSession): Promise<BudResponse>
```

Main entry point. Accepts student message, returns Bud's response.

### `transcript(sessionId, limit?)`

```typescript
transcript(sessionId: string, limit?: number): ConversationTurn[]
```

Returns conversation history for a session.

---

## Data Contracts

### `BudSession`
```typescript
{
  userId: string;
  sessionId: string;
  screenContext: { name: string; description?: string };
}
```

### `BudResponse`
```typescript
{
  message: string;
  sessionId: string;
  trace: {
    memoryHits: number;
    knowledgeHits: number;
    reasoningConfidence: number;
    plannedTaskCount: number;
    provider: string;
  };
}
```

---

## Failure Behaviour

If Spark is unavailable, Bud responds with a warm acknowledgment and queues the request. If the queue exceeds 30 seconds, Bud informs the student of a temporary issue.

## Fallback Strategy

Use cached context and last known memory to provide a best-effort response. Never fabricate information. Acknowledge limitations honestly.

---

## Metrics

| Metric | Description |
|---|---|
| `response_latency_p50` | Median response time |
| `response_latency_p95` | 95th percentile response time |
| `delegation_success_rate` | % of delegations completed successfully |
| `conversation_satisfaction_score` | Student-rated satisfaction |
| `memory_hit_rate` | % of requests that benefited from memory |
| `proactive_nudge_engagement_rate` | % of proactive nudges acted on |

---

## Future Expansion

- Voice-native conversation mode
- Multi-modal input (images, documents)
- Proactive life-event detection
- Peer learning facilitation
- Emotional intelligence signals
