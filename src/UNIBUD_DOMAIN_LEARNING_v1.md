# UNIBUD OS — Learning Domain Specification (LDS)

> **Revision:** v1.2 · **Date:** 2026-08-01
> **Parent:** UNIBUD OS Core Architecture v1.0 (frozen) · IACP v1.1 · Domain Architecture v1.2
> **Status:** Active Revision — Domain Architecture Extension
> **Milestone:** 14.3
> **Predecessors:**
> - [Identity & Access Domain (IAD) v1.2](./UNIBUD_DOMAIN_IDENTITY_ACCESS_v1.md)
> - [Academic Domain (ADS) v1.2](./UNIBUD_DOMAIN_ACADEMIC_v1.md)

---

## 1. Purpose

The Learning Domain (LDS) is the authoritative source for **how students learn** — the delivery of learning content, the tools that support study, the AI tutoring that adapts to individual needs, and the progress tracking that measures growth. Where the Academic Domain defines *what is taught* (structure, curriculum, enrollment), the Learning Domain defines *how it is learned* (delivery, practice, mastery, support).

Every learning interaction — reading a lesson, reviewing a flashcard, completing a practice test, receiving AI tutoring — traces back to entities and services defined in this domain.

---

## 2. Scope

### In Scope

| Concern | Ownership |
|---|---|
| Learning content delivery (lessons, readings, videos, documents) | LDS |
| Learning paths and personalized study plans | LDS |
| Study tools (flashcards, quizzes, practice tests, smart notes) | LDS |
| Assignment assistance and project guidance (AI-powered) | LDS |
| Research and citation tools | LDS |
| Study session tracking and learning analytics | LDS |
| AI tutoring and adaptive learning | LDS |
| Learning progress and competency tracking | LDS |
| Document library and knowledge management | LDS |
| Spaced repetition and mastery algorithms | LDS |

### Out of Scope (Owned by Other Domains)

| Concern | Owner | Rationale |
|---|---|---|
| Course structure and enrollment | Academic Domain (ADS) | LDS references `course_id`; ADS owns the catalog |
| User identity & authentication | Identity & Access (IAD) | LDS references `user_id`; IAD owns the User |
| Social study groups (community layer) | Community Domain | LDS owns learning content; Community owns social interaction |
| Research project lifecycle | Research Domain | LDS owns research tools; Research owns the research process |
| Analytics dashboards and reporting | Analytics Domain | LDS owns raw learning data; Analytics owns derived insights |
| AI infrastructure (Bud, Spark, agents) | AI Domain | LDS uses AI capabilities; AI Domain owns the runtime |
| File storage and processing | Media Domain | LDS references file URLs; Media owns storage infrastructure |

### Shared Stewardship

| Entity | LDS Role | Partner Domain Role |
|---|---|---|
| `CourseMaterial` | Delivery + progress owner | ADS owns structural metadata |
| `CourseMaterialProgress` | Sole owner | ADS references for enrollment status |
| `Citation` | Study tool owner | Research owns bibliographic usage |
| `StudyGroup` | Learning content reference | Community owns social layer |
| `Note` / `StudentDocument` | Sole owner | Media owns file storage |

---

## 3. Responsibilities

| # | Responsibility | Description |
|---|---|---|
| R1 | Content Delivery | Serve lessons, readings, videos, documents to enrolled students |
| R2 | Learning Paths | Create and manage personalized study journeys |
| R3 | Study Tools | Provide flashcards, quizzes, practice tests, smart notes |
| R4 | AI Tutoring | Deliver adaptive, personalized tutoring through Bud |
| R5 | Progress Tracking | Track completion, mastery, and competency development |
| R6 | Study Analytics | Track study sessions, streaks, and learning patterns |
| R7 | Assignment Assistance | Provide AI-powered guidance (not completion) for assignments |
| R8 | Research Tools | Provide citation management and literature search |
| R9 | Document Library | Manage personal and shared knowledge collections |
| R10 | Adaptive Learning | Adjust content difficulty and recommendations based on performance |
| R11 | Spaced Repetition | Schedule flashcard reviews using mastery algorithms |
| R12 | Learning Recommendations | Suggest next steps, resources, and study strategies |

---

## 4. Bounded Context

### Context Boundary

LDS is bounded by the question: **"How is this student learning, and how can we help them learn better?"**

- **Content delivery** ends at the learning material and its consumption.
- **Progress** ends at the completion and mastery record.
- **AI tutoring** ends at the Bud interaction and its stored memory.
- **Analytics** ends at the learning session and streak data.

### What LDS Does NOT Decide

- Whether a student is *enrolled* in a course (Academic Domain decides; LDS checks enrollment for content access).
- Whether a student is *identity-verified* (IAD decides; LDS requires verification for personalized features).
- Whether learning content is *academically accredited* (Academic Domain decides; LDS delivers the content).
- Whether a study group is *socially active* (Community Domain decides; LDS provides the learning context).
- Whether AI responses are *safe and governed* (AI Domain decides; LDS uses approved AI capabilities).

### Cross-Context Contracts

Other domains consume LDS through:

| Contract | Mechanism |
|---|---|
| `material_id` | Entity reference — resolved by LDS |
| `course_id` | Entity reference — resolved by ADS, used by LDS for content organization |
| `user_id` | User reference — resolved by IAD |
| `progress_percent` | Computed value — consumed by Analytics, AI (recommendations) |
| `mastery_level` | Computed value — consumed by AI (adaptive difficulty) |
| `study_streak` | Computed value — consumed by Workflow (streak reminders), Analytics |

---

## 5. Domain Principles

1. **Learning is student-owned.** All learning data belongs to the student; no cross-student visibility without explicit consent.
2. **Content follows structure.** Learning materials reference courses from the Academic Domain; they don't define them.
3. **Progress is progressive.** Mastery accumulates over time through spaced repetition and practice — never retroactively downgraded without cause.
4. **AI assists, never replaces.** Bud provides guidance, hints, and explanations — never completes assignments for students.
5. **Adaptive learning is data-driven.** Content difficulty and recommendations adjust based on demonstrated performance, not assumptions.
6. **Spaced repetition is scientific.** Flashcard scheduling follows proven memory research (SM-2 or similar algorithms).
7. **Learning is multimodal.** Lessons, readings, videos, interactive exercises, and AI conversations all contribute to mastery.
8. **Accessibility is non-negotiable.** Learning content must be accessible to all students regardless of disability.
9. **Privacy by design.** Study patterns and learning struggles are personal; they inform AI tutoring without exposing to peers.
10. **Platform-native.** LDS uses Base44 entities, `InvokeLLM`, and platform integrations — no custom database or AI infrastructure.

---

## 6. Canonical Entities

All entities are JSON schemas in `base44/entities/`. Built-in attributes (never declared): `id`, `created_date`, `updated_date`, `created_by_id`.

### 6.1 Learning Paths & Plans

#### LearningPath *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `title` | string | Path title |
| `subject` | string | Subject or course area |
| `goal` | string | What the student wants to achieve |
| `level` | enum | beginner, intermediate, advanced |
| `description` | string | |
| `modules` | array | Ordered learning modules (see `LearningModule` value object) |
| `progress_percent` | number | 0-100 completion |
| `estimated_hours` | number | Total estimated time |
| `status` | enum | active, paused, completed |

