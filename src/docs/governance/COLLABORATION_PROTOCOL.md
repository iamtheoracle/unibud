# UNIBUD AI Collaboration & Workflow Protocol

**Version:** 1.0
**Applies To:** Every intelligence in the ecosystem.

---

## Golden Rule

Every intelligence owns ONE responsibility.

Never duplicate another intelligence.

Never bypass another intelligence.

Collaborate.

---

## Primary Owners

| Owner | What It Owns |
|---|---|
| Bud | Communication and student experience |
| Spark | Orchestration and execution |
| Oracle | Research and knowledge |
| Orbit | Monitoring and live intelligence |
| Lens | Search and retrieval |
| Artist | Visual generation |
| Square | Discovery |
| Quad | Campus experience |
| Social AI | Campus social life |
| Academics AI | Academic life |
| Connect | Relationships |
| Me | Identity |
| Recommendation AI | Personalisation |
| Moderation AI | Trust and safety |
| Security AI | Protection |
| Analytics AI | Measurements |

---

## Request Pipeline

Every request follows exactly this order:

```
1.  Student
2.  Bud receives request
3.  Spark analyses request
4.  Spark determines required intelligences
5.  Spark dispatches tasks
6.  Intelligences execute simultaneously
7.  Results return to Spark
8.  Spark validates
9.  Recommendation personalises
10. Artist creates visuals if necessary
11. Bud explains naturally
12. Analytics records interaction
13. Learning systems improve
```

---

## Collaboration Examples

### Example 1 — Exam Tomorrow

```
Student: "I have a chemistry exam tomorrow."

Bud
  ↓
Spark
  ↓
Academics AI → retrieves course content
Assignment AI → checks deadlines and submissions
Quiz AI → generates practice questions
Oracle → researches topic knowledge
Lens → finds relevant library resources
Artist → creates visual diagrams
Recommendation AI → personalises study materials
  ↓
Bud explains: study plan + practice quiz + diagrams + revision notes
```

### Example 2 — Lecture Notes Uploaded

```
Camera AI → extracts text via OCR
  ↓
Lens → indexes extracted content
  ↓
Library AI → stores resource
  ↓
Learning AI → analyses knowledge gaps
  ↓
Quiz AI → creates practice questions
  ↓
Artist → creates summary diagrams
  ↓
Bud → teaches from the notes
```

### Example 3 — Finding Friends

```
Student: "Help me find study partners."

Connect
  ↓
Recommendation AI → matches by courses, interests, campus
Community AI → suggests relevant communities
Campus AI → finds nearby study spaces
Social AI → shows active campus students
  ↓
Bud → introduces recommendations naturally
```

### Example 4 — Scholarship Discovery

```
Student: "Are there any scholarships for me?"

Bud
  ↓
Scholarship AI → matches by profile, GPA, interests
Oracle → researches eligibility criteria
Orbit → checks for new scholarship announcements
Recommendation AI → ranks by fit score
Notification AI → schedules deadline reminders
  ↓
Bud → presents matched scholarships
```

### Example 5 — Code Review

```
Student uploads code.

Bud → understands request
  ↓
Architect → analyses code quality, architecture, security
Oracle → researches relevant documentation
Lens → searches project for related patterns
Spark → prepares implementation plan
Artist → creates architecture diagrams if useful
  ↓
Bud → explains changes and improvements
```

---

## Parallel Execution

Whenever possible, execute independent tasks simultaneously.

Do not wait for unrelated operations.

Merge validated outputs before responding.

---

## Event System

Every intelligence publishes meaningful events.

Events are defined and typed in `src/lib/intelligence/bus.ts`.

| Event | Publisher | Consumers |
|---|---|---|
| `bud:request` | Bud | Spark |
| `spark:assemble` | Spark | Bud |
| `oracle:research` | Spark | Oracle |
| `oracle:result` | Oracle | Spark |
| `orbit:pulse` | Orbit | Spark, Square |
| `lens:search` | Spark | Lens |
| `lens:results` | Lens | Spark |
| `artist:create` | Spark/Bud | Artist |
| `artist:asset` | Artist | Spark/Bud |
| `<specialist>:query` | Spark | Specialist |
| `<specialist>:result` | Specialist | Spark |
| `platform:assignment_created` | Assignment AI | Analytics, Notification, Gamification |
| `platform:course_completed` | Academics AI | Gamification, Recommendation |
| `platform:community_joined` | Community AI | Social AI, Recommendation |
| `platform:scholarship_discovered` | Scholarship AI | Notification AI |

---

## Communication Structure

Every request between intelligences must carry:

| Field | Description |
|---|---|
| `requestId` | Unique trace identifier |
| `domain` | Owning intelligence |
| `query` | The task or question |
| `context` | Relevant student/screen context |
| `userId` | Student identifier (when permission exists) |
| `sessionId` | Conversation session |

---

## Failure Protocol

| Failure | Response |
|---|---|
| Oracle fails | Lens continues; use cached knowledge |
| Lens fails | Oracle continues; return platform-only results |
| Artist fails | Bud explains with text; Asset delivered asynchronously |
| Orbit fails | Use cached intelligence; retry with backoff |
| Specialist fails | Spark continues with remaining specialists |
| Spark fails | Bud acknowledges and queues request |

**Never break the student experience.**

---

## Memory Sharing

Memory access is permission-based.

| Intelligence | Accessible Memory Scopes |
|---|---|
| Bud | session, long_term, learning, academic, campus, community |
| Spark | session, long_term, learning, academic, campus, community, creator, recommendation, search |
| Oracle | session |
| Orbit | session, campus, community |
| Lens | session, search |
| Artist | session |
| Specialists | session + their domain scope only |

---

## Quality Checklist

Before responding, every intelligence asks:

- [ ] Is this accurate?
- [ ] Is this personalised?
- [ ] Is this secure?
- [ ] Is this understandable?
- [ ] Can another intelligence improve it?

---

## Success Metrics

Every intelligence is measured by:

- Accuracy
- Reliability
- Speed
- Security
- Student satisfaction
- Task completion
- Quality
- Collaboration effectiveness
- Maintainability
- Scalability

**No intelligence succeeds alone. The ecosystem succeeds together.**
