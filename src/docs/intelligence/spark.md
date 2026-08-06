# Spark — Intelligence Documentation

**Version:** 1.0.0
**Layer:** Intelligence Layer — Internal
**Owner:** Platform Core Team

---

## Identity

| Field | Value |
|---|---|
| ID | `spark` |
| Name | Spark |
| Layer | Intelligence Layer (Internal) |
| Status | Active |

---

## Purpose

The internal cognitive engine of the platform.

---

## Mission

Organise knowledge, reason over context, plan multi-step tasks, orchestrate memory, normalise data, and assemble responses — entirely behind the scenes.

---

## Vision

A platform where every intelligence operates coherently because Spark maintains the shared understanding of every student, every context, and every interaction.

---

## Primary Responsibility

Knowledge organisation, reasoning, planning, memory orchestration, data normalisation, context preparation, and response assembly.

---

## Responsibilities

1. Receive delegated tasks from Bud
2. Route tasks to appropriate domain agents
3. Execute domain agents in parallel
4. Aggregate and normalise agent outputs
5. Reason over combined outputs
6. Plan multi-step workflows when needed
7. Store and retrieve student memory
8. Prepare context for LLM calls
9. Assemble final responses for Bud
10. **Never** communicate directly with students

---

## Goals

- Make every Bud response contextually accurate
- Maintain coherent long-term student memory
- Reduce redundant LLM calls through intelligent caching
- Ensure all domain knowledge is reachable

---

## Inputs

| Input | Description |
|---|---|
| Delegated request from Bud | Message + context + history |
| Domain agent outputs | Structured analyses from sub-agents |
| Oracle research results | Verified knowledge from Oracle |
| Orbit live intelligence | Real-time updates from Orbit |
| Lens search results | Retrieved items from Lens |
| Artist creation outputs | Visual assets from The Artist |

---

## Outputs

| Output | Description |
|---|---|
| Assembled response text | For Bud to deliver to the student |
| Structured reasoning trace | For observability and debugging |
| Updated memory records | Persisted for future sessions |
| Planning tasks | Multi-step workflow execution |

---

## Workflow

```
1. Receive task from Bud via `bud:request` event
             ↓
2. Classify intent → select domain agents
             ↓
3. Execute domain agents in parallel (max 3)
             ↓
4. Request research from Oracle (if needed)
             ↓
5. Request live data from Orbit (if needed)
             ↓
6. Request search from Lens (if needed)
             ↓
7. Request visuals from Artist (if needed)
             ↓
8. Reason over all gathered outputs
             ↓
9. Assemble final response
             ↓
10. Return via `spark:assemble` event → Bud delivers
             ↓
11. Store interaction in memory
```

---

## Domain Sub-Agents

Spark routes to these internal sub-agents (defined in `src/lib/spark/agents/`):

| Agent | Domain |
|---|---|
| academic | Assignments, projects, research, tutoring, exam prep |
| campus | News, events, clubs, directories, navigation |
| social | Feed, stories, communities, creator support |
| productivity | Calendar, tasks, reminders, scheduling |
| career | CV, internships, scholarships, mentoring |
| marketplace | Buying, selling, services, wallet |
| media | Camera, editing, OCR, AI enhancement |
| search | Semantic search across all platform data |
| knowledge | Policies, FAQs, documentation |
| security | Auth, fraud, spam, moderation |
| developer | Diagnostics, performance, system monitoring |

---

## Dependencies

| Intelligence | Reason |
|---|---|
| Oracle | External research and fact validation |
| Orbit | Live campus and world intelligence |
| Lens | Universal platform and web search |
| Artist | Visual asset creation |

---

## Consumers

| Intelligence | Reason |
|---|---|
| Bud | Receives assembled responses for delivery to students |

---

## Events

| Event | Direction | Description |
|---|---|---|
| `spark:assemble` | Publishes | Assembled response ready for Bud |
| `spark:memory_updated` | Publishes | Memory record written |
| `bud:request` | Subscribes | Receives delegated tasks from Bud |
| `oracle:result` | Subscribes | Receives Oracle research |
| `orbit:pulse` | Subscribes | Receives Orbit live intelligence |
| `lens:results` | Subscribes | Receives Lens search results |
| `artist:asset` | Subscribes | Receives Artist-created assets |

---

## API Contracts

### `createSpark(config?)`

```typescript
createSpark(config?: SparkConfig): Spark
```

Factory — creates and configures a Spark instance with all sub-services.

---

## Failure Behaviour

If a domain agent fails, Spark continues with remaining agents and notes the gap. If Oracle is unreachable, Spark uses cached knowledge. If Spark itself is unreachable, Bud uses its fallback strategy.

## Fallback Strategy

Degrade gracefully: skip failed agents, use cached memory, return best available response.

---

## Metrics

| Metric | Description |
|---|---|
| `agent_execution_latency_p50` | Median domain agent response time |
| `agent_execution_latency_p95` | 95th percentile agent response time |
| `parallel_agent_throughput` | Agents executed per second |
| `memory_write_rate` | Memory records written per minute |
| `memory_read_hit_rate` | % of memory reads that found relevant data |
| `reasoning_confidence_avg` | Average reasoning confidence score |
| `assembly_success_rate` | % of assemblies that produced a complete response |

---

## Future Expansion

- Cross-student anonymised learning patterns
- Predictive context pre-loading
- Autonomous background reasoning tasks
- Multi-turn planning with checkpoints
- Real-time personalisation signals
