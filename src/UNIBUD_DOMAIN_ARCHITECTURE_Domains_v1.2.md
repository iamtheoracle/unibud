# UNIBUD OS — Domain Architecture: Domain Specifications

> **Revision:** v1.2 · **Date:** 2026-08-01
> **Parent:** [Domain Architecture Specification](./UNIBUD_DOMAIN_ARCHITECTURE_v1.2.md)
>
> This file contains the detailed specifications for all 12 core domains. Each domain is mapped to its **existing implementation** — entities, services, pages, and backend functions.

---

# 1. Identity & Access Domain

### Purpose
Manage who users are, what they can do, and which institution they belong to.

### Responsibilities
- User identity, registration, authentication, session management
- Role-based access control (RBAC) and authority code verification
- Institution (tenant) management and tenant scoping
- Student identity verification and identifiers
- Consent and data privacy management

### Scope
**In scope:** User identity, roles, institutions, devices, consent, KYC, verification requests.
**Out of scope:** Academic records (Academic domain), social profiles (Community domain), wallet balances (Administration/Finance).

### Bounded Context
Identity is the root context. All other domains reference `user_id` or `institution_id` but do not own user or institution records.

### Canonical Entities
| Entity | Role |
|---|---|
| `User` (built-in) | id, email, full_name, role |
| `Institution` | Tenant root |
| `StudentIdentifier` | Matriculation numbers, student IDs |
| `StudentRecord` | Academic record summary |
| `VerificationRequest` | Identity verification workflow |
| `KYCRecord` | Financial identity verification |
| `ConsentLink` | Scoped consent invitations |
| `Device` | Trusted device registry |
| `Role` | RBAC role definitions |
| `OperatorRole` | Operator-specific role assignments |
| `OperatorAssignment` | Task routing for operators |
| `ApiKey` | API key management |

### Value Objects
- `AuthorityCode` — hash-verified, replay-protected executive token (`authorityCodes.js`)
- `SessionToken` — platform-owned auth token
- `TenantScope` — `institution_id` scoping value

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `UserAggregate` | `User` | User + their `StudentIdentifier` + `Device` records |
| `InstitutionAggregate` | `Institution` | Institution + tenant-scoped config |
| `VerificationAggregate` | `VerificationRequest` | Request + supporting documents |

### Domain Services
- `src/lib/auth/oracleRouter.js` — role-based portal routing
- `src/lib/auth/oracleGuard.js` — Oracle workspace guard
- `src/lib/oracle/authorityCodes.js` — 27 authority codes, 5 tiers
- `src/lib/oracle/authorityLevels.js` — 16-level hierarchy
- `src/lib/identity/profileService.js` — profile CRUD
- `src/lib/identity/useIdentity.js` — identity data hooks
- `src/lib/identity/useAcademicTimeline.js` — identity timeline
- `src/lib/matriculationPrivacy.js` — academic record visibility rules
- `src/lib/institution/roles.js` — institution role definitions

### Application Services
- `src/components/auth/OracleWorkspaceGuard.jsx` — gates admin/operator/lecturer portals
- `src/components/ProtectedRoute.jsx` — route-level auth guard
- `src/lib/AuthContext.jsx` — auth state provider
- `src/components/auth/AuthLogo.jsx` — branded auth UI

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `verifyAuthorityCode` | Hash-verify executive authority codes |
| `logExecutiveAction` | Audit-log executive actions |
| `validatePlatformAccess` | Platform access validation |
| `deleteAccount` | Account deletion with re-auth |
| `updateProfile` | Profile update handler |
| `socialProfile` | Social profile resolution |
| `trustProfile` | Trust score + verification profile |
| `studentSearch` | Student search (admin) |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `User` create/update | Platform auth | AI domain (memory init), Community (profile) |
| `Institution` create | Institution onboarding | Academic, Administration |
| `VerificationRequest` update | Identity verification | Administration (KYC) |
| `ConsentLink` create/expire | Consent system | All domains (invitation) |

### Commands
| Command | Handler |
|---|---|
| `RegisterUser` | `base44.auth.register` → OTP → verifyOtp → setToken |
| `LoginUser` | `base44.auth.loginViaEmailPassword` |
| `LoginWithProvider` | `base44.auth.loginWithProvider` |
| `Logout` | `base44.auth.logout` |
| `InviteUser` | `base44.users.inviteUser(email, role)` |
| `VerifyAuthorityCode` | `verifyAuthorityCode` function |
| `RequestPasswordReset` | `base44.auth.resetPasswordRequest` |
| `ResetPassword` | `base44.auth.resetPassword` |
| `DeleteAccount` | `deleteAccount` function |

### Queries
| Query | Handler |
|---|---|
| `GetCurrentUser` | `base44.auth.me()` |
| `IsAuthenticated` | `base44.auth.isAuthenticated()` |
| `ListUsers` | `base44.entities.User.list()` (admin-only) |
| `GetInstitution` | `base44.entities.Institution.get(id)` |
| `GetStudentIdentifiers` | `base44.entities.StudentIdentifier.filter({user_id})` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `User` (self) | ✅ | ✅ (register) | ✅ (self) | ✅ (self, re-auth) |
| `User` (others) | Admin only | — | Admin only | Admin only |
| `Institution` | ✅ | Admin | Admin | Admin |
| `StudentIdentifier` | Owner / Admin | Owner | Admin | Admin |
| `AuthorityCode` | — | — | `verifyAuthorityCode` (hash-verified) | — |
| `ApiKey` | Admin | Admin | Admin | Admin |

RLS pattern: `user_condition: { role: "admin" }` for admin operations; `created_by_id: "{{user.id}}"` for ownership.

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Welcome New Student | `app_user_auth` (signup) | Initialize Bud memory, send welcome |
| University Connect Background Sync | `scheduled` | Sync institution identity data |

### AI Interactions
- Bud uses identity context for personalized responses (`buildContext.ts`)
- Oracle authority codes are AI-verifiable (`verifyAuthorityCode`)
- Memory initialization on new user (`welcomeNewStudent` function)

### Integrations
- Google OAuth (login provider)
- Platform auth backend (token/session management — platform-owned)

### Data Ownership
- `User` → Identity domain (built-in, platform-owned)
- `Institution` → Identity domain
- All other domains reference `user_id` / `institution_id` but never own these entities

### Security Considerations
- "Keep me signed in" never bypasses security for sensitive actions (re-auth required)
- Authority codes are hash-verified with replay protection
- `matriculationPrivacy.js` governs academic record visibility
- Device trust is platform-dependent (deferred)
- MFA/biometric: platform-dependent (deferred)

### Audit Requirements
- Every authority code verification → `AuditLog` via `logExecutiveAction`
- Account deletion → `AuditLog`
- Role/permission changes → `AuditLog`
- Login events → platform-owned session logs

### Extension Points
- New identity providers → `base44.auth.loginWithProvider` + `ConnectedAccounts`
- New authority codes → `authorityCodes.js` + `verifyAuthorityCode`
- New verification types → `VerificationRequest` entity + composer component

---

# 2. Academic Domain

### Purpose
Manage the academic structure of a university — from faculties down to individual course enrollment and grades.

### Responsibilities
- Faculty/department/programme hierarchy
- Course catalog and curriculum management
- Student enrollment and registration
- Timetable and academic calendar
- Attendance tracking
- Assessments, exams, and grading
- Results and academic records
- Office hours

### Scope
**In scope:** Courses, enrollment, timetable, attendance, exams, grades, academic calendar, office hours.
**Out of scope:** Learning content delivery (Learning domain), social study groups (Community domain).

### Bounded Context
The Academic domain owns the structural definition of what is taught and who is enrolled. Learning content (materials, lessons) is owned by the Learning domain but references `Course`.

### Canonical Entities
`Course`, `CourseMaterial`, `CourseMaterialProgress`, `Assignment`, `Project`, `FYPProject`, `Exam`, `ExamPaper`, `ExamQuestion`, `ExamAttempt`, `ExamCertificate`, `TimetableEntry`, `InstitutionTimetable`, `AttendanceRecord`, `AttendanceSession`, `LiveClass`, `LiveRecording`, `StudentGrade`, `Grade`, `OfficeHoursSlot`, `OfficeHoursBooking`, `AcademicTimelineEntry`, `StaffAnnouncement`, `AnnouncementRead`, `Admission`, `Staff`