#### LearningPlan *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `title` | string | e.g., "Fall 2024 Study Plan" |
| `semester_id` | string | Academic semester reference *(from ADS)* |
| `goals` | array | Linked `StudyGoal` references |
| `study_schedule` | object | Weekly study time allocation per subject |
| `target_gpa` | number | Goal GPA for the semester |
| `priority_subjects` | array | High-priority course IDs |
| `buffer_days` | number | Buffer for unexpected events |
| `status` | enum | draft, active, completed, abandoned |

### 6.2 Learning Content

#### CourseMaterial *(Exists — shared with ADS)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course (ADS reference) |
| `course_code` | string | Denormalized |
| `title` | string | |
| `type` | enum | lesson, reading, video, document, slides, external, assignment |
| `module` | string | Grouping label (e.g., "Week 1", "Module 3") |
| `content` | string | Markdown body for lessons and readings |
| `file_url` | string | Uploaded file (PDF, slides, video) |
| `external_url` | string | External link for 'external' type |
| `duration_minutes` | number | Estimated time to complete |
| `order` | number | Display order |
| `status` | enum | draft, published |
| `institution_id` | string | Tenant scope |

#### Lesson *(Proposed Extension — Structured Lesson)*

| Field | Type | Notes |
|---|---|---|
| `material_id` | string | Parent `CourseMaterial` |
| `course_id` | string | Denormalized |
| `title` | string | |
| `summary` | string | Brief overview |
| `objectives` | array | Learning objectives |
| `sections` | array | Ordered content sections (heading, body, media) |
| `estimated_minutes` | number | |
| `prerequisite_lesson_ids` | array | Ordered prerequisites |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, archived |

#### Module *(Proposed Extension — Course Module)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course |
| `title` | string | e.g., "Module 3 — Linear Algebra" |
| `description` | string | |
| `order` | number | Display order |
| `lesson_ids` | array | Ordered lessons |
| `duration_minutes` | number | Total estimated time |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published |

#### Topic *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `lesson_id` | string | Parent lesson |
| `title` | string | |
| `content` | string | Markdown content |
| `order` | number | |
| `key_concepts` | array | Key terms and concepts |
| `institution_id` | string | Tenant scope |

#### Unit *(Proposed Extension — Content Unit)*

| Field | Type | Notes |
|---|---|---|
| `topic_id` | string | Parent topic |
| `title` | string | |
| `content_type` | enum | text, video, interactive, exercise |
| `content` | string | Markdown or embedded content |
| `file_url` | string | Media file |
| `duration_minutes` | number | |
| `order` | number | |
| `institution_id` | string | Tenant scope |

#### LearningResource *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `type` | enum | article, video, document, link, interactive |
| `url` | string | External or internal URL |
| `file_url` | string | Uploaded file |
| `description` | string | |
| `tags` | array | Topic tags |
| `difficulty` | enum | beginner, intermediate, advanced |
| `estimated_minutes` | number | |
| `created_by_id` | string | Owner (lecturer/student) |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, archived |

### 6.3 Study Tools

#### Flashcard *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `deck_name` | string | Deck grouping |
| `course_id` | string | Optional course reference |
| `front` | string | Question/prompt |
| `back` | string | Answer |
| `hint` | string | Optional hint |
| `tags` | array | Topic tags |
| `difficulty` | enum | easy, medium, hard |
| `interval_days` | number | Spaced repetition interval (SM-2) |
| `ease_factor` | number | SM-2 ease factor (default 2.5) |
| `repetition_count` | number | Times reviewed |
| `next_review_date` | string (date) | Next scheduled review |
| `last_reviewed_at` | string (datetime) | |
| `mastery_level` | enum | new, learning, familiar, mastered |

#### QuizAttempt *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `quiz_id` | string | Quiz reference |
| `student_id` | string | User reference |
| `answers` | array | Student responses |
| `score` | number | Raw score |
| `max_score` | number | |
| `percentage` | number | |
| `time_spent_minutes` | number | |
| `started_at` | string (datetime) | |
| `completed_at` | string (datetime) | |
| `status` | enum | in_progress, completed, abandoned |

#### PracticeTest *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Optional course reference |
| `title` | string | |
| `description` | string | |
| `questions` | array | Question bank (MCQ, short answer, essay) |
| `time_limit_minutes` | number | |
| `passing_score` | number | |
| `attempts_allowed` | number | 0 = unlimited |
| `shuffle_questions` | boolean | |
| `show_answers_after` | boolean | Reveal correct answers after submission |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, archived |

#### Assignment *(Exists — shared with ADS)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course |
| `title` | string | |
| `description` | string | |
| `type` | enum | homework, project, presentation, lab_report, quiz |
| `max_score` | number | |
| `weight_percent` | number | |
| `due_date` | string (datetime) | |
| `submission_type` | enum | file_upload, text, link, none |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, closed, graded |

### 6.4 Study Tracking

#### StudySession *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `course_id` | string | Optional course reference |
| `subject` | string | What was studied |
| `topic` | string | Specific topic |
| `duration_minutes` | number | |
| `session_type` | enum | reading, practice, review, flashcards, tutoring, group_study |
| `productivity_rating` | number | Self-rated 1-5 |
| `notes` | string | |
| `started_at` | string (datetime) | |
| `ended_at` | string (datetime) | |
| `focus_score` | number | AI-computed focus metric |

#### StudyGoal *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `title` | string | e.g., "Study 20 hours this week" |
| `description` | string | |
| `type` | enum | time_based, task_based, grade_based, streak_based |
| `target_value` | number | |
| `current_value` | number | |
| `unit` | string | hours, tasks, points, days |
| `deadline` | string (date) | |
| `status` | enum | active, achieved, missed, abandoned |

#### StudentGoal *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `title` | string | |
| `description` | string | |
| `category` | enum | academic, personal, career, wellness |
| `target_date` | string (date) | |
| `progress` | number | 0-100 |
| `milestones` | array | Sub-goals |
| `status` | enum | active, completed, paused, abandoned |

#### LearningProgress *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `material_id` | string | `CourseMaterial` reference |
| `course_id` | string | Denormalized |
| `progress_percent` | number | 0-100 |
| `time_spent_minutes` | number | |
| `last_accessed_at` | string (datetime) | |
| `completion_status` | enum | not_started, in_progress, completed |
| `completed_at` | string (datetime) | |
| `mastery_level` | enum | introduced, developing, proficient, mastered |
| `institution_id` | string | Tenant scope |

> **Note:** `CourseMaterialProgress` entity already exists for basic progress tracking. `LearningProgress` extends with mastery and time tracking.

#### CourseMaterialProgress *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `material_id` | string | `CourseMaterial` reference |
| `course_id` | string | |
| `user_id` | string | Student reference |
| `completed` | boolean | |
| `completed_at` | string (datetime) | |

### 6.5 Competency & Skills

