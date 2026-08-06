# UNIBUD OS — Architecture Specification v2.0

> **The Operating-System Constitution**
>
> UNIBUD OS is a platform composed of independent workspaces powered by shared
> platform services. Bud orchestrates the student experience. Orbit enriches
> communities with verified intelligence. Each workspace owns its domain,
> consumes shared platform capabilities, and never assumes another workspace's
> responsibilities. Presentation, business logic, and infrastructure remain
> independent so the system can evolve without architectural drift.

---

## Table of Contents

1. [Five-Layer Architecture](#1-five-layer-architecture)
2. [Platform Services (First-Class OS Infrastructure)](#2-platform-services)
3. [Workspace Responsibility Model (Owns / Uses / Cannot Own)](#3-workspace-responsibility-model)
4. [Bud — OS Capability](#4-bud--os-capability)
5. [Orbit — Live Knowledge & Community Intelligence Engine](#5-orbit--live-knowledge--community-intelligence-engine)
6. [Identity Platform](#6-identity-platform)
7. [Notification Platform](#7-notification-platform)
8. [Universal Search](#8-universal-search)
9. [Recommendation Engine](#9-recommendation-engine)
10. [Media Platform](#10-media-platform)
11. [Community Model](#11-community-model)
12. [Content Pipeline](#12-content-pipeline)
13. [Supported Sources Registry](#13-supported-sources-registry)
14. [Motion OS](#14-motion-os)
15. [Restored Navigation](#15-restored-navigation)
16. [Zero Demo Policy](#16-zero-demo-policy)
17. [Assessment](#17-assessment)

---

## 1. Five-Layer Architecture

```
Student
      │
      ▼
Operating System Experience
(Bud • Social • Academics • Me)
      │
      ▼
Workspace Layer
Social • Academics • Campus • Me • Marketplace • Wallet • Connect • Quad
      │
      ▼
Platform Services
Orbit • Bud Core • Identity • Notifications • Search • Recommendations • Media • Realtime
      │
      ▼
Domain Services
Communities • Events • Stories • Collections • Courses • Assignments • Research • Finance
      │
      ▼
External Integrations
Universities • Streaming Providers • Sports • Maps • Email • Storage • Payments
```

**Principle:** The distinction between *workspaces* (what the student sees) and
*platform services* (infrastructure every workspace consumes) prevents future
confusion about whether something belongs to a screen or to the platform.

---

## 2. Platform Services

Platform services are first-class OS infrastructure — never owned by a single
workspace, always consumed by many.

| Service | Responsibility |
|---|---|
| **Orbit** | Community intelligence, content intelligence, trust, ranking, source verification |
| **Bud Core** | Reasoning, planning, memory, personalization, automation, capability routing |
| **Identity** | Profile, verification, roles, permissions, university membership |
| **Notifications** | Unified notification pipeline across all domains |
| **Search** | Universal search across all indexed resource types |
| **Recommendations** | Explainable recommendations across all domains |
| **Media** | Unified media handling — images, video, audio, documents, livestream |
| **Realtime** | Event-driven sync and live presence across workspaces |

---

## 3. Workspace Responsibility Model

Every workspace is specified using three headings — **Owns**, **Uses**, **Cannot Own** —
eliminating ambiguity about where functionality belongs.

### Social — The Primary Social Workspace

**Owns**
- Feed, Stories, Friends, Creators
- Campus Buzz, Clubs, Organizations, Student Communities
- Events, Podcasts, Music, Videos, Live
- Trending, Discussions, User-generated posts

**Uses**
- Orbit, Notifications, Search, Media, Identity

**Cannot Own**
- Assignments, GPA, Wallet, Payments, Timetable

---

### Academics (Campus) — The Academic Workspace

**Owns**
- Courses, Timetable, Assignments, Exams, Results
- Notes, Research, Lecturer posts
- Faculty announcements, Department announcements
- Academic communities, Scholarships, Internships, Career opportunities

**Uses**
- Orbit, Notifications, Search, Media, Identity, Recommendations

**Cannot Own**
- Entertainment content, Marketplace transactions, Wallet, Social feed

---

### Quad — Discovery, Not Another Home Feed

**Owns**
- Discovery surfaces that surface trending content from every OS space

**Discovers**
- Trending communities, stories, sports, research, podcasts, creators
- Trending university events, marketplace listings, scholarships
- Recommended people, departments, institutions

**Uses**
- Orbit, Search, Recommendations, Media, Identity

**Cannot Own**
- Original content of any kind. Quad never owns the original content.

---

### Connect — Communication Workspace

**Owns**
- Messages, Calls, Groups, Collaboration
- Study Rooms, Project Teams, Office Hours, Community chats

**Uses**
- Identity, Notifications, Media, Realtime, Orbit

**Cannot Own**
- Feed posts, academic records, financial transactions

---

### Marketplace — Commerce Only

**Owns**
- Listings, transactions, seller profiles, reviews

**Uses**
- Orbit (may recommend listings), Identity, Notifications, Media, Payments

**Cannot Own**
- Social feed, academic content, communication channels

---

### Wallet — Finance Only

**Owns**
- Balance, transactions, cards, payments, savings

**Uses**
- Identity, Notifications, Payments infrastructure

**Cannot Own**
- Social feed, marketplace listings, academic records

---

## 4. Bud — OS Capability

Bud is an OS capability, not merely an assistant.

### Bud Owns
- Reasoning
- Planning
- Orchestration
- Long-term memory
- Personalization
- Automation
- Capability routing
- Contextual recommendations

### Bud Does Not Own
- Feeds
- Posts
- Communities
- Media
- Navigation
- Notifications

> **Bud answers questions. Workspaces present information.**

---

## 5. Orbit — Live Knowledge & Community Intelligence Engine

Orbit is **not** a visible workspace. Nobody navigates to Orbit. Orbit is infrastructure.

### Orbit Platform Components
- Community Intelligence
- Content Intelligence
- Recommendation Engine
- Discovery Engine
- Trust Engine
- Realtime Engine
- Moderation Signals
- External Knowledge
- Ranking
- Source Verification

### Consumption Rules
- Social consumes Orbit
- Campus consumes Orbit
- Quad consumes Orbit
- Bud may query Orbit
- **Nobody navigates to Orbit**

### Orbit Knowledge Domains

Orbit continuously enriches communities using real, verified public information.

| Domain | Orbit Provides | Students Provide |
|---|---|---|
| **Entertainment** | New movie releases, official trailers, official streaming destinations, cast, ratings | Community discussions, watchlists |
| **Sports** | Live scores, fixtures, league tables, match statistics, player/transfer/team news, official highlights | Match discussions, predictions, campus watch parties, commentary |
| **Music** | Albums, singles, charts, campus artists, concert announcements, artist pages | Reviews, discussions, playlists, recommendations |
| **Gaming** | Official tournaments, patch notes, esports | Community discussions |
| **Books** | Publisher information, open educational resources, reading clubs, library resources | — |
| **Technology** | AI, programming, cybersecurity, startups, engineering | Community discussions |
| **News** | University news, department/faculty news, student union announcements, education, science, technology, business | Discussions inside communities |
| **University Hub** | Official announcements, registration deadlines, academic calendar, examination notices, scholarships, student elections, campus events, emergency notices | — |

> **Orbit never fabricates articles.** Orbit aggregates from trusted and verified sources.

---

## 6. Identity Platform

Identity is currently spread across Me, Campus, Communities, Wallet, and Marketplace.
This is unified into one platform service.

### Identity Platform Components
- Profile
- Verification
- Roles
- Permissions
- University Membership
- Faculty
- Department
- Relationships
- Privacy
- Badges

### Rules
- Everything **reads** from Identity
- Only **Me** edits it

---

## 7. Notification Platform

Instead of multiple notification systems, a single unified platform.

### Notification Channels
- Academic, Social, Finance, Marketplace, Security, System, Bud

### Every Notification Has
- Source
- Priority
- Audience
- Workspace
- Category
- Action

Each workspace simply **filters** the notifications relevant to it.

---

## 8. Universal Search

Search is a platform service — it does not belong to Social.

### Searchable Resource Types
- People
- Communities
- Courses
- Posts
- Collections
- Universities
- Marketplace
- Events
- Research
- Media

Each workspace simply applies filters.

---

## 9. Recommendation Engine

Orbit recommendations are not a single algorithm. They are split by domain
so every recommendation becomes **explainable**.

### Recommendation Domains
- Discovery
- People
- Communities
- Academic
- Marketplace
- Events
- Media
- Career
- Research

### Explainability Example

> **Why this?**
> - Same faculty
> - Shared course
> - 3 mutual communities
> - Similar collections

---

## 10. Media Platform

Images, video, podcasts, sports, music, and documents appear in several places.
Create one Media Platform to eliminate duplicated viewers.

### Media Platform Components
- Images
- Video
- Audio
- Podcast
- Documents
- Livestream
- Player
- Downloads
- Offline
- Casting

### Rules
- Orbit simply references media
- Campus references media
- Communities reference media
- **No duplicated viewers**

---

## 11. Community Model

Every community behaves consistently regardless of category.

### Community Type
- Academic
- Social
- Campus
- Professional

### Community Visibility
- Public
- University
- Faculty
- Department
- Private

### Community Lifecycle
- Loading
- Empty
- Active
- Archived
- Restricted
- Deleted

---

## 12. Content Pipeline

```
Source
  ↓
Verification
  ↓
Normalization
  ↓
Moderation
  ↓
Ranking
  ↓
Recommendation
  ↓
Distribution
  ↓
Community Feed
  ↓
Discussion
```

**Entry points:**
- User-generated content starts at **Moderation**
- External content begins at **Verification**

---

## 13. Supported Sources Registry

This is an actual platform component, not just documentation.

### Schema

| Field | Description |
|---|---|
| `id` | Unique source identifier |
| `category` | Entertainment, Sports, Music, News, etc. |
| `provider` | The external provider name |
| `verificationLevel` | Trust tier of the source |
| `license` | Usage rights |
| `refreshInterval` | How often Orbit re-fetches |
| `status` | active / paused / deprecated |
| `priority` | Ranking weight |

**Rule:** Nothing else references providers directly. Every integration goes
through this registry.

---

## 14. Motion OS

Motion OS is separated from application behavior.

### Motion OS Owns
- Animation
- Transitions
- Shared elements
- Haptics
- Blur
- Glass effects
- Loading motion

### Motion OS Does Not Own
- Routing
- Navigation
- Permissions
- Data
- Business logic

> Motion OS is **replaceable** without affecting the application architecture.

---

## 15. Restored Navigation

Navigation is permanent and unchanged.

### Bottom Navigation (Permanent)

| Tab | Role |
|---|---|
| **Bud** | Operating system assistant |
| **Social** | Social workspace (Stories, Posts, Communities, Music, Sports, Entertainment, Live) |
| **Academics** | Academic workspace (Campus) |
| **Me** | Immutable personal operating-system space |

> Motion OS enhances animations, transitions, gestures, haptics, and visual
> presentation **only**. It must not alter this navigation hierarchy, move Me,
> rename workspaces, or redistribute ownership between OS spaces.

---

## 16. Zero Demo Policy

Applies **everywhere**.

### Never Display
- Fake stories
- Fake sports scores
- Fake communities
- Fake notifications
- Fake students
- Fake comments
- Fake university announcements
- Placeholder feeds

### When No Real Content Exists
- Show a polished empty state
- Encourage the first contribution
- Explain what will appear when data becomes available

---

## 17. Assessment

| Area | Rating |
|---|---|
| Product Identity | 10/10 |
| Workspace Separation | 10/10 |
| Bud Architecture | 9.8/10 |
| Orbit Architecture | 10/10 |
| Scalability | 10/10 |
| Maintainability | 9.8/10 |
| Extensibility | 10/10 |
| Design System Direction | 10/10 |
| Long-term Platform Potential | 10/10 |

> The remaining work is no longer about adding features. It is about
> **formalizing the platform layer** — Identity, Notifications, Search,
> Recommendations, Media, Orbit, and Bud Core — as shared OS services that
> every workspace consumes. Once those are defined as infrastructure, the
> architecture becomes substantially more resistant to future feature growth
> while preserving the responsibility boundaries established throughout.

---

*This document is the canonical architectural reference for UNIBUD OS.
All future development must conform to the ownership boundaries defined herein.*