### Value Objects
- `CourseCode` — normalized course identifier (`courseNormalizer.js`)
- `GPAScale` — GPA calculation rules (`gpaScale.js`)
- `TimeSlot` — start_time + end_time + date
- `AcademicSession` — semester + year
- `EnrollmentStatus` — active / withdrawn / completed

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `CourseAggregate` | `Course` | Course + its `CourseMaterial` entries |
| `EnrollmentAggregate` | (via `CourseMaterialProgress`) | Student + course + progress records |
| `ExamAggregate` | `Exam` | Exam + `ExamPaper` + `ExamQuestion` entries |
| `TimetableAggregate` | `InstitutionTimetable` | Institution + all `TimetableEntry` records |
| `OfficeHoursAggregate` | `OfficeHoursSlot` | Slot + its `OfficeHoursBooking` records |

### Domain Services
- `src/lib/academic/academicApi.js` — academic data repository wrapper
- `src/lib/academic/useAcademicData.js` — academic data hooks
- `src/lib/academic/reportEngine.js` — GPA, performance, study analytics
- `src/lib/academic/courseNormalizer.js` — course code normalization
- `src/lib/academic/gpaScale.js` — GPA calculation
- `src/lib/academic/registry.js` — academic module registry
- `src/lib/academics/registry.js` — academic section registry
- `src/lib/attendance/useSmartAttendance.js` — smart attendance
- `src/lib/exam/grading.js` — exam grading logic
- `src/lib/exam/examTypes.js` — exam type definitions
- `src/hooks/useAcademicRecommendations.js` — AI academic recommendations

### Application Services
- `src/pages/academics/` — AcademicHub, Courses, CourseSpace, Timetable, Calendar, Assignments, Projects, Exams, Attendance, Results, SummaryReport, OfficeHours, StudySessions, Notes, UnifiedAgenda
- `src/pages/exam/` — ExamHub, ExamStart, ExamTaker, ExamResult, ExamAnalytics, ExamCoach, ExamAuthor
- `src/pages/lecturer/LecturerPortal.jsx` — lecturer academic management
- `src/components/lecturer/sections/` — 14 lecturer sections
- `src/components/academics/report/` — report components (charts, metrics, export)

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `examReminders` | Exam countdown notifications |
| `googleCalendarSync` | Sync academic calendar with Google |
| `studyGroupEventBridge` | Study group academic event bridging |
| `activateAnnouncements` | Activate scheduled staff announcements |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `Course` create/update | Academic | Learning (materials), Community (study groups) |
| `Assignment` create/update | Academic | Workflow (deadline reminders), Notification |
| `ExamAttempt` create | Academic | Analytics (exam analytics), AI (exam coach) |
| `AttendanceRecord` create | Academic | Administration (compliance), Analytics |
| `StaffAnnouncement` publish | Academic | Notification (activateAnnouncements workflow) |

### Commands
| Command | Handler |
|---|---|
| `CreateCourse` | `base44.entities.Course.create` |
| `EnrollStudent` | `base44.entities.CourseMaterialProgress.create` |
| `CreateAssignment` | `base44.entities.Assignment.create` |
| `SubmitExamAttempt` | `base44.entities.ExamAttempt.create` |
| `RecordAttendance` | `base44.entities.AttendanceRecord.create` |
| `PublishGrade` | `base44.entities.StudentGrade.create` |
| `BookOfficeHours` | `base44.entities.OfficeHoursBooking.create` |
| `PublishAnnouncement` | `base44.entities.StaffAnnouncement.create` |