#### Competency *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `course_id` | string | Optional course reference |
| `name` | string | e.g., "Object-Oriented Programming" |
| `description` | string | |
| `level` | enum | novice, beginner, intermediate, advanced, expert |
| `level_numeric` | number | 1-5 |
| `assessed_at` | string (datetime) | |
| `assessed_by` | string | Lecturer, AI, or self-assessment |
| `evidence` | array | Supporting assessment references |
| `institution_id` | string | Tenant scope |

#### Skill *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "Python Programming" |
| `category` | string | e.g., "Programming", "Communication" |
| `description` | string | |
| `related_competency_ids` | array | |
| `verified` | boolean | AI or lecturer verified |
| `institution_id` | string | Tenant scope |

#### LearningRecommendation *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `type` | enum | next_lesson, review_topic, practice_quiz, study_group, resource, tutoring |
| `title` | string | |
| `description` | string | |
| `resource_id` | string | Optional resource reference |
| `priority` | enum | low, medium, high, urgent |
| `reasoning` | string | Why this was recommended |
| `confidence` | number | 0-1 AI confidence |
| `generated_by` | string | AI agent or system |
| `actioned_at` | string (datetime) | When student acted on it |
| `status` | enum | pending, shown, actioned, dismissed |

### 6.6 Knowledge Management

#### Note *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `course_id` | string | Optional course reference |
| `title` | string | |
| `content` | string | Markdown content |
| `tags` | array | Topic tags |
| `linked_material_id` | string | Optional material reference |
| `ai_generated` | boolean | Whether AI assisted |
| `status` | enum | draft, published, archived |

#### StudentDocument *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `title` | string | |
| `description` | string | |
| `file_url` | string | Uploaded file |
| `file_type` | string | pdf, docx, image, etc. |
| `category` | enum | notes, assignment, reference, personal, study_guide |
| `tags` | array | |
| `course_id` | string | Optional course reference |
| `institution_id` | string | Tenant scope |
| `status` | enum | active, archived |

#### Citation *(Exists — shared with Research Domain)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `title` | string | Publication title |
| `authors` | array | Author list |
| `publication` | string | Journal/conference name |
| `year` | number | |
| `doi` | string | Digital Object Identifier |
| `url` | string | |
| `citation_format` | enum | apa, mla, chicago, harvard, ieee |
| `formatted_citation` | string | Pre-formatted citation string |
| `course_id` | string | Optional course reference |
| `tags` | array | |

#### Collection *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `description` | string | |
| `owner_id` | string | User reference |
| `items` | array | Referenced resources (notes, documents, citations) |
| `is_shared` | boolean | |
| `shared_with` | array | User IDs |
| `tags` | array | |

### 6.7 AI Tutoring & Study Groups

#### AITutor *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `course_id` | string | Optional course context |
| `topic` | string | What was discussed |
| `session_type` | enum | concept_explanation, problem_solving, review, practice |
| `messages` | array | Conversation history |
| `summary` | string | AI-generated session summary |
| `key_takeaways` | array | Main points learned |
| `duration_minutes` | number | |
| `started_at` | string (datetime) | |
| `ended_at` | string (datetime) | |
| `effectiveness_rating` | number | Student-rated 1-5 |
| `institution_id` | string | Tenant scope |

> **Note:** AI tutoring sessions are also tracked in `BudConversation` (AI Domain). `AITutor` extends with learning-specific metadata.

#### StudyGroup *(Exists — shared with Community/Academic)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `course_id` | string | Optional course reference |
| `description` | string | |
| `member_ids` | array | User references |
| `admin_id` | string | Group creator |
| `meeting_schedule` | object | Recurring meeting details |
| `focus_topics` | array | |
| `is_private` | boolean | |
| `institution_id` | string | Tenant scope |
| `status` | enum | active, inactive, archived |

### 6.8 Learning Analytics

#### LearningAnalytics *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `period` | string | e.g., "2024-W42", "2024-09" |
| `total_study_minutes` | number | |
| `sessions_count` | number | |
| `average_session_minutes` | number | |
| `streak_days` | number | Current streak |
| `longest_streak` | number | |
| `courses_studied` | array | Course IDs |
| `topics_covered` | array | |
| `flashcards_reviewed` | number | |
| `quizzes_completed` | number | |
| `average_quiz_score` | number | |
| `goals_achieved` | number | |
| `goals_total` | number | |
| `focus_trend` | array | Weekly focus scores |
| `institution_id` | string | Tenant scope |

> **Note:** Derived analytics — computed from `StudySession`, `QuizAttempt`, `StudyGoal` records. Not raw data; a read model.

### 6.9 Existing Supporting Entities

| Entity | Role |
|---|---|
| `Milestone` | Learning milestones within paths |
| `CourseMaterialProgress` | Basic material completion tracking |

---

## 7. Value Objects

Value objects are not persisted independently — they are embedded in entities or used transiently.

| Value Object | Type | Description |
|---|---|---|
| `LearningModule` | object | `{ title, type, summary, duration_minutes, completed }` — within `LearningPath.modules` |
| `ProgressPercent` | number | 0-100 completion metric |
| `MasteryLevel` | enum | introduced, developing, proficient, mastered |
| `StudyStreak` | number | Consecutive study days |
| `CitationFormat` | enum | apa, mla, chicago, harvard, ieee |
| `SpacedRepetitionState` | object | `{ interval_days, ease_factor, repetition_count, next_review_date }` |
| `CompetencyLevel` | enum | novice, beginner, intermediate, advanced, expert |
| `LearningObjective` | string | What the student should achieve |
| `FocusScore` | number | 0-100 AI-computed focus metric |
| `RecommendationConfidence` | number | 0-1 AI confidence in recommendation |
| `ContentType` | enum | text, video, audio, interactive, document, link |

---

## 8. Aggregates

### Aggregate 1: Learning Path

**Root:** `LearningPath`
**Members:** Ordered modules (embedded), linked `LearningGoal` records

**Invariants:**
- Modules are ordered; reordering preserves progress.
- Progress percent is derived from completed modules / total modules.
- Pausing a path preserves progress; resuming continues from last position.

### Aggregate 2: Course Material Delivery

**Root:** `CourseMaterial`
**Members:** `Lesson`, `Module`, `Topic`, `Unit` (structural), `CourseMaterialProgress`, `LearningProgress` (progress)

**Invariants:**
- Material belongs to exactly one course (ADS reference).
- Progress is per-student; one `CourseMaterialProgress` per (material, student) pair.
- Mastery level monotonically increases through practice (never auto-downgrades).

### Aggregate 3: Flashcard Deck

**Root:** `Flashcard` (deck root, identified by `deck_name` + `created_by_id`)
**Members:** All cards in the deck, `QuizAttempt` records for deck quizzes

**Invariants:**
- Spaced repetition state (interval, ease factor, next review) is per-card.
- Reviewing a card updates its SM-2 state.
- Mastery level is derived from repetition count + ease factor.

### Aggregate 4: Study Session

**Root:** `StudySession`
**Members:** Linked `StudyGoal` updates, `AITutor` session (if AI-assisted)

**Invariants:**
- Session duration = `ended_at` - `started_at`.
- Focus score is AI-computed from session patterns.
- Session contributes to streak calculation.

### Aggregate 5: Knowledge Collection

