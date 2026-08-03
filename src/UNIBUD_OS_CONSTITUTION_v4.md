# UNIBUD OS Constitution v4 — Final

> **The single source of architectural truth.**
>
> UNIBUD is ONE operating system. Social and Academic are contexts, not
> applications. Workspaces are stable. Contexts reprioritize modules. Navigation
> never changes based on context. Every feature exists once and is reused
> everywhere.

---

## Architecture Overview

```
                    UNIBUD OS
                    Bud
                     │
                  Oracle
                     │
     ┌───────────────┼───────────────┐
     │               │               │
 Governance    Platform Core    Integrations
                     │
             Shared OS Services
                     │
        ┌────────────┼────────────┐
        │            │            │
      Square      Campus      Connect
        │            │            │
       Quad        Lens      Services
                     │
                    Me
```

---

## Layer 1 — Governance (Invisible)

Internal operating authorities. Never user-facing.

| Type | Authorities |
|---|---|
| Human | Founder Authority (Supreme Governance) |
| Root | Oracle (ROOT-0) — Orchestration, Architect (ROOT-1) — Architecture |
| Engineering | Builder, Reviewer, Configurator, Monitor |
| Domain | Scholar, Banker, Community Builder, Creator, Analyst, Sentinel, Integrator, Automator, Scribe |

---

## Layer 2 — Platform Core (Invisible)

### Bud — The Only Visible AI

| Owns | Does Not Own |
|---|---|
| Conversation, Planning, Memory, Recommendations, Cross-workspace orchestration | Communities, Navigation, Feeds, Content |

### Orbit — Intelligence Infrastructure

Orbit is NOT navigation. NOT a workspace. NOT another AI.

| Provides | Never |
|---|---|
| Discovery, Community enrichment, Verified information, Trusted public content, University intelligence, Ranking, Recommendation signals, Search indexing support, Real-time updates | Fabricates content |

### Spark — Execution Engine

| Owns | Never Owns |
|---|---|
| Workflow execution, OCR, File processing, Scheduling, Search indexing, Background jobs, Automation, AI pipelines, Semantic search, Caching | UI |

### Shared OS Services

Every workspace reuses these:

Identity · Authentication · Authorization · Permissions · Notifications · Search · Analytics · Recommendation Engine · Media · Storage · Sync · Moderation · Event Bus · Audit

---

## Layer 3 — Integration Layer (Invisible)

All external providers accessed exclusively through the Integrator.

```
Workspace → Platform Service → Integrator → External Provider
```

| Category | Providers |
|---|---|
| Identity | Google, Apple, Microsoft, GitHub, LinkedIn |
| Academic | University SIS, LMS, Google Scholar, ORCID |
| Media | Spotify, Apple Music, YouTube, Audiomack, Boomplay |
| Finance | Banking APIs, Payment Providers |
| Utilities | Maps, Weather, Calendar, OCR, Translation |

**No workspace communicates directly with external APIs.**

---

## Layer 4 — Product Experiences (Visible)

These are the only permanent navigation destinations.

### Square — Social Workspace

| Owns |
|---|
| Feed, Stories, Friends, Communities, Podcasts, Music, Videos, Live, Events, Creators |

### Campus — Academic Workspace

| Owns |
|---|
| Academic feed, Courses, Timetable, Assignments, Notes, Research, Scholarships, Faculty, Departments, Academic communities |

### Quad — Discovery

| Owns | Never |
|---|---|
| Recommendations, Trending, Explore, Opportunities | Owns original content |

### Connect — Communication

| Owns |
|---|
| Messages, Calls, Meetings, Collaboration, Study rooms |

### Lens — Universal Command Center

Lens is NOT just search.

| Owns |
|---|
| Universal Search, Universal Actions, AI Commands, Cross-workspace navigation, Quick Open, Recent activity, Shortcuts |

### Services — Adaptive Service Hub

Services is NOT another app. It intelligently surfaces capabilities based on context.