### Queries
| Query | Handler |
|---|---|
| `ListCourses` | `base44.entities.Course.list()` |
| `GetCourse` | `base44.entities.Course.get(id)` |
| `ListAssignments` | `base44.entities.Assignment.filter({course_id})` |
| `GetTimetable` | `base44.entities.TimetableEntry.filter({institution_id})` |
| `GetStudentGrades` | `base44.entities.StudentGrade.filter({student_id})` |
| `GetExamAttempt` | `base44.entities.ExamAttempt.get(id)` |
| `GenerateReport` | `reportEngine.js` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Course` | Published / owner / admin | Admin / Lecturer | Admin / Lecturer | Admin |
| `CourseMaterial` | Published / owner / admin | Admin / Lecturer | Owner / Admin | Owner / Admin |
| `Assignment` | Owner / admin (RLS) | Admin / Lecturer | Owner / Admin | Owner / Admin |
| `ExamAttempt` | Student owner / admin | Student (own) | Admin | Admin |
| `StudentGrade` | Student (own) / admin / lecturer | Admin / Lecturer | Admin / Lecturer | Admin |
| `AttendanceRecord` | Student (own) / admin / lecturer | Admin / Lecturer | Admin | Admin |
| `OfficeHoursSlot` | Open / owner / admin | Lecturer / Admin | Owner / Admin | Owner / Admin |

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Deadline Reminders | `scheduled` | Assignment deadline notifications |
| Exam Countdown | `scheduled` | Exam countdown notifications |
| Activate Scheduled Announcements | `scheduled` | Staff announcement activation |
| Study Group Message/Task Notifications | `entity` | Academic study group messaging |

### AI Interactions
- Bud Study agent (`base44/agents/study.jsonc`) — academic assistance
- Exam Coach (`/exam/coach`) — AI exam preparation
- Assignment Assistant (`/study/assignment`) — AI assignment help
- Report engine uses LLM for insights (`reportEngine.js`)

### Integrations
- Google Calendar (academic calendar sync) — authorized connector
- Google Classroom (available, not yet connected)

### Data Ownership
- `Course`, `Assignment`, `Exam`, `TimetableEntry`, `AttendanceRecord`, `StudentGrade` → Academic domain
- `CourseMaterial` → shared with Learning domain (Academic owns structure, Learning owns delivery)

### Security Considerations
- Grades and attendance: student-scoped RLS (`data.student_id: "{{user.id}}"`)
- Lecturer operations: `created_by_id` or lecturer_id matching
- Matriculation privacy: `matriculationPrivacy.js`
- Exam attempts: student can only access own attempts

### Audit Requirements
- Grade publication and modifications → `AuditLog`
- Exam attempt submission → `SparkExecutionLog` (if AI-graded)
- Attendance modifications → `AuditLog`
- Timetable changes → `AuditLog`

### Extension Points
- New assessment types → `ExamQuestion` schema extension + grading logic
- New attendance methods (biometric, QR) → `AttendanceSession` + `useSmartAttendance`
- New report types → `reportEngine.js` + report components
- New curriculum structures → `Course` schema + `academicApi.js`

---

# 3. Learning Domain

### Purpose
Deliver and track learning content, provide AI-powered study tools, and manage the personal learning journey.

### Responsibilities
- Learning content delivery (lessons, readings, videos, documents)
- Assignment assistance and project guidance
- Study planning and learning paths
- Flashcards, quizzes, practice tests
- Smart notes and research assistance
- Citation management, document library
- Progress tracking and recommendations

### Scope
**In scope:** Learning content delivery, study tools, AI tutoring, learning paths, progress.
**Out of scope:** Course structure (Academic domain), social study groups (Community domain), research projects (Research domain).

### Bounded Context
The Learning domain owns *how* students learn. It references `Course` from the Academic domain but owns the delivery and progress mechanisms.

### Canonical Entities
`LearningPath`, `StudySession`, `StudyGoal`, `StudentGoal`, `Flashcard`, `QuizAttempt`, `Citation`, `Milestone`, `Note`, `StudentDocument`

### Value Objects
- `LearningModule` — title + type + duration + completed (within `LearningPath.modules`)
- `ProgressPercent` — 0-100 completion metric
- `StudyStreak` — consecutive study days
- `CitationFormat` — APA, MLA, Chicago, etc.

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `LearningPathAggregate` | `LearningPath` | Path + its ordered modules |
| `StudyAggregate` | `StudySession` | Session + linked goals + milestones |
| `FlashcardDeckAggregate` | `Flashcard` (deck root) | Deck + cards + quiz attempts |

### Domain Services
- `src/lib/spark/learning/` — learning intelligence (interface + local)
- `src/lib/spark/intelligence/summaries/` — content summarization
- `src/lib/spark/intelligence/writing/` — writing assistance
- `src/lib/spark/intelligence/translation/` — translation for learning
- `src/lib/spark/intelligence/personalization/` — personalized learning
- `src/lib/spark/intelligence/organization/` — content organization
- `src/lib/spark/knowledge/` — knowledge retrieval
- `src/hooks/useAcademicRecommendations.js` — learning recommendations

### Application Services
- `src/pages/study/` — StudyHome, StudySuite, StudyPlanner, LearningPaths, AssignmentAssistant, ProjectAssistant, SmartNotes, ResearchAssistant, ExamPreparation, Flashcards, PracticeTests, CitationManager, DocumentLibrary
- `src/components/study/` — StudyBuddyCard, StudyFocusTimer, StudyTodayLearning, StudyContinue, etc.

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `streakReminders` | Study streak notifications |
| `budReminders` | Bud study reminders |
| `transcribeEpisode` | Audio → text for learning content |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `LearningPath` update | Learning | AI (recommendations), Analytics |
| `StudySession` create | Learning | Analytics (study streaks), AI (memory) |
| `Flashcard` review | Learning | AI (spaced repetition), Analytics |
| `QuizAttempt` create | Learning | Analytics, AI (difficulty adjustment) |

### Commands
| Command | Handler |
|---|---|
| `CreateLearningPath` | `base44.entities.LearningPath.create` |
| `UpdateModuleProgress` | `base44.entities.LearningPath.update` (modules array) |
| `StartStudySession` | `base44.entities.StudySession.create` |
| `CreateFlashcard` | `base44.entities.Flashcard.create` |
| `SubmitQuiz` | `base44.entities.QuizAttempt.create` |
| `SaveNote` | `base44.entities.Note.create/update` |
| `AddCitation` | `base44.entities.Citation.create` |

### Permissions
All learning entities follow: Owner / admin for read, Owner (own) for create, Owner / Admin for update, Owner / Admin for delete. RLS: `created_by_id: "{{user.id}}"`.

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Study Streak Reminders | `scheduled` | Study streak notifications |
| Bud Reminders | `scheduled` | Bud study nudge notifications |

### AI Interactions
- Bud Study agent — academic/study assistance
- LLM-powered content summarization (`spark/intelligence/summaries`)
- AI writing assistance (`spark/intelligence/writing`)
- Spaced repetition algorithm (Flashcards)
- AI-powered learning path generation

### Integrations
- `InvokeLLM` — content generation, summarization, translation
- `TranscribeAudio` — lecture transcription
- `ExtractDataFromUploadedFile` — document parsing for notes

### Data Ownership
- All learning entities → Learning domain
- `CourseMaterialProgress` → shared (Academic owns course structure, Learning owns progress)

### Security Considerations
- All learning data is student-owned (`created_by_id: "{{user.id}}"`)
- No cross-student data visibility (RLS enforced)
- Document uploads via `UploadFile` (not stored in entity fields)

### Extension Points
- New learning tool types → add to `StudySuite` + new page in `src/pages/study/`
- New AI study capabilities → `src/lib/spark/intelligence/` modules
- New spaced repetition algorithms → `Flashcard` logic

---

# 4. Research Domain

### Purpose
Support academic research — from project inception through publication, literature review, and knowledge discovery.

### Responsibilities
- Research project management
- Publication tracking and citations
- Literature review and knowledge discovery
- Research collaboration
- AI-powered research assistance

### Scope
**In scope:** Research projects, publications, citations, literature review, research AI.
**Out of scope:** Course assignments (Academic/Learning), FYP administration (Academic).

### Bounded Context
Research is a specialized academic context. It references `User` for researchers and `Institution` for affiliation but owns the research lifecycle.

### Canonical Entities
`ResearchProject`, `Citation` (shared with Learning), `FYPProject` (shared with Academic)

### Value Objects
- `PublicationMeta` — title, authors, journal, year, DOI
- `ResearchStatus` — proposed / active / completed / published
- `CollaboratorRole` — PI / co-investigator / research assistant

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `ResearchProjectAggregate` | `ResearchProject` | Project + collaborators + milestones |

### Domain Services
- `src/lib/spark/knowledge/` — knowledge discovery and retrieval
- `src/lib/spark/intelligence/search/` — research search

### Application Services
- `src/pages/ResearchHub.jsx` — research hub page
- `src/pages/study/ResearchAssistant.jsx` — AI research assistant
- `src/pages/study/CitationManager.jsx` — citation management

### Events
| Event | Source | Consumed By |
|---|---|---|
| `ResearchProject` create/update | Research | Academic (FYP), Analytics |

### Commands
| Command | Handler |
|---|---|
| `CreateResearchProject` | `base44.entities.ResearchProject.create` |
| `AddCollaborator` | `base44.entities.ResearchProject.update` |
| `AddCitation` | `base44.entities.Citation.create` |
| `UpdatePublicationStatus` | `base44.entities.ResearchProject.update` |

### Queries
| Query | Handler |
|---|---|
| `ListResearchProjects` | `base44.entities.ResearchProject.list()` |
| `SearchLiterature` | `InvokeLLM` with `add_context_from_internet: true` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `ResearchProject` | Owner / members / admin | Owner (own) | Owner / Admin | Owner / Admin |
| `Citation` | Owner / admin | Owner (own) | Owner / Admin | Owner / Admin |

### AI Interactions
- Bud research assistance via `InvokeLLM` with web search
- Knowledge discovery via `spark/knowledge/`
- Literature search with `add_context_from_internet: true`

### Integrations
- `InvokeLLM` with web context for literature search
- Google Scholar (via web search context)

### Data Ownership
- `ResearchProject` → Research domain
- `Citation` → shared (Learning for study, Research for publications)
- `FYPProject` → shared (Academic for FYP admin, Research for research)

### Extension Points
- New research tools → `src/pages/study/` + new research assistant capability
- External database integrations → backend functions with API keys

---

# 5. Community Domain

### Purpose
Manage the social fabric of campus life — connections, conversations, communities, and social content.

### Responsibilities
- Social feed (Quad), short-form video (Shorts), stories
- Podcasts, messaging and conversations
- Communities and clubs, marketplace, lost & found
- Friend connections and following, social discovery
- Content moderation and trust

### Scope
**In scope:** Social content, messaging, communities, marketplace, connections, moderation.
**Out of scope:** Academic study groups (Community owns the social layer, Academic owns the study content), campus events (Campus domain).

### Bounded Context
The Community domain owns social interactions. It references `User` for identity but owns all social graph and content.

### Canonical Entities
`QuadPost`, `QuadComment`, `ShortVideo`, `ShortVideoComment`, `Story`, `StoryView`, `StoryReply`, `Podcast`, `PodcastEpisode`, `PodcastListen`, `Conversation`, `Message`, `Community`, `Club` (shared with Campus), `MarketplaceListing`, `MarketplaceReview`, `LostFoundItem` (shared with Campus), `FriendRequest`, `SocialConnection`, `Follow`, `ContentReport`, `TrustScore`, `Celebration`, `CampusTradition`, `StudentAchievement`, `ClassLeadership`, `StudentGovernmentBody`, `Challenge`, `DigitalBadge`

### Value Objects
- `SocialGraph` — follower/following relationships
- `TrustRating` — 0-100 trust score
- `ModerationStatus` — pending / approved / removed
- `StoryExpiry` — 24-hour TTL

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `ConversationAggregate` | `Conversation` | Conversation + its `Message` records |
| `CommunityAggregate` | `Community` | Community + members + posts |
| `MarketplaceListingAggregate` | `MarketplaceListing` | Listing + reviews |
| `StoryAggregate` | `Story` | Story + views + replies |

### Domain Services
- `src/lib/social/socialApi.js`, `useSocialData.js`, `useFriends.js`, `engines.js`
- `src/lib/communication/useSmartInbox.js`, `sparkComm.js`, `registry.js`
- `src/lib/discovery/useFollow.js`
- `src/lib/companyIdentity.js`

### Application Services
- `src/pages/` — Quad, Shorts, Messages, Communities, CommunityDetail, Clubs, Marketplace, LostFound, Discover, Connect, Services, Square, Scholar, Lens
- `src/pages/social/` — SocialHub, ForYou, Friends, ProfileView
- `src/pages/podcasts/` — Podcasts, PodcastShow
- `src/pages/creator/CreatorStudio.jsx`
- `src/pages/discovery/Following.jsx`
- `src/components/messaging/`, `src/components/quad/`, `src/components/shorts/`, `src/components/stories/`, `src/components/podcast/`, `src/components/marketplace/`, `src/components/social/`, `src/components/community/`, `src/components/discover/`, `src/components/connect/`

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `socialProfile` | Social profile resolution |
| `trustProfile` | Trust score profile |
| `transcribeEpisode` | Podcast episode transcription |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `Message` create | Community | Notification, AI (Bud context) |
| `QuadPost` create | Community | Notification (mentions), Analytics |
| `Conversation` update | Community | Notification (new conversation) |
| `FriendRequest` create | Community | Notification |
| `MarketplaceListing` create | Community | Notification (watchlist) |
| `ContentReport` create | Community | Administration (moderation) |
| `PodcastEpisode` create | Community | Notification (subscribers) |

### Commands
| Command | Handler |
|---|---|
| `CreatePost` | `base44.entities.QuadPost.create` |
| `SendMessage` | `base44.entities.Message.create` |
| `CreateConversation` | `base44.entities.Conversation.create` |
| `JoinCommunity` | `base44.entities.Community.update` (members) |
| `CreateMarketplaceListing` | `base44.entities.MarketplaceListing.create` |
| `SendFriendRequest` | `base44.entities.FriendRequest.create` |
| `FollowUser` | `base44.entities.Follow.create` |
| `ReportContent` | `base44.entities.ContentReport.create` |
| `UploadShort` | `base44.entities.ShortVideo.create` (after UploadFile) |
| `PublishStory` | `base44.entities.Story.create` |
| `PublishPodcast` | `base44.entities.Podcast.create` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Message` | Participant / admin | Participant | Author / Admin | Author / Admin |
| `Conversation` | Participant / admin | Any | Participant / Admin | Admin |
| `QuadPost` | Public (published) | Any | Author / Admin | Author / Admin |
| `Community` | Public / member | Any | Owner / Admin | Owner / Admin |
| `MarketplaceListing` | Public (available) | Any | Owner / Admin | Owner / Admin |
| `FriendRequest` | Sender / recipient | Sender | Sender / Recipient | Sender / Admin |
| `ContentReport` | Reporter / admin | Any | Admin | Admin |
| `TrustScore` | Owner / admin | System | Admin | Admin |