**Root:** `Collection`
**Members:** Referenced `Note`, `StudentDocument`, `Citation` items

**Invariants:**
- Items are references, not copies (single ownership preserved).
- Shared collections respect recipient RLS.

### Aggregate 6: AI Tutoring Session

**Root:** `AITutor`
**Members:** Conversation messages, `BudConversation` reference (AI Domain)

**Invariants:**
- Session is linked to a Bud conversation for AI context.
- Key takeaways are AI-generated at session end.
- Effectiveness rating is student-provided.

---

## 9. Domain Services

Domain services contain business logic that doesn't belong to a single entity.

| Service | Implementation | Responsibility |
|---|---|---|
| `LearningContentService` | `src/components/academics/CourseMaterialReader.jsx` | Serve and render learning content |
| `LearningPathService` | *(proposed)* `src/lib/learning/pathService.js` | Create, update, and track learning paths |
| `SpacedRepetitionService` | *(proposed)* `src/lib/learning/spacedRepetition.js` | SM-2 algorithm for flashcard scheduling |
| `StudySessionService` | *(proposed)* `src/lib/learning/studySessionService.js` | Track study sessions, calculate streaks |
| `ProgressTracker` | *(proposed)* `src/lib/learning/progressTracker.js` | Aggregate progress across materials and courses |
| `CompetencyAssessor` | *(proposed)* `src/lib/learning/competencyAssessor.js` | Assess and update competency levels |
| `RecommendationEngine` | `src/hooks/useAcademicRecommendations.js`, `src/lib/spark/recommendations/` | Generate personalized learning recommendations |
| `CitationManager` | `src/pages/study/CitationManager.jsx` | Manage bibliographic citations |
| `DocumentLibrary` | `src/pages/study/DocumentLibrary.jsx` | Manage personal document library |
| `KnowledgeSearch` | `src/lib/spark/knowledge/`, `src/lib/bud/actions/searchKnowledge.ts` | Search learning content and knowledge base |
| `AdaptiveLearning` | *(proposed)* `src/lib/learning/adaptiveEngine.js` | Adjust content difficulty based on performance |
| `LearningAnalyticsService` | *(proposed)* `src/lib/learning/analyticsService.js` | Compute learning analytics from raw data |

### Spark Intelligence Modules (AI Domain — LDS uses)

| Module | Path | Responsibility |
|---|---|---|
| `Learning Intelligence` | `src/lib/spark/learning/` | Learning-specific AI capabilities |
| `Summaries` | `src/lib/spark/intelligence/summaries/` | Content summarization |
| `Writing` | `src/lib/spark/intelligence/writing/` | Writing assistance |
| `Translation` | `src/lib/spark/intelligence/translation/` | Multi-language learning |
| `Personalization` | `src/lib/spark/intelligence/personalization/` | Personalized content |
| `Organization` | `src/lib/spark/intelligence/organization/` | Content organization |
| `Search` | `src/lib/spark/intelligence/search/` | Learning content search |
| `Knowledge` | `src/lib/spark/knowledge/` | Knowledge retrieval |
| `Memory` | `src/lib/spark/memory/` | Learning memory persistence |
| `Recommendations` | `src/lib/spark/recommendations/` | Learning recommendations |

---

## 10. Application Services

Application services orchestrate domain services for use-case flows.

| Service | Flow |
|---|---|
| `ContentDeliveryFlow` | Student opens material → check enrollment → render content → track progress → update completion |
| `LearningPathFlow` | Student creates path → AI suggests modules → student customizes → track progress → celebrate completion |
| `FlashcardReviewFlow` | Due cards retrieved → student reviews → SM-2 update → schedule next review → update mastery |
| `QuizFlow` | Student starts quiz → present questions → track time → score → show results → update analytics |
| `StudySessionFlow` | Student starts session → track time → optional AI focus scoring → end session → update streak → sync goals |
| `AssignmentAssistFlow` | Student asks for help → Bud provides guidance (not answers) → suggest resources → track interaction |
| `AITutoringFlow` | Student asks question → Bud responds with explanation → student rates effectiveness → store summary + takeaways |
| `CitationFlow` | Student enters source → format citation → add to collection → use in assignments |
| `DocumentUploadFlow` | Student uploads file → `UploadFile` → create `StudentDocument` → add to library/collection |
| `ProgressReviewFlow` | Student views dashboard → aggregate progress across courses → show mastery → recommend next steps |
| `RecommendationFlow` | AI analyzes performance → generate recommendations → rank by priority/confidence → present to student |
| `CompetencyAssessmentFlow` | AI/lecturer assesses competency → update level → record evidence → notify student |
| `AdaptiveLearningFlow` | AI detects struggling → reduce difficulty / suggest review → student practices → reassess |

---

## 11. Commands

Commands are write operations that change state.

| Command | Auth Requirement | Effect |
|---|---|---|
| `CreateLearningPath` | Student (own) | Creates `LearningPath` |
| `UpdateLearningPath` | Owner | Updates path modules + progress |
| `PauseLearningPath` | Owner | Sets status to paused |
| `CompleteLearningPath` | Owner / System | Sets status to completed, celebrates |
| `CreateLesson` | Lecturer / Admin | Creates `Lesson` under `CourseMaterial` |
| `CreateModule` | Lecturer / Admin | Creates `Module` under `Course` |
| `PublishCourseMaterial` | Lecturer / Admin | Publishes material for student access |
| `CreateFlashcard` | Student (own) / Lecturer | Creates `Flashcard` |
| `ReviewFlashcard` | Student (own) | Updates SM-2 state, schedules next review |
| `CreatePracticeTest` | Lecturer / Admin | Creates `PracticeTest` |
| `StartQuizAttempt` | Student (own) | Creates `QuizAttempt` |
| `SubmitQuizAttempt` | Student (own) | Submits attempt for scoring |
| `StartStudySession` | Student (own) | Creates `StudySession` |
| `EndStudySession` | Student (own) | Updates session with end time + focus score |
| `CreateStudyGoal` | Student (own) | Creates `StudyGoal` |
| `UpdateStudyGoal` | Owner | Updates progress toward goal |
| `AchieveStudyGoal` | Owner / System | Marks goal as achieved, celebrates |
| `SaveNote` | Student (own) | Creates/updates `Note` |
| `UploadDocument` | Student (own) | `UploadFile` → creates `StudentDocument` |
| `AddCitation` | Student (own) | Creates `Citation` |
| `CreateCollection` | Student (own) | Creates `Collection` |
| `ShareCollection` | Owner | Updates `Collection.shared_with` |
| `RequestAITutoring` | Student (own) | Starts `AITutor` session via Bud |
| `RateAITutoring` | Student (own) | Updates `AITutor.effectiveness_rating` |
| `AssessCompetency` | Lecturer / AI | Creates/updates `Competency` |
| `DismissRecommendation` | Student (own) | Updates `LearningRecommendation.status` |
| `ActionRecommendation` | Student (own) | Marks recommendation as actioned, routes to resource |

---

## 12. Queries

Queries are read operations that do not change state.

