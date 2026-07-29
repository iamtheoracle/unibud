# UNIBUD OS — Connect

### Communication & Collaboration Layer
**Status:** Active · **Priority:** Core System · **Owner:** UNIBUD OS Platform

---

## 1. Identity & Boundary

Connect is the **communication and collaboration layer** of UNIBUD OS — the living network of the university where conversations, relationships, collaboration, and coordination happen across the entire ecosystem.

It is **not a standalone chat product.** It is a **context-aware communication system** that intelligently connects students, educators, researchers, departments, institutions, communities, organizations, and external partners through a single adaptive interface.

**Invariant:** Every conversation belongs to a meaningful context within the university. Communication is organized by relationship, never manually foldered by the user.

**Architectural role:** Communication is an **operating-system capability**, not a destination. It is reachable from every workspace (Campus, Square, Quad, Courses, Calendar, Marketplace, Research…) and never requires the user to "open the messaging app."

---

## 2. Adaptive Context Contract

Connect preserves **one interface structure** across all operating spaces. Only **content, priorities, suggestions, and AI assistance** adapt, driven by `ExperienceContext.mode`.

### Social Context — Square (`mode === "social"`)

Prioritized relationships: Friends · Mutual Connections · Student Communities · Clubs · Campus Creators · Student Organizations · Campus Events · Alumni · Nearby Students · Interest Groups · Voice Hangouts · Video Hangouts · Shared Media.

Experience qualities: **Social · Dynamic · Community-driven · Discoverable · Real-time.**

### Academic Context — Campus (`mode === "academic"`)

Prioritized relationships: Lecturers · Teaching Assistants · Classmates · Departments · Faculties · Course Groups · Study Groups · Research Labs · Project Teams · Student Union · Academic Communities · Office Hours · Live Lectures · Advising Sessions.

Experience qualities: **Organized · Productive · Professional · Focused · Structured.**

### Adaptation rules
- The page shell, navigation dock, and section component types remain **identical** across modes.
- Sections are **reordered** by rank: active context → shared → other. Nothing is removed.
- Quick-action tiles and the messages header copy are **mode-keyed** (e.g. "Course Conversations" vs "Recent Conversations").

---

## 3. Capability Surface

Mapped to the existing codebase. Legend: ✅ implemented · 🔧 partial · ⛔ out-of-scope (dead-end).

### Communication
| Capability | Status | Implementation |
|---|---|---|
| One-to-one messaging | ✅ | `Conversation` (type `direct`) · `Message` · `ChatView` |
| Group conversations | ✅ | `Conversation` (type `group`) |
| Broadcast / announcement channels | 🔧 | `StaffAnnouncement` (institution→audience) · `Community` announcements |
| Threaded discussions / replies | 🔧 | `Message.reply_to_id` threading |
| Reactions | ✅ | `Message.reactions` / `ReactionBar` |
| Mentions | 🔧 | `Message.mentions` parsing |
| Voice messages | 🔧 | `GenerateSpeech` TTS · audio `Message` attachments |
| Read receipts / typing / presence | ✅ | `Conversation.participants[].last_read_at` · `Presence` · `useTypingStatus` |

### Calls & Meetings
| Capability | Status | Note |
|---|---|---|
| Voice / video calls, screen share, live classrooms, webinars | ⛔ | **Dead-end:** no WebRTC media backend in current Base44 runtime. Not implemented. |
| Live classrooms (presentation/attendance/chat) | 🔧 | `LiveClassroom` (`/classroom/:classId`) — non-WebRTC session UI |
| Office-hour booking | ✅ | `OfficeHoursSlot` / `OfficeHoursBooking` (`/office-hours`) |
| Meeting scheduling | ✅ | `CalendarEvent` + `base44.integrations` reminders |

### Collaboration
| Capability | Status | Implementation |
|---|---|---|
| Shared notes / documents / files | 🔧 | `CollaborationItem` · `CollaborationVersion` · `KnowledgeHub` |
| Collaborative editing / version history | 🔧 | `CollaborationVersion` · `CollaborationComment` |
| Shared whiteboards | ⛔ | Not in current runtime |
| Polls / forms | 🔧 | `QuadPost` polls · assignment forms |
| Task management | ✅ | `TaskManagement` · `TaskHub` (`/tasks`) |
| Assignment collaboration | 🔧 | `Assignment` + `StudyGroupTask` |
| Research workspaces | 🔧 | `ResearchProject` · `CollaborationHub` |

### Scheduling
| Capability | Status | Implementation |
|---|---|---|
| Calendar integration | ✅ | `CalendarEvent` (`/calendar`) · Google Calendar connector |
| Office-hour booking | ✅ | `OfficeHoursSlot` / `OfficeHoursBooking` |
| Availability indicators | ✅ | `Presence.status` · `WorkspacePresence` |
| Event invitations / smart reminders | ✅ | `CampusEvent` + `budReminders` workflow engine |