### AI Interactions
- Bud Quad agent (`base44/agents/quad.jsonc`) — social feed intelligence
- Bud Campus agent (`base44/agents/campus.jsonc`) — campus social life
- Social AI (`src/components/social/SocialAI.jsx`) — social insights
- `InvokeLLM` for content moderation assistance
- Trust score calculation (`trustProfile` function)

### Integrations
- `UploadFile` for media (photos, videos, audio)
- `GenerateImage` for AI-generated content
- `TranscribeAudio` for podcast transcription
- TikTok connector (for content distribution — available)
- Discord connector (for community sync — available)

### Data Ownership
- All social content → Community domain
- `User` reference only (Identity owns user records)
- `CampusEvent` reference (Campus domain owns events)

### Security Considerations
- Messages: participant-scoped RLS
- Content moderation: `ContentReport` + `TrustScore`
- Marketplace: trust scores for buyer/seller safety
- Stories: 24-hour TTL (client-side expiry)
- Direct messages: RLS on `Conversation` participants

### Audit Requirements
- Content reports → `ContentReport` entity + admin review
- Trust score changes → `AuditLog`
- Marketplace transactions → `FinancialTransaction` (Administration)
- Community moderation actions → `AuditLog`

### Extension Points
- New content types → new entity + feed integration in `engines.js`
- New social platforms → connector + `socialApi.js` adapter
- New moderation tools → `ContentReport` workflow + admin section

---

# 6. Campus Domain

### Purpose
Manage the physical campus experience — events, facilities, services, and campus life.

### Responsibilities
- Campus events and traditions
- Clubs and student organizations
- Campus services and facilities, campus navigation
- Weather, food and dining
- Football/sports hub (global, not tenant-scoped)

### Scope
**In scope:** Campus events, clubs, traditions, services, weather, dining, sports.
**Out of scope:** Academic courses (Academic), social feed content (Community), facility maintenance (Administration).

### Bounded Context
The Campus domain owns the physical campus experience. Sports (football) is global — not tenant-scoped.

### Canonical Entities
`CampusEvent`, `Club` (shared with Community), `CampusTradition`, `Celebration`, `LostFoundItem` (shared with Community), `LibraryResource`, `FootballMatch`, `FootballNews`, `FoodItem`

### Value Objects
- `EventSchedule` — start/end time + venue
- `MatchScore` — home_score + away_score + minute
- `WeatherCondition` — temp + condition + forecast

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `CampusEventAggregate` | `CampusEvent` | Event + RSVPs |
| `FootballMatchAggregate` | `FootballMatch` | Match + events timeline |
| `ClubAggregate` | `Club` | Club + members |

### Domain Services
- `src/lib/campus/registry.js` — campus module registry
- `src/components/campus/campusConstants.js` — campus constants
- `src/hooks/useCampusRecommendations.js` — campus recommendations
- `src/hooks/useWeather.js` — weather data

### Application Services
- `src/pages/campus/CampusHome.jsx`, `CampusHub.jsx`
- `src/pages/CampusEvents.jsx`, `Clubs.jsx`, `LostFound.jsx`, `Weather.jsx`
- `src/pages/football/FootballHub.jsx`
- `src/components/campus/`, `src/components/football/`, `src/components/weather/`

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `eventReminders` | Campus event notifications |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `CampusEvent` create | Campus | Notification (event reminders), Community |
| `FootballMatch` update (live) | Campus | Community (live ticker) |
| `Club` create | Campus | Community (discovery) |

### Commands
| Command | Handler |
|---|---|
| `CreateCampusEvent` | `base44.entities.CampusEvent.create` |
| `CreateClub` | `base44.entities.Club.create` |
| `JoinClub` | `base44.entities.Club.update` (members) |
| `ReportLostItem` | `base44.entities.LostFoundItem.create` |
| `CreateFootballMatch` | `base44.entities.FootballMatch.create` (admin) |
| `UpdateMatchScore` | `base44.entities.FootballMatch.update` (admin) |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `CampusEvent` | Public | Any | Owner / Admin | Owner / Admin |
| `Club` | Public | Any | Owner / Admin | Owner / Admin |
| `FootballMatch` | Public | Admin | Admin | Admin |
| `FoodItem` | Available / owner / admin | Admin | Owner / Admin | Owner / Admin |
| `LibraryResource` | Published / owner / admin | Admin / Librarian | Owner / Admin | Owner / Admin |

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Event Reminders | `scheduled` | Campus event notifications |

### AI Interactions
- Bud Campus agent (`base44/agents/campus.jsonc`) — campus life assistance
- Weather AI insights, campus event recommendations

### Integrations
- Weather API (external, via `useWeather.js`)
- `UploadFile` for event images
- `GenerateImage` for event graphics

### Data Ownership
- `CampusEvent`, `Club`, `CampusTradition` → Campus domain
- `FootballMatch`, `FootballNews`, `FoodItem` → Campus domain (global, no tenant scope)
- `LibraryResource` → Campus domain (shared with Learning for study)

### Extension Points
- New campus services → new entity + campus registry entry
- New sports → extend football pattern (global entities)
- Campus map/navigation → `react-leaflet` integration

---

# 7. Administration Domain

### Purpose
Manage institutional operations — student/staff administration, finance, scholarships, compliance, and reporting.

### Responsibilities
- Student and staff administration
- Institutional policies and compliance
- Finance and payments (Stripe)
- Scholarships and financial aid
- Wallet and digital banking
- Reporting and analytics, fee structure management
- Institution outreach and admissions

### Scope
**In scope:** Finance, scholarships, wallet, fees, compliance, reporting, admissions, staff management.
**Out of scope:** Academic records (Academic), platform administration (AI/Workflow domains).

### Bounded Context
The Administration domain owns institutional business operations. It references `User` and `Institution` but owns financial and compliance records.

### Canonical Entities
`FinancialTransaction`, `FeeStructure`, `Fee`, `Wallet`, `WalletLedger`, `PaymentAttempt`, `WebhookEvent` (shared with Integration), `RefundRequest`, `KYCRecord` (shared with Identity), `Scholarship`, `ScholarshipAward`, `Card`, `ProviderConnection`, `ProviderLog`, `Staff` (shared with Academic), `ManagementTask`, `StaffAnnouncement` (shared with Academic), `Admission`, `InstitutionOutreach`, `InstitutionDocument`, `SecurityEvent`

### Value Objects
- `Money` — amount + currency (`src/lib/finance/money.js`)
- `PaymentStatus` — pending / succeeded / failed / refunded
- `TransactionType` — credit / debit / transfer / fee / scholarship
- `FeeFrequency` — one_time / recurring / semester / annual

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `WalletAggregate` | `Wallet` | Wallet + `WalletLedger` + `Card` records |
| `PaymentAggregate` | `PaymentAttempt` | Attempt + `WebhookEvent` + `FinancialTransaction` |
| `ScholarshipAggregate` | `Scholarship` | Scholarship + `ScholarshipAward` records |
| `FeeStructureAggregate` | `FeeStructure` | Structure + individual `Fee` records |