| Context | Services Surface |
|---|---|
| Morning before class | Timetable, Attendance, Bus routes |
| Exam week | Past questions, Printing, Library, Study rooms |
| Weekend | Events, Marketplace, Food, Housing |
| Graduation | Certificates, Alumni, Jobs |

### Me — Personal Identity

| Owns |
|---|
| Profile, Preferences, Collections, Connected accounts, Activity |

---

## Hidden Product Services

Marketplace and Wallet are NOT in permanent navigation.

### Marketplace

| Owns | Access Through |
|---|---|
| Listings, Housing, Tutors, Campus commerce, Orders | Lens, Services, Contextual recommendations |

### Wallet

| Owns | Access Through |
|---|---|
| Payments, Tuition, Scholarships, Student ID, Tickets, Campus credentials | Lens, Services, Payment workflows, Contextual recommendations |

### Services Tree

```
Services
    ├── Marketplace
    ├── Wallet
    ├── Printing
    ├── Transport
    ├── Housing
    ├── Food
    ├── Healthcare
    ├── Student ID
    └── Campus Utilities
```

---

## Layer 5 — Shared Modules

Implement once. Reuse everywhere.

### Content Modules
Posts · Stories · Podcasts · Live · Videos · Media · Files

### Community Modules
Members · Discussions · Resources · Events · Polls · Calendar · Announcements

A department, club, creator, or class instantiates the same Community module
with different permissions and data.

### Communication Modules
Messages · Calls · Meetings · Whiteboards

### Identity Modules
Student · Educator · Institution · Public Profiles

### Discovery Modules
Search · Notifications · Recommendations

---

## Context Layer (NOT Navigation)

The OS has three contexts. Contexts **do not change navigation**.
They only **reprioritize modules** within workspaces.

### Contexts

| Context | Description |
|---|---|
| **Hybrid** (default) | Balanced view — both academic and social modules at equal priority |
| **Academic** | Academic modules prioritized; social modules deprioritized |
| **Social** | Social modules prioritized; academic modules deprioritized |

### Academic Context — Module Priority

```
Campus
├── Timetable          (high)
├── Assignments        (high)
├── Notes              (high)
├── Research           (high)
└── Scholarships       (high)

Square
├── Academic Communities  (high)
├── Study Feed             (medium)
└── Campus Events          (medium)

(Stories, Live, Music → deprioritized, still accessible)
```

### Social Context — Module Priority

```
Square
├── Feed               (high)
├── Stories            (high)
├── Podcasts           (high)
├── Live               (high)
└── Communities        (high)

Campus
├── Upcoming Classes   (medium)
└── Deadlines          (medium)

(Timetable, Notes, Research → deprioritized, still accessible)
```

### Rules

1. **Nothing is duplicated.**
2. **Nothing disappears.**
3. **Only priority changes.**
4. **Navigation stays stable regardless of context.**

---

## Permanent Navigation

```
Square · Campus · Quad · Connect · Lens · Services · Me
```

### NOT in Navigation

| Excluded | Reason |
|---|---|
| Marketplace | Hidden Service — accessed via Services/Lens |
| Wallet | Hidden Service — accessed via Services/Lens/payment flows |
| Bud | Omnipresent capability — floating button, not a tab |
| Orbit | Infrastructure — invisible |
| Spark | Infrastructure — invisible |

---

## Operating-System Rules

1. One operating system.
2. One design language.
3. One motion system.
4. One navigation philosophy.
5. One implementation per module.
6. Bud is the only visible AI.
7. Orbit provides verified intelligence.
8. Spark executes background work.
9. Integrator is the only gateway to external providers.
10. No demo or fabricated user-facing content.
11. Social and Academic are contexts, not workspaces.
12. Contexts reprioritize modules; they never change navigation.

---

*This document supersedes all prior architecture specifications.
It is the canonical reference for all development decisions in UNIBUD OS.*