| Query | Access | Returns |
|---|---|---|
| `GetLearningPath` | Owner / Admin | Path with modules + progress |
| `ListLearningPaths` | Owner / Admin | Student's learning paths |
| `GetCourseMaterial` | Enrolled student / Admin | Material content |
| `ListLessons` | Enrolled student / Admin | Lessons for a module/course |
| `GetLesson` | Enrolled student / Admin | Lesson with sections |
| `GetDueFlashcards` | Owner | Cards due for review today |
| `GetFlashcardDeck` | Owner | Deck with all cards |
| `GetPracticeTest` | Enrolled student / Admin | Test with questions |
| `GetQuizAttempt` | Owner / Admin | Attempt details + score |
| `GetStudySessions` | Owner / Admin | Session history |
| `GetStudyStreak` | Owner | Current + longest streak |
| `GetStudyGoals` | Owner / Admin | Active + completed goals |
| `GetLearningProgress` | Owner / Admin | Progress across materials/courses |
| `GetMasteryLevel` | Owner / Admin | Competency mastery levels |
| `GetNotes` | Owner / Admin | Note library |
| `GetDocuments` | Owner / Admin | Document library |
| `GetCitations` | Owner / Admin | Citation library |
| `GetCollections` | Owner | Knowledge collections |
| `GetRecommendations` | Owner | Personalized learning recommendations |
| `GetLearningAnalytics` | Owner / Admin | Computed learning analytics |
| `GetCompetencies` | Owner / Admin | Competency profile |
| `GetAITutorHistory` | Owner / Admin | AI tutoring session history |
| `SearchKnowledge` | Authenticated | Knowledge base search via `InvokeLLM` |

---

## 13. Events

Events are published through entity realtime subscriptions.

| Event | Trigger | Consumers |
|---|---|---|
| `LearningPathCreated` | `LearningPath` created | AI (recommendations), Analytics |
| `LearningPathProgress` | `LearningPath.progress_percent` updated | AI (adaptive), Analytics, Notification (milestone) |
| `LearningPathCompleted` | Status → completed | Notification (achievement), AI (memory) |
| `CourseMaterialPublished` | `CourseMaterial` status → published | Notification (enrolled students), Learning |
| `LessonCompleted` | `CourseMaterialProgress.completed` → true | AI (progress context), Analytics, Notification (streak) |
| `FlashcardReviewed` | `Flashcard` SM-2 state updated | AI (spaced repetition), Analytics |
| `MasteryLevelChanged` | `Flashcard.mastery_level` or `LearningProgress.mastery_level` updated | AI (recommendations), Analytics |
| `QuizAttemptCompleted` | `QuizAttempt` status → completed | Analytics, AI (difficulty adjustment) |
| `StudySessionStarted` | `StudySession` created | AI (focus tracking) |
| `StudySessionEnded` | `StudySession.ended_at` set | Analytics (streak), AI (memory), Notification |
| `StudyStreakMilestone` | Streak reaches threshold | Notification (achievement), AI (celebration) |
| `StudyGoalAchieved` | `StudyGoal.status` → achieved | Notification (celebration), AI (memory) |
| `NoteSaved` | `Note` created/updated | AI (knowledge index) |
| `DocumentUploaded` | `StudentDocument` created | AI (knowledge index) |
| `CitationAdded` | `Citation` created | AI (knowledge index) |
| `RecommendationGenerated` | `LearningRecommendation` created | Notification (if high priority) |
| `RecommendationActioned` | `LearningRecommendation.status` → actioned | AI (effectiveness tracking) |
| `CompetencyAssessed` | `Competency` level updated | Notification, AI (recommendations), Analytics |
| `AITutorSessionEnded` | `AITutor.ended_at` set | AI (memory, summary), Analytics |

---

## 14. APIs

### Entity SDK (Primary)

```js
// Learning paths
base44.entities.LearningPath.list()
base44.entities.LearningPath.filter({ created_by_id: userId })
base44.entities.LearningPath.create({ title, modules, ... })
base44.entities.LearningPath.update(id, { progress_percent, status })

// Study sessions
base44.entities.StudySession.filter({ student_id: userId })
base44.entities.StudySession.create({ subject, duration_minutes, ... })

// Study goals
base44.entities.StudyGoal.filter({ student_id: userId, status: 'active' })
base44.entities.StudyGoal.update(id, { current_value, status })

// Flashcards
base44.entities.Flashcard.filter({ created_by_id: userId, deck_name })
base44.entities.Flashcard.filter({ next_review_date: { $lte: today } })

// Quiz attempts
base44.entities.QuizAttempt.filter({ student_id: userId })
base44.entities.QuizAttempt.create({ quiz_id, answers, ... })

// Notes
base44.entities.Note.filter({ student_id: userId })
base44.entities.Note.create({ title, content, ... })

// Citations
base44.entities.Citation.filter({ student_id: userId })

// Student documents
base44.entities.StudentDocument.filter({ student_id: userId })

// Collections
base44.entities.Collection.filter({ owner_id: userId })

// Course material progress
base44.entities.CourseMaterialProgress.filter({ user_id: userId })
base44.entities.CourseMaterialProgress.create({ material_id, user_id, ... })

// Milestones
base44.entities.Milestone.filter({ learning_path_id })
```

### Backend Functions

| Function | Purpose |
|---|---|
| `streakReminders` | Study streak notifications |
| `budReminders` | Bud study nudge notifications |
| `transcribeEpisode` | Audio → text for lecture content |
| `budNotificationEngine` | Bud notification dispatch (study reminders) |

### Core Integrations

| Integration | Purpose |
|---|---|
| `InvokeLLM` | AI tutoring, content generation, summarization, translation |
| `TranscribeAudio` | Lecture audio transcription |
| `UploadFile` | Document and material uploads |
| `ExtractDataFromUploadedFile` | Parse documents for notes/citations |
| `GenerateImage` | AI-generated study aids/diagrams |

---

## 15. Permissions

### RLS Patterns

| Pattern | Rule | Usage |
|---|---|---|
| **Student ownership** | `created_by_id: "{{user.id}}"` or `data.student_id: "{{user.id}}"` | All student-owned learning data |
| **Enrollment gate** | Enrollment exists for (student, course) | Content access |
| **Published status** | `data.status: "published"` | Public catalog access |
| **Tenant scope** | `data.institution_id: "{{user.data.institution_id}}"` | Institution-scoped content |
| **Role-based** | `user_condition: { role: "admin" }` | Administrative oversight |

### Permission Matrix

| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `LearningPath` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `LearningPlan` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `CourseMaterial` | Published / owner / admin | Admin / Lecturer | Owner / Admin | Owner / Admin |
| `Lesson` / `Module` / `Topic` / `Unit` | Enrolled / owner / admin | Admin / Lecturer | Owner / Admin | Admin |
| `LearningResource` | Published / owner / admin | Any (own) | Owner / Admin | Owner / Admin |
| `Flashcard` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `QuizAttempt` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `PracticeTest` | Enrolled / owner / admin | Admin / Lecturer | Owner / Admin | Admin |
| `StudySession` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `StudyGoal` / `StudentGoal` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `LearningProgress` | Owner / Admin | Owner (own) / System | Owner / Admin / System | Admin |
| `CourseMaterialProgress` | Owner / Admin | Owner (own) | Owner / Admin | Admin |
| `Competency` | Owner / Admin | Lecturer / AI / Admin | Lecturer / AI / Admin | Admin |
| `Skill` | Authenticated | Admin | Admin | Admin |
| `LearningRecommendation` | Owner / Admin | System (AI) | Owner (dismiss/action) | Admin |
| `AITutor` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `Note` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `StudentDocument` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `Citation` | Owner / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `Collection` | Owner / shared_with / Admin | Owner (own) | Owner / Admin | Owner / Admin |
| `LearningAnalytics` | Owner / Admin | System | System | Admin |