### Domain Services
- `src/lib/finance/` — paymentService, walletService, bankingService, cardService, kycService, providers, money, stripeCheckout, modules
- `src/lib/institution/` — useInstitution, useInstitutionStats, roles
- `src/lib/institutionService.js`, `src/lib/institutionConfig.js`
- `src/lib/oracle/bankingCapabilities.js`, `marketplacePlatform.js`
- `src/lib/providers/` — adapters, registry, health, retry
- `src/lib/wallet/walletPrefs.js`, `useWalletAccess.js`

### Application Services
- `src/pages/finance/Finance.jsx`, `src/pages/wallet/Wallet.jsx`
- `src/pages/management/Management.jsx`, `src/pages/institution/InstitutionPortal.jsx`, `InstitutionOnboarding.jsx`
- `src/pages/operator/Operator.jsx`
- `src/components/finance/`, `src/components/wallet/`, `src/components/management/`, `src/components/institution/`, `src/components/operator/`

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `stripePayment` | Stripe payment processing |
| `outreachFollowup` | Institution outreach follow-ups |
| `providerSecrets` | Provider secret management |
| `universityConnectSync` | Institution data sync |
| `universityConnectBgSync` | Background institution sync |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `PaymentAttempt` update | Administration | Notification (payment status) |
| `WebhookEvent` create (Stripe) | Administration | Wallet (balance update), Notification |
| `WalletLedger` create | Administration | Analytics, Notification |
| `ScholarshipAward` create | Administration | Notification, Academic |
| `SecurityEvent` create | Administration | AI (Sentinel), Notification |

