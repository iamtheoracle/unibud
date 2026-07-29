# UNIBUD CAMPUS — Production Blueprint

**Product:** Campus — the Academic Operating System of UNIBUD OS
**Authored by:** Orbit (Product Engineering)
**Status:** Blueprint — precedes implementation
**Predecessors:** UNIBUD OS Supreme Constitution, Volume V Product Identity Constitution, Monochrome Design System

---

## 0. Premise

Campus is **not** a student portal, an LMS, or a dashboard. It is the world's most intelligent academic operating system — the single place where teaching, learning, research, assessment, planning, and institutional operations converge.

- **Square** connects the world.
- **Quad** connects the campus community.
- **Campus** powers education.
- **Connect** powers communication.
- **Marketplace** powers commerce.
- **Wallet** powers finance.

Campus inherits the UNIBUD Design System but expresses a distinct academic identity: **calm, structured, productive, trustworthy**. It must not resemble Square, Quad, Marketplace, Wallet, or Connect. Its visual hierarchy encourages **focus and deep work**.

> A large academic foundation already exists in the codebase (~40 entities, 50+ screens). This blueprint treats Campus as the **consolidation and elevation** of that foundation under one coherent product, plus the closing of real gaps — not a greenfield rebuild.

---

## 1. Design Language — "Campus"

### Principles
1. **Focus-first** — the surface answers "what needs my attention right now?" before anything else.
2. **Document-native** — content reads like well-set documents, not social cards. Generous margins, clear type hierarchy, restrained color.
3. **Quiet intelligence** — Bud adapts the experience without announcing itself. No chatbot UI in the default flow.
4. **Structured calm** — whitespace, soft dividers, low-contrast chrome; the only loud elements are deadlines and status.
5. **Trust through clarity** — every grade, deadline, and requirement is traceable to its source.

### Visual Identity (inherits UNIBUD Monochrome DS)
- **Root:** black `#000000`, structure white, depth grays — unchanged from the system.
- **Campus accent:** reserved grayscale only. Status indicators are the sole use of color (success/warning/error/information/gold), exactly as the design tokens define.
- **Typography:** Inter throughout. A tighter, more documentary feel than Square — increased line-height on body, restrained display weights for academic headings.
- **Surfaces:** `glass-card` for grouping, but Campus prefers **solid layered panels** (`surface`, `surface-elevated`) over translucency for long-form reading focus. Glass reserved for the home shell and navigation chrome.
- **Motion:** minimal. `fade-in-up` for section entry only. No autoplay carousels, no parallax on academic content. Reduced-motion respected.
- **Density:** high-density, compact spacing (per the global compact-layout standard) for information-rich surfaces, with breathing room on reading views.

### Distinct from sibling products
| Product | Feel | Campus contrast |
|---|---|---|
| Square | social, image-led, scrollable feed | structured, text/document-led, task-oriented |
| Quad | campus community, casual | academic, formal, citation-aware |
| Marketplace | transactional, browsable | — |
| Wallet | financial, dense | Campus is schedule/learning-led, not ledger-led |
| Connect | real-time, conversational | Campus is asynchronous and reflective |

---

## 2. Information Architecture

Campus is organized into **six experience domains** plus an **administration layer**. Every screen is reachable from the Campus Home shell.

### 2.1 Campus Home (`/campus`)
The intelligent front door. Answers, in order: *What needs attention today → Deadlines → Classes today → Exams approaching → Recommendations → Progress → Opportunities.*
- **Today Brief** — Bud-prepared daily focus (deadlines, classes, exams, meetings) in one calm card.
- **Academic Pulse** — live standing, GPA trend, attendance, streak.
- **Upcoming** — merged timeline of assignments, exams, classes, office hours.
- **Spark focus for you** — adaptive recommendations (study next, review weak areas, practice tests).
- **Opportunities** — scholarships, internships, research calls matched to profile.
- No social feed. No notifications noise (those live in the global notification center).

### 2.2 Learning (`/campus/learn`)
Where study happens — courses, materials, notes, and the AI study suite.
- **Courses** → **Course Space** (per-course hub: materials, assignments, discussions, grades, syllabus, office hours)
- **Timetable** & **Calendar** (unified academic schedule)
- **Lecture Notes** & **Study Materials** & **Reading Lists**
- **Live Classes** & **Recorded Lectures**
- **AI Study Suite** — Smart Notes, Flashcards, Practice Tests, Assignment & Project Assistants, Research Assistant, Citation Manager, Learning Paths, Exam Preparation, Document Library
- **Library** (institutional resources + personal collections)