### AI-Specific Permissions

| AI Action | Permission |
|---|---|
| Generate learning content | `InvokeLLM` (Core integration) |
| Provide AI tutoring | Bud agent (`base44/agents/bud.jsonc`) |
| Assess competency | Lecturer or AI (via `InvokeLLM`) |
| Generate recommendations | Spark recommendations engine |
| Adjust difficulty | Adaptive learning engine (AI Domain) |
| Access student learning data | RLS-governed; AI reads via governed permissions |

---

## 16. Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| Study Streak Reminders | `scheduled` | Remind students to maintain study streaks |
| Bud Reminders | `scheduled` | Bud study nudge notifications |
| Bud Notification Engine | `scheduled` / `entity` | Dispatch learning-related notifications |
| Learning Path Milestone | `entity` (progress update) | Celebrate progress milestones |
| Due Flashcard Reminder | `scheduled` | Remind students of due flashcard reviews |
| Study Goal Deadline | `scheduled` | Remind students of approaching goal deadlines |
| Recommendation Refresh | `scheduled` | Regenerate learning recommendations periodically |

---

## 17. AI Interactions

### Bud Study Agent

The Bud Study agent (`base44/agents/study.jsonc`) is the primary AI interface for learning assistance.

| Intent | Bud Action | Authority Required |
|---|---|---|
| "Explain [concept]" | Provides explanation using course context + knowledge base | None |
| "Help me with this assignment" | Provides guidance and resources (not answers) | None |
| "Quiz me on [topic]" | Generates practice questions interactively | None |
| "What should I study next?" | Reads progress, generates recommendations | None |
| "Summarize this lesson" | Uses `InvokeLLM` to summarize content | None |
| "Create flashcards from my notes" | Extracts key terms, creates `Flashcard` records | None |
| "Translate this" | Uses `InvokeLLM` translation | None |
| "How am I doing in this course?" | Reads `LearningProgress`, summarizes performance | None |
| "I'm struggling with [topic]" | Adjusts difficulty, suggests review resources, offers tutoring | None |
| "Test my knowledge" | Generates adaptive practice test | None |

### AI Domain Components (Real Implementation)

The Learning Domain interacts with the AI Domain through these **real, existing components** (not mocks):

| Component | Implementation | Learning Domain Usage |
|---|---|---|
| **Bud** | `src/lib/bud/orchestrator.ts` + `src/components/bud/BudPanel.jsx` | Primary AI tutor interface; routes learning queries |
| **Spark** | `src/lib/spark/orchestrator.js` + `src/lib/spark/learning/` | Multi-agent orchestration; learning intelligence modules |
| **Oracle** | `src/lib/oracle/orchestrationEngine.js` + `verifyAuthorityCode` function | Governs executive learning actions (e.g., competency override) |
| **In-app Agents** | `base44/agents/study.jsonc`, `library.jsonc` | Specialist learning agents |
| **InvokeLLM** | Core integration | Direct LLM calls for content generation, summarization |
| **Spark Intelligence** | `src/lib/spark/intelligence/` (summaries, writing, translation, personalization, organization, search) | Learning-specific AI capabilities |
| **Spark Knowledge** | `src/lib/spark/knowledge/` | Knowledge retrieval for learning content |
| **Spark Memory** | `src/lib/spark/memory/` | Learning memory persistence |
| **Spark Recommendations** | `src/lib/spark/recommendations/` | Learning recommendation generation |

> **Note on AI Constitution compliance:** The Learning Domain does NOT directly instantiate AI providers. All AI interactions go through Bud → Spark → governed providers, per the AI Constitution. The Learning Domain provides context and data; the AI Domain owns the intelligence infrastructure.

### AI-Powered Learning Tools

| Tool | Location | Purpose |
|---|---|---|
| Assignment Assistant | `/study/assignment` | AI guidance for assignments (not completion) |
| Project Assistant | `/study/project` | AI guidance for projects |
| Research Assistant | `/study/research` | AI-powered literature search |
| Exam Preparation | `/study/exams` | AI exam coaching |
| Smart Notes | `/study/notes` | AI-enhanced note-taking |
| Flashcards (AI) | `/study/flashcards` | AI-generated flashcard decks |
| Practice Tests (AI) | `/study/practice` | AI-generated practice questions |
| Citation Manager | `/study/citations` | AI-assisted citation formatting |
| Document Library | `/study/library` | AI-indexed document search |
| Study Planner | `/study/planner` | AI-suggested study schedules |
| Learning Paths | `/study/paths` | AI-generated personalized paths |

---

## 18. Integration Points

| Integration | Direction | Mechanism |
|---|---|---|
| **Identity & Access (IAD)** | Bidirectional | LDS references `user_id`; IAD provides identity verification for personalized features |
| **Academic Domain (ADS)** | Bidirectional | LDS references `course_id`, `material_id`; ADS owns course structure and enrollment |
| **Research Domain** | Bidirectional | LDS owns citation tools; Research owns research lifecycle; shared `Citation` entity |
| **Community Domain** | Bidirectional | LDS provides learning content for study groups; Community owns social interaction |
| **Analytics Domain** | Outbound | LDS provides raw learning data (sessions, progress, mastery); Analytics computes insights |
| **AI Domain** | Bidirectional | LDS provides learning context + data; AI provides tutoring, recommendations, content generation |
| **Media Domain** | Bidirectional | LDS references file URLs; Media handles storage (`UploadFile`, `ExtractDataFromUploadedFile`) |
| **Workflow Domain** | Bidirectional | LDS events trigger workflows (streak reminders, recommendation refresh) |
| **Google Classroom** | Available | Not yet connected; available for course content sync |

---

## 19. Security Requirements

1. **Student ownership is enforced via RLS.** All learning data (`StudySession`, `Flashcard`, `Note`, etc.) is `created_by_id: "{{user.id}}"` or `data.student_id: "{{user.id}}"`.
2. **No cross-student data visibility.** Students cannot see other students' notes, progress, or study patterns without explicit sharing.
3. **Enrollment-gated content.** Learning materials require active enrollment (checked against ADS `Enrollment` or `CourseMaterialProgress`).
4. **AI interactions are governed.** Bud tutoring goes through the standard Spark orchestration; no direct LLM calls from Learning Domain code.
5. **Document uploads via `UploadFile`.** Never store large content (base64, PDFs) in entity fields — use file URLs.
6. **Shared collections respect RLS.** `Collection.shared_with` must include the accessing user's ID for shared access.
7. **Competency assessment is authority-governed.** AI-assessed competencies are marked as such; lecturer assessments require lecturer role; overrides require admin + authority code.
8. **Recommendation access is student-only.** Learning recommendations are personal; no peer visibility.
9. **AI tutoring transcripts are private.** `AITutor` messages are visible only to the student and admin — never to peers or lecturers without consent.
10. **Document library is private.** `StudentDocument` records are owner-only unless explicitly shared.

