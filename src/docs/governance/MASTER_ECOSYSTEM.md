# UNIBUD Master AI Ecosystem — Governance Document

**Version:** 1.0
**Priority:** Highest
**Applies To:** Every intelligence, navigation, product, service, workflow, API, database, and infrastructure component.

---

## The Four Intelligence Layers

### Layer 1 — Core Super Agents

| Intelligence | Emoji | Primary Responsibility |
|---|---|---|
| Bud | 🌱 | Student companion and sole visible AI |
| Spark | ⚡ | Intelligence coordinator and orchestrator |
| Oracle | 🔮 | Research, knowledge discovery, fact validation |
| Orbit | 🛰 | Continuous live intelligence monitoring |
| Lens | 🔎 | Universal search and intelligent retrieval |
| The Artist | 🎨 | Visual and creative asset generation |

### Layer 2 — Navigation Intelligence

| Intelligence | Emoji | Primary Responsibility |
|---|---|---|
| Square | ⬛ | Discovery — feed, stories, videos, podcasts, trending |
| Quad | ◼ | Campus experience — social and academics |
| Social AI | 👥 | Campus social life, trends, creators, clubs |
| Academics AI | 📚 | Courses, lectures, assignments, study groups |
| Connect | 🤝 | Relationships, messaging, voice, video, mentorship |
| Me | 👤 | Identity, profile, achievements, personalisation |

### Layer 3 — Specialist Intelligence (22 Specialists)

| Intelligence | Emoji | Domain |
|---|---|---|
| Campus AI | 🏫 | Buildings, faculties, schedules, campus services |
| Community AI | 👥 | Communities, clubs, moderation, engagement |
| Marketplace AI | 🛍 | Buying, selling, renting, student commerce |
| Event AI | 🎉 | Events, conferences, workshops, registrations |
| Challenge AI | 🏆 | Competitions, missions, XP, achievements |
| News AI | 📰 | News categorisation, trending, breaking news |
| Podcast AI | 🎙 | Podcast indexing, recommendations, transcripts |
| Movies AI | 🎬 | Film recommendations, educational films |
| Anime AI | 🌸 | Anime recommendations, communities |
| Sports AI | ⚽ | Campus and professional sports, fixtures |
| Library AI | 📚 | Books, papers, notes, academic resources |
| Learning AI | 🧠 | Learning analytics, study optimisation, progress |
| Assignment AI | 📝 | Assignment planning, deadlines, submissions |
| Quiz AI | ❓ | Practice tests, flashcards, exam preparation |
| Career AI | 💼 | Jobs, CV, interviews, career development |
| Scholarship AI | 🎓 | Scholarships, grants, fellowships, funding |
| Creator AI | 🎥 | Creator growth, content strategy, monetisation |
| Camera AI | 📷 | OCR, document scanning, visual understanding |
| Voice AI | 🎙 | Speech recognition, transcription, voice commands |
| Language AI | 🌍 | Translation, grammar, multilingual support |
| Wellness AI | ❤️ | Wellbeing, stress, burnout, mental health support |
| Gamification AI | 🎮 | XP, badges, levels, streaks, leaderboards |

### Layer 4 — Platform Intelligence (8 Services)

| Intelligence | Emoji | Primary Responsibility |
|---|---|---|
| Recommendation AI | ⭐ | Personalisation across all surfaces |
| Moderation AI | 🛡 | Content safety, spam, abuse detection |
| Security AI | 🔒 | Threat detection, fraud prevention, account protection |
| Privacy AI | 🔐 | Permission management, PII protection |
| Analytics AI | 📊 | Platform insights, metrics, ecosystem health |
| Automation AI | ⚙ | Background workflows, scheduled tasks |
| Notification AI | 🔔 | Smart alerts, reminders, important updates |
| Integration AI | 🌐 | University portals, APIs, external services |

### Engineering Intelligence

| Intelligence | Emoji | Primary Responsibility |
|---|---|---|
| Architect | 🏗 | Software architecture and platform engineering |

---

## Core Principles

1. Every responsibility has exactly **one owner**.
2. If two intelligences perform the same responsibility → **merge them**.
3. Every intelligence has a defined mission, inputs, outputs, events, permissions, restrictions, and metrics.
4. No AI exists without **documentation**.
5. Every AI must be **observable** — status, health, latency, errors, events, metrics.

---

## Request Pipeline

```
Student
       ↓
Bud receives request
       ↓
Spark builds execution plan
       ↓
Relevant intelligences execute simultaneously
       ↓
Results return to Spark
       ↓
Spark validates and merges
       ↓
Recommendation AI personalises
       ↓
Artist creates visuals if needed
       ↓
Analytics records interaction
       ↓
Bud explains everything naturally
       ↓
Learning systems improve
```

---

## Digital Twin

Every student has a Digital Twin. It continuously evolves and represents:

- Learning behaviour and style
- Academic progress and courses
- Interests, skills, strengths, weaknesses
- Goals (academic, career, personal)
- Campus life, communities, friends
- Creator activity, marketplace activity
- Achievements, career interests
- Preferences, accessibility, privacy settings

**Every intelligence reads from it. Only Bud, Spark, and Orbit may update it.**

---

## Ownership Rules

- Never call an intelligence that does not own the task.
- Never bypass permissions.
- Never expose internal implementation to students.
- Never duplicate work.
- Always return structured outputs.
- Always log important events.
- Always publish health metrics.

---

## Quality Engineering Standards

Every intelligence must be:

| Standard | Description |
|---|---|
| Reliable | Handles failures gracefully without breaking the ecosystem |
| Observable | Publishes status, health, latency, errors, events, metrics |
| Secure | Never exposes private data or bypasses permissions |
| Modular | Single responsibility, loose coupling |
| Scalable | Designed for growth |
| Reusable | Composable by other intelligences |
| Documented | Complete documentation at `src/docs/intelligence/` |
| Maintainable | Clean, readable, testable code |
| Testable | Unit and integration tests |

---

## Adding a New Intelligence

Before creating any new intelligence, answer:

1. Why does it exist?
2. What unique responsibility does it own?
3. Can an existing intelligence already perform this work?
4. Who will call it?
5. What events will it publish?
6. What events will it subscribe to?
7. What APIs does it expose?
8. How will it be tested?
9. How will it fail?
10. How will it recover?

**If these questions cannot be answered — do not create the intelligence.**

---

## Implementation References

| File | Purpose |
|---|---|
| `src/lib/intelligence/registry.ts` | Core intelligence definitions (Bud, Spark, Oracle, Orbit, Lens, Artist) |
| `src/lib/intelligence/specialist/registry.ts` | All 22 specialist + Architect definitions |
| `src/lib/intelligence/constitution.ts` | Ecosystem constitution TypeScript module |
| `src/lib/intelligence/bus.ts` | Intelligence event bus (all events) |
| `src/lib/platform/index.ts` | Platform services unified export |
| `src/lib/platform/infrastructure/index.ts` | Infrastructure interface catalogue |
| `src/pages/admin/IntelligenceCenter.jsx` | Admin Intelligence Center dashboard |
| `src/docs/intelligence/` | Per-intelligence documentation |
| `src/docs/governance/` | Governance documents (this file) |