### 2.3 Assessment (`/campus/assess`)
Everything graded.
- **Assignments** & **Homework** & **Projects** (group + individual)
- **Exams** & **Quizzes** — schedule, preparation, and the **Exam Platform** (author → start → take → result → analytics → coach)
- **Grades** & **Results** & **Summary Reports**
- **Attendance** (smart attendance + sessions + records)

### 2.4 Progress & Planning (`/campus/plan`)
The student's academic trajectory.
- **Academic Timeline** (admission → graduation milestones)
- **Degree Audit** — requirements completion vs. degree plan *(gap — see §5)*
- **Graduation Tracking** — credit tracking, clearance, projected graduation
- **Academic Goals** & **Study Planner** & **Study Sessions**
- **Academic Advising** & **Mentorship**

### 2.5 Research (`/campus/research`)
The Academia layer.
- **Research Hub** — projects, publications, collaborations
- **Research Collaboration** — labs, co-authors, recruiting projects
- **Laboratories** — lab management *(gap — see §5)*
- **FYP / Thesis / Dissertation** management

### 2.6 Career & Opportunity (`/campus/career`)
- **Opportunities** (internships, jobs) · **Scholarships** · **Career Hub** · **Companies**
- **Portfolio** · **CV Builder** · **Mentorship** · **Challenges**

### 2.7 Administration (`/campus/admin`)
Full operational layer — see §6.

---

## 3. Foundation Audit — What Already Exists

The codebase already contains the bulk of Campus. This inventory prevents rebuilding.

### Pages (existing, to be consolidated under Campus shell)
- Home/Academic hub, CampusHub, Courses, CourseSpace, Timetable, Calendar, Assignments, Projects, Exams, Attendance, SmartAttendance, Notes, OfficeHours, StudySessions
- Results, SummaryReport, AcademicTimeline
- Study suite (11 screens), Exam platform (7 screens), LiveClassroom, KnowledgeHub
- CollaborationHub/WorkspaceDetail, TaskHub/TaskDetail
- ResearchHub, Scholarships, Opportunities, CareerHub, Companies, Portfolio, CVBuilder, Mentorship, MentorProfile, Challenges
- Institution portal, Lecturer portal, Parent portal

### Entities (existing)
`Course`, `Assignment`, `Exam`, `ExamPaper`, `ExamQuestion`, `ExamAttempt`, `ExamCertificate`, `TimetableEntry`, `InstitutionTimetable`, `CourseMaterial`, `CourseMaterialProgress`, `OfficeHoursSlot`, `OfficeHoursBooking`, `AcademicTimelineEntry`, `StudentGrade`, `Grade`, `StudyGoal`, `StudentGoal`, `StudySession`, `Flashcard`, `QuizAttempt`, `Citation`, `Project`, `ResearchProject`, `FYPProject`, `AttendanceRecord`, `AttendanceSession`, `LiveClass`, `LiveRecording`, `StudentRecord`, `Note`, `StudentDocument`, `LearningPath`, `Institution`, `Staff`, `CampusEvent`, `LibraryResource`, `Mentor`, `MentorshipRequest`, `MentorReview`, `Scholarship`, `ScholarshipAward`, `Opportunity`, `CompanyPage`, `PortfolioItem`, `ApplicationTracker`, `Challenge`, `StaffAnnouncement`, `AnnouncementRead`.

### What's already strong
- RLS-secured multi-tenant entities (institution-scoped where appropriate)
- Real-time subscriptions on feeds (QuadPost pattern)
- Bud intelligence layer (constitution, orchestrator, context pulse)
- Exam platform with full lifecycle
- Academic report engine + charting

---

## 4. Gap Analysis — What the Brief Requires That's Missing or Incomplete

These are the real build targets. Listed by priority.

### Tier 1 — Core identity & consolidation
1. **Campus Shell & Identity** — a dedicated Campus layout/nav distinct from the social AppShell. Calm, structured, focus-first. Today, academic screens live inside the social AppShell with social navigation.
2. **Campus Home (Today Brief)** — unified intelligent dashboard merging deadlines, classes, exams, recommendations. Exists in fragments (Home.jsx, AcademicPulse) but not as a focused Campus-native surface.
3. **Unified Academic Calendar** — merge timetable + exams + assignments + office hours + personal events into one authoritative calendar view. Calendar and Timetable exist separately; they must unify.