---

## 20. Privacy Requirements

1. **Student-centric data ownership.** Students own all their learning data — notes, flashcards, study sessions, progress.
2. **Study patterns are private.** Study times, focus scores, and struggling topics inform AI tutoring without exposing to peers or lecturers (without consent).
3. **AI tutoring is confidential.** What a student asks Bud is private; used only to improve that student's experience.
4. **Competency visibility is controlled.** Students can share competencies on their profile (opt-in); default is private.
5. **Learning analytics are personal.** `LearningAnalytics` is visible only to the student and admin — not broadcast.
6. **Document privacy.** Uploaded documents are private by default; sharing is explicit and revocable.
7. **Recommendation privacy.** AI-generated recommendations are personal; no peer visibility.
8. **Data retention.** Learning data is retained as long as the student account is active. On account deletion, learning data is cascaded (per IAD `deleteAccount`).
9. **No PII in analytics.** Learning analytics use aggregated patterns; no PII in cross-student dashboards.
10. **AI memory is governed.** Bud's memory of learning interactions follows AI Domain retention policies (`storeInteraction.ts`).

---

## 21. Audit Requirements

| Event | Logged To | Retention |
|---|---|---|
| Learning path completion | `BudMemory` (AI context) + `Notification` | Per policy |
| Study streak milestones | `Notification` (achievement) | Per policy |
| Competency assessment | `AuditLog` | Permanent |
| AI tutoring session | `BudConversation` (AI Domain) + `AITutor` | Per policy |
| Document upload | `StudentDocument` entity | Per policy |
| Collection sharing | `AuditLog` | Per policy |
| Recommendation dismissal/action | `LearningRecommendation` entity | Per policy |
| Authority code usage (competency override) | `AuditLog` via `logExecutiveAction` | Permanent |

> **Note:** Most learning data does not require permanent audit — it's personal study data. Audit is required only for: competency assessments (academic record), authority code usage, and shared collection changes.

---

## 22. Data Ownership

| Entity | Owner | Tenant-Scoped? |
|---|---|---|
| `LearningPath` | Student | No (personal) |
| `LearningPlan` | Student | No (personal) |
| `CourseMaterial` | Lecturer / Admin (shared with ADS) | Yes |
| `Lesson` / `Module` / `Topic` / `Unit` | Lecturer / Admin | Yes |
| `LearningResource` | Creator (lecturer or student) | Yes |
| `Flashcard` | Student | No (personal) |
| `QuizAttempt` | Student | No (personal) |
| `PracticeTest` | Lecturer / Admin | Yes |
| `StudySession` | Student | No (personal) |
| `StudyGoal` / `StudentGoal` | Student | No (personal) |
| `LearningProgress` | Student | Yes (institution-scoped) |
| `CourseMaterialProgress` | Student | Yes |
| `Competency` | Student (assessed by lecturer/AI) | Yes |
| `Skill` | Platform / Institution | Yes |
| `LearningRecommendation` | Student (generated by AI) | No (personal) |
| `AITutor` | Student | Yes |
| `Note` | Student | No (personal) |
| `StudentDocument` | Student | Yes |
| `Citation` | Student (shared with Research) | No (personal) |
| `Collection` | Student | No (personal) |
| `LearningAnalytics` | Student (computed) | Yes |
| `Milestone` | Student (within `LearningPath`) | No (personal) |

---

## 23. Lifecycle

### Learning Path Lifecycle

```
Created → Active → (Paused → Resumed) → Completed
                    ↓
                Abandoned
```

### Course Material Lifecycle

```
Draft → Published → Active → Archived
```

### Lesson Lifecycle

```
Draft → Published → (Updated) → Archived
```

### Flashcard Lifecycle (SM-2)

```
New → Learning → Familiar → Mastered
          ↓ (forgotten)
      Learning (reset interval)
```

### Quiz Attempt Lifecycle

```
Not Started → In Progress → Completed → (Reviewed)
                         ↓
                     Abandoned
```

### Study Session Lifecycle

```
Started → Active → Ended → (Analyzed)
```

### Study Goal Lifecycle

```
Created → Active → Achieved / Missed
                ↓
            Abandoned
```

### Competency Lifecycle

```
Novice → Beginner → Intermediate → Advanced → Expert
```

### Recommendation Lifecycle

```
Generated → Shown → Actioned / Dismissed
```

### AI Tutor Session Lifecycle

```
Started → Active (conversation) → Ended → (Rated)
```

### Document Lifecycle

```
Uploaded → Active → Archived
```

---

## 24. Extension Points

| Extension | Mechanism |
|---|---|
| New content types | `CourseMaterial.type` enum extension + renderer component |
| New study tools | Add page in `src/pages/study/` + domain service in `src/lib/learning/` |
| New AI study capabilities | `src/lib/spark/intelligence/` module |
| New spaced repetition algorithms | `src/lib/learning/spacedRepetition.js` (proposed) |
| New competency frameworks | `Competency` schema extension |
| New recommendation types | `LearningRecommendation.type` enum extension |
| New citation formats | `Citation.citation_format` enum + formatter |
| New learning analytics metrics | `LearningAnalytics` schema extension + `analyticsService.js` |
| External learning platform integrations | Backend functions with API keys |
| Adaptive learning algorithms | `src/lib/learning/adaptiveEngine.js` (proposed) |

---

## 25. Conformance Requirements

Any implementation claiming conformance to this specification must:

- [ ] Enforce student-ownership RLS on all learning entities (`created_by_id: "{{user.id}}"` or `data.student_id: "{{user.id}}"`)
- [ ] Gate content access on enrollment (checked against ADS)
- [ ] Use `UploadFile` for document/material uploads (never store blobs in entity fields)
- [ ] Route all AI interactions through Bud → Spark (no direct LLM calls from Learning Domain code)
- [ ] Implement spaced repetition using SM-2 or proven algorithm (not random scheduling)
- [ ] Track study streaks accurately (consecutive days with at least one `StudySession`)
- [ ] Generate recommendations based on demonstrated performance (not assumptions)
- [ ] Keep AI tutoring transcripts private (student + admin only)
- [ ] Support learning path pausing/resuming with progress preservation
- [ ] Compute mastery level monotonically (no auto-downgrade without cause)
- [ ] Provide accessibility-compliant content delivery
- [ ] Support multi-language learning via `InvokeLLM` translation
- [ ] Cascade learning data deletion on account deletion (via IAD `deleteAccount`)
- [ ] Never expose Oracle's command identifier publicly
- [ ] Never bypass the platform entity store (no custom database layer)
- [ ] Mark AI-assessed competencies distinctly from lecturer-assessed

---

## Implementation Mapping

### Existing Implementation