### AI Assistance — Bud
Bud enhances conversation without replacing human interaction. Surfaced inline, never interruptive.

| Capability | Status | Implementation |
|---|---|---|
| Conversation / meeting / lecture summaries | 🔧 | `InvokeLLM` summarization hooks in `BudCompanion` |
| Translation | ✅ | `InvokeLLM` (Spark translation intelligence) |
| Action items / follow-ups | 🔧 | `SparkExecutionLog` action extraction |
| AI scheduling | 🔧 | `budReminders` + calendar sync |
| Note extraction | 🔧 | `KnowledgeHub` extract pipeline |
| Search across conversations | 🔧 | `useMessages` search · `UnifiedMessageSearch` |
| Contextual recommendations | ✅ | `useCommunicationRecommendations` |

---

## 4. Intelligent Organization

Conversations are auto-categorized by their relationship to the ecosystem — **users never manually folder.**

Categories derive from `Conversation.context_type` + linked entities:
Direct Messages · Courses (`Course`) · Departments (`Staff`/`Department`) · Faculties · Clubs (`Club`) · Communities (`Community`) · Research Groups (`ResearchProject`) · Project Teams (`Project`/`CollaborationItem`) · Organizations · Events (`CampusEvent`) · Institutional Announcements (`StaffAnnouncement`) · Marketplace (`MarketplaceListing` conversations) · Support (`SupportTicket`).

---

## 5. Connected Ecosystem

Connect is reachable from, and contextually embedded in, every major surface: Campus · Square · Quad · Lens · Bud · Calendar · Timetable · Courses · Assignments · Library · Marketplace · Wallet · Events · Communities · Organizations · Research · Profile.

**Integration pattern:** `QuickActionCapsule` + `EcosystemRail` expose context-aware entry points; deep links route into `/messages/:conversationId` with ecosystem context preserved.

---

## 6. Data Model (existing entities — no new schema required)

- **Conversation** — `participants[]`, `type` (direct/group/channel), `context_type`, `last_message_at`, RLS by participant membership.
- **Message** — `conversation_id`, `content`, `reply_to_id`, `mentions`, `reactions`, `attachments`, RLS by conversation membership.
- **Presence** / **WorkspacePresence** — availability broadcast, RLS honors `offline` privacy.
- **StudyGroup** / **StudyGroupMessage** / **StudyGroupTask** — academic group collaboration.
- **Community** / **Club** — social communities & orgs.
- **OfficeHoursSlot** / **OfficeHoursBooking** — lecturer scheduling.
- **CalendarEvent** / **CampusEvent** — scheduling & events.
- **StaffAnnouncement** — institutional broadcast channels (audience-scoped RLS).
- **TaskManagement** / **TaskComment** / **TaskActivity** — collaboration execution.
- **CollaborationItem** / **CollaborationVersion** / **CollaborationComment** — shared artifact workspaces.
- **Notification** — unified delivery, dedup via `budNotificationEngine`.

RLS is enforced per-entity; Connect composes them, it does not override access rules.

---

## 7. Design Principles

Context-aware · Relationship-centric · AI-native · Collaboration-first · Institution-aware · Scalable · Accessible · Secure · Privacy-focused · Apple-quality interaction · Consistent across every operating space.

---

## 8. Out of Scope (decided dead-ends — do not retry)

- **Voice/video calls, screen share, live streaming, WebRTC media.** No real-time media backend in current Base44 runtime. Revisit only if a media backend is introduced.
- **Native E2E encryption** of message transport — not implementable on the current BaaS transport.
- **Manual conversation folders** — explicitly forbidden by the Intelligent Organization model.

---

## 9. Implementation Status

| Area | State |
|---|---|
| Adaptive mode (Square/Campus) on Connect home | ✅ `Connect.jsx` reorders sections + filters quick actions by `ExperienceContext.mode`; academic quick actions (Office Hours, Study Groups, Research, Project Teams, Academic Calendar) added; messages header mode-aware. |
| Direct + group messaging | ✅ `Messages` · `ConversationList` · `ChatView` |
| Presence / typing / read receipts | ✅ |
| Office hours booking | ✅ |
| Calendar + reminders | ✅ (`budReminders` engine) |
| Collaboration workspaces | 🔧 `CollaborationHub` / `KnowledgeHub` |
| Bud inline assistance | 🔧 summarize / translate / action-items via `InvokeLLM` |
| Voice/video/WebRTC | ⛔ dead-end |

**Next realistic gaps (when prioritized):**
1. Threaded reply rendering polish in `ChatView` (`Message.reply_to_id`).
2. `Conversation.context_type` auto-tagging from linked entity on creation.
3. Unified conversation search surface across `Conversation` + `Message` + `Community`.
4. Bud summarize-action entry point inside conversation headers.