### Commands
| Command | Handler |
|---|---|
| `ProcessPayment` | `stripePayment` function |
| `CreateWallet` | `base44.entities.Wallet.create` |
| `TransferFunds` | `walletService.js` |
| `FundWallet` | `walletService.js` + `stripePayment` |
| `IssueScholarship` | `base44.entities.ScholarshipAward.create` |
| `CreateFeeStructure` | `base44.entities.FeeStructure.create` |
| `RequestRefund` | `base44.entities.RefundRequest.create` |
| `SubmitKYC` | `base44.entities.KYCRecord.create` |
| `CreateStaff` | `base44.entities.Staff.create` |
| `StartOutreach` | `base44.entities.InstitutionOutreach.create` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Wallet` | Owner / admin | Owner (own) | Owner / Admin | Admin |
| `WalletLedger` | Owner / admin | System / Admin | Admin | Admin |
| `FinancialTransaction` | Owner / admin | System / Admin | Admin | Admin |
| `FeeStructure` | Institution / admin | Admin | Admin | Admin |
| `Scholarship` | Public / admin | Admin | Admin | Admin |
| `ScholarshipAward` | Recipient / admin | Admin | Admin | Admin |
| `PaymentAttempt` | Owner / admin | Owner / System | Owner / Admin | Admin |
| `KYCRecord` | Owner / admin | Owner (own) | Admin | Admin |
| `Staff` | Institution / admin | Admin | Admin | Admin |
| `SecurityEvent` | Admin | System / Admin | Admin | Admin |

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Outreach Follow-up | `scheduled` | Institution outreach follow-up notifications |
| University Connect Background Sync | `scheduled` | Institution data background synchronization |

### AI Interactions
- AI financial insights (`FinancialIntelligence` Oracle section)
- Fraud detection patterns (Sentinel agent)
- KYC verification assistance, scholarship matching AI

### Integrations
- Stripe (payment processing) — secrets configured
- Provider connections (banking providers)
- `UploadPrivateFile` for KYC documents
- `CreateFileSignedUrl` for private document access

### Data Ownership
- All financial entities → Administration domain
- `KYCRecord` → shared (Identity for verification, Administration for financial)
- `Staff` → shared (Academic for teaching, Administration for employment)
- `StaffAnnouncement` → shared (Academic for content, Administration for distribution)

### Security Considerations
- Financial data: strict owner-scoped RLS
- KYC: `UploadPrivateFile` + `CreateFileSignedUrl` (never in entity fields)
- Stripe webhooks: signature verification (`STRIPE_WEBHOOK_SECRET`)
- Wallet operations: re-authentication required for sensitive actions
- PCI compliance: no card data stored (Stripe tokenization)

### Audit Requirements
- All financial transactions → `FinancialTransaction` + `WalletLedger`
- Payment attempts → `PaymentAttempt` + `WebhookEvent`
- Refund requests → `RefundRequest` + `AuditLog`
- KYC submissions → `KYCRecord` + `AuditLog`
- Security events → `SecurityEvent` + `AuditLog`
- Staff management actions → `AuditLog`

### Extension Points
- New payment providers → `src/lib/finance/providers.js` + adapter
- New financial products → new entity + wallet service method
- New compliance reports → `reportEngine.js` + finance section
- New banking features → `bankingService.js` extension

---

# 8. AI Domain

### Purpose
Manage all AI capabilities — Bud (companion), Spark (orchestration), specialist agents, memory, and AI governance.

### Responsibilities
- Bud conversation runtime
- Spark multi-agent orchestration
- Specialist agent registry and lifecycle
- AI memory management
- AI governance and authority codes
- Model routing and provider management
- Prompt management, AI evaluation and observability
- Safety and guardrails

### Scope
**In scope:** Bud, Spark, all in-app agents, AI memory, AI governance, model routing.
**Out of scope:** Business logic of other domains (AI provides intelligence, domains own their data).

### Bounded Context
The AI domain owns intelligence infrastructure. It reads from all domains (via governed permissions) but owns no business data — only AI-specific records (memory, execution logs, metrics).

### Canonical Entities
`BudMemory`, `BudConversation`, `SparkAgent`, `SparkExecutionLog`, `AIServiceMetric` (shared with Analytics), `AIServiceRecommendation`, `ToolRecommendation`, `RecommendationPreference`, `CrashReport`, `AuditLog` (shared with all domains)

### Value Objects
- `AgentId` — unique slug identifier
- `AuthorityCode` — hash-verified executive token
- `ModelRoute` — provider + model + fallback chain
- `MemoryType` — episodic / semantic / procedural
- `ExecutionStatus` — planning / executing / validating / complete / failed

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `BudConversationAggregate` | `BudConversation` | Conversation + messages + memory references |
| `AgentAggregate` | `SparkAgent` | Agent config + permissions + execution logs |
| `ExecutionRunAggregate` | `SparkExecutionLog` | Run + agent results + validation |

### Domain Services
- `src/lib/bud/` — orchestrator.ts, conversation.ts, personality.ts, constitution.ts, config.ts, types.ts, index.ts, contextPulse.js, adaptivePersonas.js, homeOrchestrator.js
- `src/lib/bud/prompts/` — systemPrompt.ts, userPrompt.ts
- `src/lib/bud/context/buildContext.ts`
- `src/lib/bud/actions/` — reason.ts, recallMemory.ts, searchKnowledge.ts, planIfNeeded.ts, generateResponse.ts, storeInteraction.ts
- `src/lib/bud/adapters/` — liveSparkAdapter.ts, sparkPort.ts
- `src/lib/spark/` — orchestrator.js, agents/registry.js, agents/definitions.js, providers/, intelligence/, core/, memory/, knowledge/, context/, learning/, automation/, trust/, notifications/, recommendations/, manifest.ts, index.ts, types.ts, tokens.ts, namespace.ts, events.ts, errors.ts, middleware.ts, plugins.ts
- `src/lib/oracle/` — orchestrationEngine.js, executiveMode.js, authorityCodes.js, authorityLevels.js, healthMonitor.js, specialistAgents.js, managementCenters.js, engineeringDirective.js, engineeringConstitution.js, commandAuthorities.js, modules.js, useAIMonitor.js, useRegistryMetrics.js, registryMetrics.js
- `src/lib/agentRegistry.js`, `src/lib/aee/aeeEngine.js`
- `src/lib/BudPanelContext.jsx`, `src/lib/BudLauncherContext.jsx`
- `src/hooks/` — useBudMemory.js, useBudProactive.js, useBudBehaviour.js, useBudOrbPrefs.js, useSpark.js, useToolRecommendations.js

### Application Services
- `src/components/bud/` — BudPanel, BudCompanion, BudLivingOrb, BudVoiceOrb, BudVoiceMode, ChatMessage, ConversationHistory, AgentActivityIndicator, BudThinking, BudCategories, SuggestedPrompts, QuickActions, BudContextCards, BudMemoryTimeline, BudFigure, BudCharacter, BudAvatar, BudOrb, BudWelcome, BudSheet, ProactiveBud, home/
- `src/pages/bud/BudHome.jsx`, `src/pages/ai/MemoryDashboard.jsx`
- `src/components/oracle/sections/` — SparkAgentRegistry, SparkAgentObservability, AIMonitoring, AIGovernance, ExecutiveAuthority
- `src/components/oracle/` — ExecutiveVerificationGate, ExecutiveAgentPanel, ExecutivePlatformControls
- `src/components/ai/AIVisualStudio.jsx`
- `src/components/spark/ToolRecommendationStrip.jsx`

### In-App Agents (`base44/agents/`)
| Agent | File | Domain |
|---|---|---|
| Bud | `bud.jsonc` | User companion |
| Oracle | `oracle.jsonc` | Platform governance |
| Spark | `spark.jsonc` | Orchestration |
| Study | `study.jsonc` | Academic |
| Career | `career.jsonc` | Professional |
| Campus | `campus.jsonc` | Campus life |
| Quad | `quad.jsonc` | Social feed |
| Pulse | `pulse.jsonc` | Analytics |
| Library | `library.jsonc` | Knowledge |
| Admin | `admin.jsonc` | Administration |
| Search | `search.jsonc` | Information retrieval |
| Security | `security.jsonc` | Security |
| Notification | `notification.jsonc` | Notifications |

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `verifyAuthorityCode` | Authority code verification |
| `logExecutiveAction` | Executive action audit logging |
| `oracleHealthScan` | Platform health scanning |
| `providerSecrets` | Provider secret management |
| `budNotificationEngine` | Bud notification dispatch |
| `runAutomation` | Automation execution |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `BudConversation` create/update | AI | Analytics, Memory |
| `SparkExecutionLog` create/update | AI | Monitoring (Oracle dashboard) |
| `SparkAgent` update (enabled/disabled) | AI | All domains (capability change) |
| `BudMemory` create | AI | Bud context (future conversations) |
| `CrashReport` create | AI | Monitoring, Administration |

### Commands
| Command | Handler |
|---|---|
| `SendMessage` | `BudPanelContext.sendMessage` → `orchestrate` |
| `EnableAgent` | `base44.entities.SparkAgent.update` (admin) |
| `DisableAgent` | `base44.entities.SparkAgent.update` (admin) |
| `VerifyAuthority` | `verifyAuthorityCode` function |
| `LogExecutiveAction` | `logExecutiveAction` function |
| `RunAutomation` | `runAutomation` function |
| `CreateMemory` | `base44.entities.BudMemory.create` |
| `RecordCrash` | `base44.entities.CrashReport.create` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `BudMemory` | Owner / admin | Owner (own) / System | Owner / Admin | Owner / Admin |
| `BudConversation` | Owner / admin | Owner (own) | Owner / Admin | Owner / Admin |
| `SparkAgent` | Public | Admin | Admin | Admin |
| `SparkExecutionLog` | Owner / admin | Any (system) | Owner / Admin | Admin |
| `AIServiceMetric` | Admin | System | Admin | Admin |
| `AuthorityCode` | — | — | `verifyAuthorityCode` (hash-verified) | — |
| `CrashReport` | Owner / admin | Any (public create) | Admin | Admin |

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| Bud Notification Engine | `scheduled` / `entity` | Bud notification dispatch |
| Bud Reminders | `scheduled` | Bud study reminders |

### AI Interactions (Meta)
This domain IS the AI layer. All other domains interact with AI through:
1. Bud (user-facing) → `BudPanelContext` → `orchestrate` → Spark → specialist agents
2. Domain-specific agents (Study, Career, Campus, etc.)
3. `InvokeLLM` for direct LLM calls
4. Oracle authority codes for executive AI actions

### Integrations
- `InvokeLLM` — LLM generation (Core integration)
- `TranscribeAudio` — speech-to-text
- `GenerateImage` — image generation
- `GenerateSpeech` — text-to-speech
- `GenerateVideo` — video generation
- AI providers: OpenAI, Anthropic, Gemini (via `spark/providers/`)

### Data Ownership
- `BudMemory`, `BudConversation` → AI domain (user-scoped)
- `SparkAgent`, `SparkExecutionLog`, `AIServiceMetric` → AI domain (admin-managed)
- `AuditLog` → shared (all domains write, AI domain governs)
- `CrashReport` → shared (AI domain for analytics, Monitoring for ops)

### Security Considerations
- Authority codes: hash-verified, replay-protected
- Bud memory: user-scoped RLS
- Agent permissions: governed by `request_agent_tool_permissions`
- AI safety: guardrails in `constitution.ts`
- Prompt injection: handled by Spark port interface
- Memory retention: policies in `storeInteraction.ts`

### Audit Requirements
- Every authority code verification → `AuditLog`
- Every executive action → `AuditLog` via `logExecutiveAction`
- Agent enable/disable → `AuditLog`
- Spark orchestration runs → `SparkExecutionLog`
- AI service calls → `AIServiceMetric`
- Crashes → `CrashReport`

### Extension Points
- New specialist agents → `SparkAgent` entity + `base44/agents/*.jsonc`
- New AI providers → `src/lib/spark/providers/` adapter
- New intelligence capabilities → `src/lib/spark/intelligence/` module
- New Bud actions → `src/lib/bud/actions/` module
- New authority codes → `authorityCodes.js` + `verifyAuthorityCode`

---

# 9. Workflow Domain

### Purpose
Manage automated processes, tasks, scheduling, and event-driven automation.

### Responsibilities
- Task management (Spark tasks)
- Workflow automation (CNCF SWF)
- Scheduled tasks and reminders
- Background job processing
- Event processing and routing
- Automation lifecycle management

### Scope
**In scope:** Tasks, automations, workflows, scheduling, event processing.
**Out of scope:** Business logic of other domains (Workflow executes, doesn't own domain data).

### Bounded Context
The Workflow domain owns automation infrastructure. It reads from and writes to other domains but owns only workflow-specific records.

### Canonical Entities
`TaskManagement`, `TaskComment`, `TaskActivity`, `Automation`, `AutomationRun`, `StudyGroup` (shared with Community/Academic), `StudyGroupTask`, `StudyGroupMessage`, `CalendarEvent`, `ReminderPreference`, `NotificationPreference`, `Notification` (shared with AI), `Collection`

### Value Objects
- `TaskStatus` — draft / assigned / accepted / in_progress / completed / archived
- `AutomationTrigger` — scheduled / entity / connector / in_app_agent / app_user_auth / app_publish
- `WorkflowDuration` — ISO-8601 duration for durable waits
- `ReminderFrequency` — minimal / balanced / frequent

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `TaskAggregate` | `TaskManagement` | Task + comments + activity + checklist + milestones |
| `AutomationAggregate` | `Automation` | Automation + run history |
| `StudyGroupAggregate` | `StudyGroup` | Group + tasks + messages |

### Domain Services
- `src/lib/tasks/` — taskService.js, useTasks.js, budTaskIntent.js, constants.js
- `src/lib/automation/manifest.js`
- `src/lib/notifications/` — priorityEngine.js, useSmartNotifications.js, useBudPush.js, budPrefsDefaults.js, useBudNotificationPrefs.js
- `base44/shared/notifications.ts`, `base44/shared/authorityVerification.ts`
- `src/hooks/` — useNotificationCenter.js, useMessages.js, useConversations.js

### Application Services
- `src/pages/tasks/` — TaskHub, TaskDetail
- `src/pages/automation/` — AutomationCenter, WorkflowBuilder
- `src/pages/Notifications.jsx`, `src/pages/notifications/` — SmartNotifications, BudNotificationPreferences
- `src/pages/StudyGroups.jsx`, `src/pages/StudyGroupDetail.jsx`
- `src/pages/academics/Calendar.jsx`
- `src/components/tasks/`, `src/components/notifications/`, `src/components/calendar/`

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `runAutomation` | Execute automation definitions |
| `deadlineReminders` | Assignment deadline reminders |
| `eventReminders` | Event reminders |
| `examReminders` | Exam countdown reminders |
| `streakReminders` | Study streak reminders |
| `budReminders` | Bud study reminders |
| `budNotificationEngine` | Bud notification dispatch |
| `taskReminders` | Task deadline reminders |
| `activateAnnouncements` | Activate scheduled announcements |
| `studyGroupEventBridge` | Study group event bridging |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `TaskManagement` create/update | Workflow | Notification (assignees), AI (Bud context) |
| `TaskComment` create | Workflow | Notification (mentions), AI |
| `AutomationRun` create/update | Workflow | Monitoring (Oracle dashboard) |
| `CalendarEvent` create/update | Workflow | Notification (reminders), Integration (Google Calendar) |
| Entity realtime events | All domains | Workflow triggers (entity-triggered workflows) |
| Connector webhook events | Integration | Workflow triggers (connector-triggered workflows) |

### Commands
| Command | Handler |
|---|---|
| `CreateTask` | `base44.entities.TaskManagement.create` |
| `UpdateTaskStatus` | `base44.entities.TaskManagement.update` |
| `AddComment` | `base44.entities.TaskComment.create` |
| `CreateAutomation` | `base44.entities.Automation.create` |
| `RunAutomation` | `runAutomation` function |
| `CreateCalendarEvent` | `base44.entities.CalendarEvent.create` |
| `SendNotification` | `budNotificationEngine` function |
| `SnoozeNotification` | `base44.entities.Notification.update` (snoozed_until) |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `TaskManagement` | Member / creator / admin | Member (own) | Member / Creator / Admin | Creator / Member / Admin |
| `TaskComment` | Member / admin | Member | Author / Admin | Author / Admin |
| `Automation` | Admin | Admin | Admin | Admin |
| `AutomationRun` | Owner / admin | System | Owner / Admin | Admin |
| `CalendarEvent` | Owner / invitees / admin | Owner (own) | Owner / Admin | Owner / Admin |
| `Notification` | Owner / broadcast / admin | System / Admin | Owner / Admin | Owner / Admin |

### Workflows (CNCF SWF v1.0)
| Workflow | Trigger | Purpose |
|---|---|---|
| Bud Notification Engine | `scheduled` / `entity` | Bud notification dispatch |
| Bud Reminders | `scheduled` | Bud study reminders |
| Deadline Reminders | `scheduled` | Assignment deadline notifications |
| Event Reminders | `scheduled` | Event reminder notifications |
| Study Streak Reminders | `scheduled` | Study streak notifications |
| Exam Countdown | `scheduled` | Exam countdown notifications |
| Welcome New Student | `app_user_auth` | New user welcome flow |
| Outreach Follow-up | `scheduled` | Institution outreach follow-ups |
| University Connect Background Sync | `scheduled` | Institution data sync |
| Activate Scheduled Announcements | `scheduled` | Announcement activation |
| Study Group Message/Task Notifications | `entity` | Study group messaging |
| Task Deadline Reminders | `scheduled` | Task deadline reminders |

### AI Interactions
- Bud can create tasks (`budTaskIntent.js`)
- Automation can invoke agents (`runAutomation`)
- AI-powered task recommendations
- Smart notification prioritization (`priorityEngine.js`)

### Integrations
- Google Calendar connector (calendar sync via `googleCalendarSync`)
- Entity realtime subscriptions (event bus)
- Connector webhooks (event triggers)

### Data Ownership
- `TaskManagement`, `TaskComment`, `TaskActivity` → Workflow domain
- `Automation`, `AutomationRun` → Workflow domain
- `CalendarEvent` → Workflow domain (shared with Academic for academic calendar)
- `Notification` → shared (AI generates, Workflow delivers, all domains consume)

### Extension Points
- New workflow triggers → `base44/workflows/` + `get_workflow_guide`
- New task types → `TaskManagement.task_type` enum + handler
- New notification types → `Notification.type` enum + priority engine
- New automation triggers → workflow trigger types

---

# 10. Media Domain

### Purpose
Manage file storage, document processing, audio transcription, and media intelligence.

### Responsibilities
- File upload and storage (public + private)
- Document extraction and parsing
- Audio transcription, image/video generation
- Text-to-speech, signed URL generation
- Knowledge hub (unified file intelligence)

### Scope
**In scope:** File storage, media processing, OCR, transcription, media generation.
**Out of scope:** Social media content (Community domain), learning materials (Learning domain — content ownership, Media handles storage).

### Bounded Context
The Media domain owns file infrastructure. Other domains upload and reference files but the Media domain manages the storage and processing pipeline.

### Canonical Entities
`Collection`, `InstitutionDocument` (shared with Administration), `StudentDocument` (shared with Learning)

### Value Objects
- `FileUrl` — public file URL from `UploadFile`
- `FileUri` — private file URI from `UploadPrivateFile`
- `SignedUrl` — time-limited download URL
- `MediaType` — image / audio / video / document / pdf
- `Transcript` — text output from audio transcription

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `CollectionAggregate` | `Collection` | Collection + referenced items |

### Domain Services
- `src/lib/knowledge/` — knowledgeEngine.js, useKnowledge.js
- `src/components/knowledge/` — NaturalLanguageSearch, UploadAndExtract, KnowledgeSearchBar, CollectionComposer, KnowledgeItemCard
- `src/hooks/` — useMediaUpload.js, usePlaybackProgress.js

### Application Services
- `src/pages/knowledge/KnowledgeHub.jsx`
- `src/components/knowledge/`, `src/components/library/`

### APIs (Backend Functions)
No domain-specific backend functions. Uses Core integrations: `UploadFile`, `UploadPrivateFile`, `CreateFileSignedUrl`, `ExtractDataFromUploadedFile`, `TranscribeAudio`, `GenerateImage`, `GenerateVideo`, `GenerateSpeech`

### Commands
| Command | Handler |
|---|---|
| `UploadFile` | `base44.integrations.Core.UploadFile` |
| `UploadPrivateFile` | `base44.integrations.Core.UploadPrivateFile` |
| `CreateSignedUrl` | `base44.integrations.Core.CreateFileSignedUrl` |
| `ExtractData` | `base44.integrations.Core.ExtractDataFromUploadedFile` |
| `TranscribeAudio` | `base44.integrations.Core.TranscribeAudio` |
| `GenerateImage` | `base44.integrations.Core.GenerateImage` |
| `GenerateVideo` | `base44.integrations.Core.GenerateVideo` |
| `GenerateSpeech` | `base44.integrations.Core.GenerateSpeech` |
| `CreateCollection` | `base44.entities.Collection.create` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Collection` | Owner / admin | Owner (own) | Owner / Admin | Owner / Admin |
| Private files | Signed URL holders | Owner (upload) | — | — |
| Public files | Public | Owner (upload) | — | — |

### AI Interactions
- Knowledge search via `InvokeLLM` with file context
- Natural language search (`NaturalLanguageSearch.jsx`)
- AI-powered document extraction (`ExtractDataFromUploadedFile`)
- Audio transcription for podcasts/lectures (`TranscribeAudio`)

### Data Ownership
- `Collection` → Media domain
- File URLs/URIs → stored in referencing domain entities (e.g., `PodcastEpisode.audio_url` in Community)
- `InstitutionDocument` → shared (Administration owns, Media stores)
- `StudentDocument` → shared (Learning owns, Media stores)

### Security Considerations
- Private files: `UploadPrivateFile` + `CreateFileSignedUrl` (time-limited)
- Never store large content (base64, PDFs) in entity fields
- OCR/extraction: structured schema validation
- Signed URLs: expiration enforcement

### Extension Points
- New media types → Core integration (if platform adds)
- New knowledge sources → `knowledgeEngine.js` adapter
- New extraction schemas → `ExtractDataFromUploadedFile` json_schema parameter

---

# 11. Integration Domain

### Purpose
Manage external system connections, OAuth connectors, third-party APIs, and data synchronization.

### Responsibilities
- OAuth connector management (shared, app-user, BYO-shared)
- Third-party API integration
- Data synchronization (Google Calendar, institution data)
- Webhook management, provider health monitoring, secret management

### Scope
**In scope:** Connectors, API integrations, webhooks, sync functions, provider health.
**Out of scope:** Domain-specific business logic (domains own their integrations, Integration provides infrastructure).

### Bounded Context
The Integration domain owns connection infrastructure. Each domain uses connectors through the Integration domain's managed connections.

### Canonical Entities
`ProviderConnection`, `ProviderLog`, `WebhookEvent` (shared with Administration), `ApiKey` (shared with Identity), `UniversityConnection`

### Value Objects
- `ConnectorType` — shared / app_user / byo_shared
- `OAuthScope` — permission scope string
- `SyncStatus` — idle / syncing / error / last_synced
- `WebhookSignature` — verification token

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `ProviderConnectionAggregate` | `ProviderConnection` | Connection + logs + health |

### Domain Services
- `src/lib/providers/` — adapters.js, registry.js, index.js, interface.js, health.js, retry.js
- `src/components/oracle/sections/providerHub/` — HealthTab, ProvidersTab, WebhooksTab, SecretsTab, shared.js

### Application Services
- `src/components/oracle/sections/IntegrationCenter.jsx`
- `src/components/oracle/sections/ProviderHub.jsx`
- `src/components/oracle/sections/providerHub/` — HealthTab, ProvidersTab, WebhooksTab, SecretsTab

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `googleCalendarSync` | Google Calendar synchronization |
| `universityConnectSync` | University data sync |
| `universityConnectBgSync` | Background university sync |
| `providerSecrets` | Provider secret management |

### Events
| Event | Source | Consumed By |
|---|---|---|
| Connector webhook | External (Stripe, Google Calendar, etc.) | Workflow (connector trigger), Domain handlers |
| `WebhookEvent` create | Integration | Administration (financial), Domain handlers |
| `ProviderConnection` update | Integration | Monitoring (health), Domain consumers |

### Commands
| Command | Handler |
|---|---|
| `AuthorizeConnector` | `request_oauth_authorization` (SHARED/BYO_SHARED) or `register_workspace_connector` (APP_USER) |
| `RegisterWorkspaceConnector` | `register_workspace_connector` |
| `SyncGoogleCalendar` | `googleCalendarSync` function |
| `SyncUniversityData` | `universityConnectSync` function |
| `RegisterWebhook` | `manage_stripe(action: 'register_webhook')` (Stripe) |
| `StoreSecret` | `set_secrets` + `providerSecrets` function |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `ProviderConnection` | Admin | Admin | Admin | Admin |
| `ProviderLog` | Admin | System | Admin | Admin |
| `WebhookEvent` | Admin | System / Stripe | Admin | Admin |
| `ApiKey` | Admin | Admin | Admin | Admin |
| OAuth authorization | Admin (builder) | Admin | — | — |

### Workflows
| Workflow | Trigger | Purpose |
|---|---|---|
| University Connect Background Sync | `scheduled` | Institution data background sync |
| Connector-triggered workflows | `connector` | Route webhook events to handlers |

### AI Interactions
- Integration health monitoring (Oracle `ProviderHub`)
- AI-powered sync error resolution
- Connector recommendations

### Integrations (Meta)
This domain IS the integration layer:
- **Authorized connectors:** Google Calendar (events, calendar, email scopes; webhook support)
- **Workspace-registered:** TikTok ("UNIBUD TikTok"), Discord ("UNIBUD Discord"), GitHub ("Vantoris GitHub")
- **Stripe:** Payment integration (test mode, secrets configured)
- **Available:** 90+ connector types (Slack, Notion, Salesforce, etc.)
- **Backend functions:** For external APIs without built-in connectors

### Data Ownership
- `ProviderConnection`, `ProviderLog` → Integration domain
- `WebhookEvent` → shared (Integration for routing, Administration for financial)
- `ApiKey` → shared (Identity for auth, Integration for API access)

### Security Considerations
- OAuth tokens: platform-managed (never exposed to frontend)
- Secrets: `set_secrets` + `providerSecrets` (never hardcoded)
- Webhook signatures: verification required (STRIPE_WEBHOOK_SECRET)
- API keys: encrypted storage, admin-only access
- Connector scopes: minimal permissions only

### Audit Requirements
- OAuth authorizations → `AuditLog`
- Webhook events → `WebhookEvent` entity
- Provider errors → `ProviderLog` entity
- Secret access → `providerSecrets` function logs

### Extension Points
- New connectors → `get_connectors_info` + `request_oauth_authorization`
- New external APIs → backend function in `base44/functions/` + `set_secrets`
- New webhook handlers → workflow with connector trigger
- New sync functions → `base44/functions/` + scheduled workflow

---

# 12. Analytics Domain

### Purpose
Provide dashboards, metrics, reports, and institutional insights across all domains.

### Responsibilities
- Platform analytics and dashboards
- Institutional insights and reporting
- AI analytics and model performance
- Student analytics and learning insights
- Financial analytics, custom report generation, data visualization

### Scope
**In scope:** Dashboards, metrics, reports, insights, analytics UI.
**Out of scope:** Raw data ownership (Analytics reads from all domains, owns only analytics-specific records).

### Bounded Context
The Analytics domain is a read-model context. It aggregates and computes insights from other domains but owns no business data — only derived metrics and report definitions.

### Canonical Entities
`AIServiceMetric` (shared with AI), `AIServiceRecommendation`, `AuditLog` (shared with all domains), `TrustScore` (shared with Community), `PlatformModule`

### Value Objects
- `Metric` — name + value + unit + timestamp
- `Insight` — description + confidence + source
- `ReportPeriod` — start_date + end_date + granularity
- `DashboardConfig` — widget layout + data sources

### Aggregates
| Aggregate | Root Entity | Consistency Group |
|---|---|---|
| `MetricsAggregate` | `AIServiceMetric` | Metric + time series data |
| `ReportAggregate` | (computed) | Report definition + generated output |

### Domain Services
- `src/lib/academics/reportEngine.js` (shared with Academic), `chartColors.js`
- `src/lib/spark/intelligence/recommendations/`
- `src/lib/oracle/` — registryMetrics.js, useRegistryMetrics.js, useAIMonitor.js, healthMonitor.js
- `src/hooks/` — useDiscoveryRanking.js, useGreetingMoment.js

### Application Services
- `src/components/oracle/sections/` — OracleOverview, OracleIntelligence, TaskIntelligence, ContentIntelligence, FinancialIntelligence, CollaborationIntelligence, PlatformAnalytics, RegistryDashboard
- `src/components/oracle/intelligence/` — RecommendationCard, HealthGrid, AgentNetwork
- `src/components/oracle/registry/` — PlatformHealth, LiveActivityFeed, MetricSection, MetricTile, RegistryFilters
- `src/components/academics/report/`, `src/components/academics/AnalyticsDashboard.jsx`, `ProgressDashboard.jsx`
- `src/components/me/` — LearningInsights.jsx, AcademicSummary.jsx
- `src/components/admin/AdminInsights.jsx`

### APIs (Backend Functions)
| Function | Purpose |
|---|---|
| `oracleHealthScan` | Platform health scanning |
| `trustProfile` | Trust score analytics |

### Events
| Event | Source | Consumed By |
|---|---|---|
| `AIServiceMetric` create | Analytics | AI monitoring dashboard |
| `SparkExecutionLog` update | AI | Analytics (performance metrics) |
| `CrashReport` create | AI | Analytics (error rates) |

### Commands
| Command | Handler |
|---|---|
| `RunHealthScan` | `oracleHealthScan` function |
| `GenerateReport` | `reportEngine.js` |
| `TrackEvent` | `base44.analytics.track()` |
| `CreateMetric` | `base44.entities.AIServiceMetric.create` (system) |

### Queries
| Query | Handler |
|---|---|
| `GetPlatformHealth` | `oracleHealthScan` function |
| `GetAIMetrics` | `base44.entities.AIServiceMetric.list()` |
| `GetExecutionLogs` | `base44.entities.SparkExecutionLog.list()` |
| `GetAcademicReport` | `reportEngine.js` |
| `GetRegistryMetrics` | `useRegistryMetrics.js` |

### Permissions
| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `AIServiceMetric` | Admin | System | Admin | Admin |
| `AuditLog` | Admin | System / All domains | Admin | Admin |
| `TrustScore` | Owner / admin | System | Admin | Admin |
| Analytics dashboards | Admin | Admin | Admin | Admin |
| Student analytics | Owner / admin | System | — | — |

### AI Interactions
- Bud Pulse agent (`base44/agents/pulse.jsonc`) — analytics & insights
- AI-powered recommendations (`spark/intelligence/recommendations/`)
- LLM-generated insights and summaries
- Oracle intelligence feed

### Integrations
- `@tanstack/react-query` for data caching
- `recharts` for chart visualization
- `InvokeLLM` for AI-generated insights
- `base44.analytics.track()` for custom event tracking

### Data Ownership
- `AIServiceMetric`, `AIServiceRecommendation` → Analytics domain
- `AuditLog` → shared (all domains write, Analytics reads for compliance reports)
- `TrustScore` → shared (Community computes, Analytics reads for insights)
- Report outputs → computed, not persisted (generated on demand)

### Security Considerations
- Analytics dashboards: admin-only (institution-wide data)
- Student analytics: student-scoped (own data only)
- Audit logs: admin-only read
- No PII in analytics events (`base44.analytics.track()` — no PII)

### Audit Requirements
- Analytics queries on sensitive data → `AuditLog`
- Report generation → logged in calling domain
- Dashboard access → standard auth audit

### Extension Points
- New dashboards → Oracle section + `src/components/oracle/sections/`
- New report types → `reportEngine.js` + report components
- New metrics → `AIServiceMetric` schema + collection hook
- New visualizations → `src/components/academics/report/` chart components

---

*UNIBUD OS — Domain Architecture: Domain Specifications v1.2*
*Extends frozen v1.0 master architecture. Every domain mapped to existing implementation.*