### Tier 2 — Missing capabilities
4. **Degree Audit** — requirements checklist mapped to completed courses/credits, with projection. `ApplicationTracker` exists but is for job/scholarship applications, not degree requirements. **New entity needed.**
5. **Graduation Tracking & Clearance** — credit progress, outstanding requirements, clearance checklist. **New entity needed.**
6. **Laboratories** — lab management (resources, bookings, safety, equipment). No entity exists. **New entity needed.**
7. **Reading Lists** — per-course curated reading lists with progress tracking. `CourseMaterial` covers documents but not structured reading lists. **New entity/field needed.**
8. **Recorded Lectures management** — `LiveRecording` exists but no dedicated browse/player surface integrated into Course Spaces.
9. **Faculty & Department Resources** — resource hubs scoped to faculty/department. `StaffAnnouncement` covers announcements; resource libraries are missing as a distinct scoping.
10. **Academic Advising** — advisor-student relationship, advising notes, plan reviews. Mentorship is close but advising is distinct (formal, advisor-assigned).

### Tier 3 — Experience quality
11. **Offline Learning** — cached materials, offline notes, sync-on-reconnect. The Quad feed has offline cache; academic content does not.
12. **Accessibility surface** — consolidated a11y settings (exists as toggles in EcosystemRail; needs a Campus-native settings page).
13. **Campus Search & Discovery** — unified academic search across courses, materials, notes, research, people.

### Tier 4 — Administration completeness
14. **Quality Assurance** — course/lecturer evaluation, accreditation tracking.
15. **Academic Reports (institutional)** — beyond student reports: cohort, department, faculty analytics.
16. **Permissions matrix UI** — role-to-entity permission management (roles exist in code; no admin UI).

---

## 5. Data Model — New & Extended

### New entities required

**DegreeRequirement** — degree plan template
```jsonc
{ "degree_id", "institution_id", "title", "category": ["core","elective","general","project","siwes"],
  "required_credits", "min_courses", "course_codes": [], "notes" }
```

**DegreeAudit** — student's progress against a degree plan
```jsonc
{ "user_id", "institution_id", "degree_id", "requirements": [{ "requirement_id", "status": "pending|in_progress|satisfied|waived",
  "satisfied_by": [course_ids], "credits_earned", "notes" }],
  "total_credits_required", "total_credits_earned", "projected_graduation", "clearance_items": [{ "key","label","status","verified_by" }],
  "status": "on_track|at_risk|cleared|graduated" }
```

**Laboratory** — lab resource & booking
```jsonc
{ "name", "institution_id", "department", "location", "capacity", "equipment": [{ "name","quantity","condition" }],
  "manager_id", "safety_rules": [], "booking_slots": [{ "date","start","end","course_code","booked_by","status" }],
  "status": "open|closed|maintenance" }
```

**ReadingList** — curated course readings
```jsonc
{ "course_id", "title", "week_or_module", "items": [{ "title","author","url","file_url","type":"paper|book|article|web",
  "required": true, "estimated_minutes" }], "created_by_id" }
```

**AdvisingSession** — academic advising record
```jsonc
{ "student_id", "advisor_id", "session_date", "topics": [], "notes", "action_items": [{ "text","due_date","done" }],
  "plan_snapshot": {} }
```

**FacultyResource** / **DepartmentResource** — scoped resource libraries (reuses a shared `Resource` shape with `scope_type` + `scope_id`).

### Extended entities
- `Course` — add `syllabus_url`, `credit_units`, `degree_requirement_ids`, `prerequisite_codes`.
- `CourseMaterial` — add `reading_list_id` linkage.
- `LiveRecording` — add `course_id`, `lecture_date`, `duration_seconds`, `transcript_status`.
- `Institution` — add `academic_calendar` (term/semester structure), `grading_scale`.

### Permission model (RLS)
All new entities follow the established patterns:
- **Student-scoped** (`DegreeAudit`, `AdvisingSession`): read = own data or advisor/lecturer/admin; write = advisor+ only.
- **Institution-scoped** (`DegreeRequirement`, `Laboratory`, `FacultyResource`): read = institution members; write = institutional academic roles (registrar, dean, head_of_department, lecturer) + platform/super admins — mirroring `StaffAnnouncement`'s proven RLS pattern.
- **Course-scoped** (`ReadingList`): read = enrolled students + staff; write = lecturers/TAs + admins.

---

## 6. Administration Layer

Campus administration is delivered through the existing **Institution Portal** + **Lecturer Portal** + **Management** + **Oracle** surfaces, extended with:

| Capability | Surface | Status |
|---|---|---|
| Institution / Faculty / Department management | Institution Portal | Exists — extend with resource scoping |
| Lecturer & researcher management | Lecturer Portal | Exists |
| Academic advisors | Lecturer Portal (advising tab) | **New** |
| Registrars | Institution Portal | Exists |
| Library management | Library page | Exists — extend |
| Laboratory management | Institution Portal (labs tab) | **New** |
| Assessment management | Exam Author + Institution Portal | Exists |
| Scheduling | Timetable admin | Exists |
| Student services | StudentSupport | Exists |
| Academic reports | Report engine | Exists — extend to cohort/dept |
| Quality assurance | Institution Portal (QA tab) | **New** |
| Analytics | Oracle + Institution analytics | Exists |
| Permissions | Oracle User Governance | Exists — add matrix UI |
| Audit logs | Oracle Audit Center | Exists |

No new admin shell is needed — Campus admin reuses the institutional portals and Oracle, extended with the new tabs above.

---

## 7. Intelligent Experience — "Invisible AI"

Campus must automatically understand, without forced configuration:
Institution · Degree · Faculty · Department · Semester · Courses · Academic standing · Learning style · Deadlines · Exam schedule · Research interests · Career goals.

### How (already partially built — formalize)
- **Onboarding capture** — the conversational onboarding (`OnboardingConversation`) already infers university, course, level. Extend to capture degree plan + career goals + research interests in the same conversational flow.
- **Bud memory** (`BudMemory` entity) — persists academic context, learning style, and goals. Campus reads this to personalize without re-asking.
- **Context Pulse** (`src/lib/bud/contextPulse.js`) — already feeds Bud the user's current academic state. Campus surfaces use it to prioritize the Today Brief.
- **Adaptive recommendations** — `useAcademicRecommendations` + Spark recommendations already exist. Campus Home consumes them directly.
- **Multi-level adaptation** (Child / Simple / Student / Expert) — per the Universal Intelligence Principle; Bud's tone/complexity adapts per `NotificationPreference.bud_tone` and the user's level.

**Rule:** AI never appears as a separate "AI feature." It manifests as the right thing showing up at the right time — the Today Brief, the "study next" suggestion, the deadline nudge, the weak-area practice test.

---

## 8. Phased Implementation Roadmap

Implementation proceeds in phases. Each phase is independently shippable.

### Phase 0 — Campus Identity & Shell (foundation)
- Campus Shell layout + navigation (distinct from social AppShell)
- Campus Home (Today Brief) consolidating existing pulse/upcoming/recommendations
- Route `/campus` as the academic front door (AcademicHub elevated)

### Phase 1 — Unified Calendar & Schedule
- Merge Timetable + Calendar + Exams + Assignments + Office Hours into one authoritative view
- Calendar event sources unified

### Phase 2 — Progress & Planning (the real gaps)
- `DegreeRequirement` + `DegreeAudit` entities, RLS, and surfaces
- Graduation tracking & clearance
- `AdvisingSession` entity + advising surface
- Academic Timeline extended with degree progress

### Phase 3 — Research & Labs
- `Laboratory` entity + lab management + booking
- Research collaboration consolidation
- `ReadingList` entity + Course Space integration
- Recorded lectures surface in Course Spaces

### Phase 4 — Experience Quality
- Offline learning (cached materials + sync)
- Campus-native accessibility settings page
- Unified academic search & discovery

### Phase 5 — Administration Completeness
- Quality Assurance tab
- Institutional/cohort academic reports
- Permissions matrix UI
- Faculty/Department resource hubs

---

## 9. Quality Standard & Guardrails

- **No portal/LMS patterns.** Every screen must reduce stress and clarify next actions.
- **Reuse over rebuild.** The existing 40+ entities and 50+ screens are the foundation; consolidate, don't duplicate.
- **RLS everywhere.** Every new entity is institution-scoped or student-scoped from day one, following the proven `StaffAnnouncement` / `TaskManagement` patterns.
- **Monochrome compliance.** No decorative color; status indicators only, per the design tokens.
- **Accessibility.** Reduced-motion, high-contrast, reduced-transparency, large-text toggles respected on every Campus surface.
- **Performance.** Lazy-loaded routes (already the pattern); realtime subscriptions only where they add value; offline-first for reading materials.
- **Integration seamlessness.** Campus connects to Connect (academic messaging), Wallet (fee payments), Marketplace (academic materials commerce), Square/Scholar (academic social).

---

## 10. Next Action

Orbit will begin **Phase 0 — Campus Identity & Shell** on approval: a distinct Campus shell, the Campus Home Today Brief, and the elevated `/campus` front door — built on the existing AcademicHub foundation, not replacing it.