| Spec Concept | v1.0 Implementation |
|---|---|
| Learning paths | `LearningPath` entity + `src/pages/study/LearningPaths.jsx` |
| Study sessions | `StudySession` entity + `src/pages/study/StudySuite.jsx` |
| Study goals | `StudyGoal`, `StudentGoal` entities + `src/pages/study/StudyPlanner.jsx` |
| Flashcards | `Flashcard` entity + `src/pages/study/Flashcards.jsx` |
| Quiz attempts | `QuizAttempt` entity + `src/pages/study/PracticeTests.jsx` |
| Notes | `Note` entity + `src/pages/study/SmartNotes.jsx` |
| Citations | `Citation` entity + `src/pages/study/CitationManager.jsx` |
| Documents | `StudentDocument` entity + `src/pages/study/DocumentLibrary.jsx` |
| Collections | `Collection` entity + `src/components/knowledge/CollectionComposer.jsx` |
| Course materials | `CourseMaterial` entity + `src/components/academics/CourseMaterialReader.jsx` |
| Material progress | `CourseMaterialProgress` entity |
| Assignment assistant | `src/pages/study/AssignmentAssistant.jsx` |
| Project assistant | `src/pages/study/ProjectAssistant.jsx` |
| Research assistant | `src/pages/study/ResearchAssistant.jsx` |
| Exam preparation | `src/pages/study/ExamPreparation.jsx` |
| Study planner | `src/pages/study/StudyPlanner.jsx` |
| Study home | `src/pages/study/StudyHome.jsx` |
| Study suite | `src/pages/study/StudySuite.jsx` |
| Knowledge hub | `src/pages/knowledge/KnowledgeHub.jsx` + `src/lib/knowledge/` |
| Spark learning intelligence | `src/lib/spark/learning/` |
| Spark summaries | `src/lib/spark/intelligence/summaries/` |
| Spark writing | `src/lib/spark/intelligence/writing/` |
| Spark translation | `src/lib/spark/intelligence/translation/` |
| Spark personalization | `src/lib/spark/intelligence/personalization/` |
| Spark knowledge | `src/lib/spark/knowledge/` |
| Spark recommendations | `src/lib/spark/recommendations/` |
| Bud Study agent | `base44/agents/study.jsonc` |
| Library agent | `base44/agents/library.jsonc` |
| Streak reminders | `streakReminders` backend function + `Study Streak Reminders` workflow |
| Bud reminders | `budReminders` backend function + `Bud Reminders` workflow |

### Proposed Extensions (New Entities)

| Spec Concept | Proposed Entity | Priority |
|---|---|---|
| Learning Plan | `LearningPlan` | Medium — formalizes semester study plans |
| Lesson | `Lesson` | Medium — structures material content |
| Module | `Module` | Medium — groups lessons |
| Topic | `Topic` | Low — structures lesson sections |
| Unit | `Unit` | Low — granular content units |
| Learning Resource | `LearningResource` | Medium — external resource library |
| Practice Test | `PracticeTest` | High — formalizes practice tests |
| Learning Progress | `LearningProgress` | High — extends progress with mastery + time |
| Competency | `Competency` | Medium — formalizes skill tracking |
| Skill | `Skill` | Medium — skill taxonomy |
| Learning Recommendation | `LearningRecommendation` | Medium — formalizes AI recommendations |
| AI Tutor | `AITutor` | Medium — extends Bud conversations with learning metadata |
| Learning Analytics | `LearningAnalytics` | Medium — computed analytics read model |

> **Note:** These proposed extensions would be created as new entities in `base44/entities/` when the features are prioritized. The existing implementation uses `StudySession`, `StudyGoal`, `Flashcard`, `Note`, `Citation`, `StudentDocument`, and `Collection` entities that cover the core learning domain.

---

## Cross-Domain Dependencies

### Identity & Access (IAD)
- **LDS depends on IAD for:** User identity, identity verification status
- **IAD provides:** `user_id`, verification level
- **LDS provides to IAD:** Learning role context (student) for routing

### Academic Domain (ADS)
- **LDS depends on ADS for:** Course structure, enrollment validation
- **ADS depends on LDS for:** Content delivery, progress tracking
- **Shared entities:** `CourseMaterial` (ADS owns structure, LDS owns delivery), `CourseMaterialProgress` (LDS owns), `Assignment` (ADS owns assessment structure, LDS owns assistance)

### Research Domain
- **LDS depends on Research for:** Research project context
- **Research depends on LDS for:** Citation tools, research assistant
- **Shared entities:** `Citation` (LDS owns for study, Research owns for publications)

### Community Domain
- **LDS depends on Community for:** Study group social interaction
- **Community depends on LDS for:** Learning content for study groups
- **Shared entities:** `StudyGroup` (Community owns social, LDS provides learning context)

### Analytics Domain
- **LDS provides to Analytics:** Raw learning data (sessions, progress, mastery, quiz scores)
- **Analytics provides to LDS:** Derived insights (performance trends, at-risk detection)
- **Shared entities:** Learning analytics computed from LDS raw data

### AI Domain
- **LDS provides to AI:** Learning context, progress data, competency status
- **AI provides to LDS:** Tutoring (Bud), content generation (`InvokeLLM`), recommendations (Spark), adaptive difficulty, spaced repetition intelligence
- **Shared entities:** `BudConversation` (AI owns, LDS extends with `AITutor`), `BudMemory` (AI owns, LDS contributes learning context)

### Media Domain
- **LDS depends on Media for:** File storage (`UploadFile`), document extraction (`ExtractDataFromUploadedFile`), transcription (`TranscribeAudio`)
- **Media depends on LDS for:** Content context for knowledge indexing
- **Shared entities:** File URLs stored in LDS entities (`StudentDocument.file_url`, `CourseMaterial.file_url`)

### Workflow Domain
- **LDS events trigger workflows:** Streak reminders, recommendation refresh, goal deadlines
- **Workflow provides to LDS:** Automated reminders, scheduled analytics computation

---

## Known Limitations (Platform-Dependent)

1. **No real-time collaborative editing** — live document collaboration requires WebRTC (platform limitation)
2. **No offline-first study mode** — requires connectivity for AI tutoring and content sync
3. **AI-generated content quality** — depends on `InvokeLLM` model selection; quality varies by model
4. **Spaced repetition is client-triggered** — reviews happen when the student opens the app; no push notifications for due cards (would require workflow integration)
5. **Adaptive learning is heuristic** — true adaptive algorithms require more training data than available
6. **Multi-language support** — auto-detected by `InvokeLLM`; no explicit language preference per course

These are **deferred until platform support or prioritization**. The schema reserves the fields; they are non-functional until then.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.2 | 2026-08-01 | Added Learning Domain Specification (LDS) — Domain Architecture Extension to frozen v1.0. Defines learning content delivery, study tools, AI tutoring, spaced repetition, competency tracking, learning analytics, and personalized learning with DDD structure. |

---

*UNIBUD OS — Learning Domain Specification (LDS) v1.2*
*Extends frozen v1.0 master architecture. Single source of truth for learning content delivery, study tools, AI tutoring, progress tracking, and learning analytics.*
*Every learning entity, workflow, and AI interaction is mapped to its domain boundary.*