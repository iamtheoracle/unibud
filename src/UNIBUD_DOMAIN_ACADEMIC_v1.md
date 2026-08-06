# UNIBUD OS — Academic Domain Specification (ADS)

> **Revision:** v1.2 · **Date:** 2026-08-01
> **Parent:** UNIBUD OS Core Architecture v1.0 (frozen) · IACP v1.1 · Domain Architecture v1.2
> **Status:** Active Revision — Domain Architecture Extension
> **Milestone:** 14.2
> **Predecessor:** [Identity & Access Domain (IAD) v1.2](./UNIBUD_DOMAIN_IDENTITY_ACCESS_v1.md)

---

## 1. Purpose

The Academic Domain (ADS) is the authoritative source for **what is taught**, **who teaches**, **who is enrolled**, **how learning is assessed**, and **what academic standing a student holds**. It owns the structural backbone of university education — from institutional hierarchy down to individual exam attempts and transcript records.

Every learning interaction, grade, attendance record, and academic milestone traces back to entities defined in this domain. The Learning Domain delivers content; the Academic Domain defines the structure that content lives within.

---

## 2. Scope

### In Scope

| Concern | Ownership |
|---|---|
| Institutional academic hierarchy (faculty → school → department → programme) | ADS |
| Curriculum and course catalog | ADS |
| Academic sessions, semesters, and calendar structure | ADS |
| Course enrollment and registration | ADS |
| Class scheduling and timetable | ADS |
| Teaching staff (lecturer) academic assignments | ADS (shared with Administration for employment) |
| Assessments, assignments, examinations | ADS |
| Grading and grade management | ADS |
| Attendance tracking | ADS |
| Academic records, transcripts, academic standing | ADS |
| Graduation and certification | ADS |
| Academic policies and approval workflows | ADS |

### Out of Scope (Owned by Other Domains)

| Concern | Owner | Rationale |
|---|---|---|
| User identity & authentication | Identity & Access (IAD) | ADS references `user_id`; IAD owns the User |
| Institution tenant management | IAD | ADS references `institution_id`; IAD owns `Institution` |
| Learning content delivery | Learning Domain | ADS owns `Course`; Learning owns `CourseMaterial` delivery |
| Financial aspects of education | Administration Domain | ADS owns academic structure; Administration owns fees, scholarships |
| Research projects | Research Domain | ADS owns FYP administration; Research owns the research lifecycle |
| Analytics on academic data | Analytics Domain | ADS owns raw data; Analytics owns derived insights |
| AI tutoring and study tools | AI Domain | ADS owns assessment structure; AI provides learning intelligence |

### Shared Stewardship

| Entity | ADS Role | Partner Domain Role |
|---|---|---|
| `Course` | Structural owner | Learning references for content organization |
| `CourseMaterial` | Structural owner (metadata) | Learning owns delivery + progress |
| `Staff` | Academic assignment owner | Administration owns employment records |
| `FYPProject` | Academic administration owner | Research owns research lifecycle |
| `CalendarEvent` | Academic calendar events | Workflow owns calendar infrastructure |

---

## 3. Responsibilities

| # | Responsibility | Description |
|---|---|---|
| R1 | Institutional Hierarchy | Model faculty/school/department/programme structure |
| R2 | Curriculum Management | Define and version curricula, course catalogs |
| R3 | Academic Calendar | Manage sessions, semesters, academic years |
| R4 | Enrollment | Process student registration, withdrawals, transfers |
| R5 | Scheduling | Manage timetables, class slots, room allocation |
| R6 | Staff Assignment | Assign lecturers to courses, classes, office hours |
| R7 | Assessment Design | Create assignments, exams, question banks |
| R8 | Assessment Execution | Administer exam attempts, assignment submissions |
| R9 | Grading | Record, calculate, and publish grades |
| R10 | Attendance | Track and record student attendance |
| R11 | Academic Records | Maintain transcripts, GPA, academic standing |
| R12 | Graduation | Process graduation eligibility, issue certificates |
| R13 | Academic Policies | Enforce enrollment limits, GPA thresholds, prerequisites |
| R14 | Approval Workflows | Route academic actions through approval chains |
| R15 | Audit | Log all academic record changes for compliance |

---

## 4. Bounded Context

### Context Boundary

ADS is bounded by the question: **"What is the academic structure, and what has each student achieved within it?"**

- **Structure** ends at the curriculum/course/catalog definition.
- **Enrollment** ends at the student-course registration record.
- **Assessment** ends at the grade/attempt/certificate record.
- **Records** end at the transcript and academic standing.

### What ADS Does NOT Decide

- Whether a student is *financially cleared* to enroll (Administration decides; ADS checks the flag).
- Whether a student is *identity-verified* (IAD decides; ADS requires verification before enrollment).
- Whether learning content is *engaging* (Learning/AI domains decide; ADS owns the assessment structure).
- Whether a research project is *publishable* (Research domain decides; ADS owns FYP academic administration).

### Cross-Context Contracts

Other domains consume ADS through:

| Contract | Mechanism |
|---|---|
| `course_id` | Entity reference — resolved by ADS |
| `institution_id` | Tenant scope — resolved by IAD, used by ADS for RLS |
| `student_id` / `lecturer_id` | User reference — resolved by IAD |
| `enrollment_status` | Flag — consumed by Learning for content access |
| `academic_standing` | Flag — consumed by Administration for financial aid eligibility |
| `gpa` / `credits_earned` | Computed values — consumed by Analytics, Administration |

---

## 5. Domain Principles

1. **Structure precedes content.** Courses, programs, and curricula are defined before learning materials are attached.
2. **Enrollment is gated.** A student cannot enroll without identity verification, financial clearance, and prerequisite completion.
3. **Academic records are immutable after publication.** Grades, once published, can only be corrected through formal amendment workflows — never silently overwritten.
4. **Tenant isolation is enforced.** All academic entities are scoped by `institution_id` via RLS.
5. **Assessment integrity is non-negotiable.** Exam attempts are time-bound, identity-verified, and audit-logged.
6. **Progressive verification.** Academic standing accumulates over time — no retroactive grade changes without authority.
7. **Approval workflows are explicit.** Every academic action with consequences (enrollment, grade change, graduation) routes through defined approval chains.
8. **Transcripts are authoritative.** The transcript is the single source of truth for a student's academic achievement.
9. **Oracle governs executive academic actions.** Grade overrides, standing changes, and graduation approvals require authority codes.
10. **Platform-native.** ADS uses Base44 entities, RLS, and realtime events — no custom database layer.

---

## 6. Canonical Entities

All entities are JSON schemas in `base44/entities/`. Built-in attributes (never declared): `id`, `created_date`, `updated_date`, `created_by_id`.

### 6.1 Institutional Hierarchy

#### Academic Institution (Alias of `Institution` — IAD-owned)

| Field | Type | Notes |
|---|---|---|
| `name` | string | University name |
| `type` | enum | university, polytechnic, college, institute |
| `academic_calendar_type` | enum | semester, trimester, quarter, annual |
| `grading_scale` | string | Reference to GPA scale used |

> **Implementation Note:** The `Institution` entity is owned by IAD. ADS extends it with academic metadata. No duplicate entity is created — this is a domain alias per the Single Ownership rule.

#### Faculty *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "Faculty of Engineering" |
| `institution_id` | string | Tenant scope |
| `dean_staff_id` | string | Faculty head (Staff reference) |
| `description` | string | |
| `status` | enum | active, archived |

#### School *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "School of Computing" |
| `faculty_id` | string | Parent faculty |
| `institution_id` | string | Tenant scope |
| `director_staff_id` | string | School head |
| `status` | enum | active, archived |

#### Department *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "Department of Computer Science" |
| `school_id` | string | Parent school |
| `faculty_id` | string | Parent faculty (denormalized) |
| `institution_id` | string | Tenant scope |
| `hod_staff_id` | string | Head of department |
| `status` | enum | active, archived |

#### Programme *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "B.Sc. Computer Science" |
| `code` | string | Programme code |
| `department_id` | string | Owning department |
| `institution_id` | string | Tenant scope |
| `degree_type` | enum | bsc, ba, beng, msc, phd, diploma, certificate |
| `duration_years` | number | Standard duration |
| `total_credits` | number | Credits required for completion |
| `curriculum_id` | string | Active curriculum reference |
| `status` | enum | active, suspended, archived |

### 6.2 Curriculum & Catalog

#### Curriculum *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `programme_id` | string | Owning programme |
| `version` | string | Curriculum version (e.g., "2024-2025") |
| `institution_id` | string | Tenant scope |
| `course_requirements` | array | Required courses with credit weights |
| `elective_options` | array | Elective course groups |
| `total_credits` | number | Total credits for completion |
| `effective_from` | string (date) | Activation date |
| `effective_until` | string (date) | Optional sunset date |
| `status` | enum | draft, active, superseded |

#### Course *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `title` | string | Course title |
| `code` | string | Course code (normalized via `courseNormalizer.js`) |
| `description` | string | |
| `credits` | number | Credit hours |
| `level` | enum | 100, 200, 300, 400, 500, 600, 700 |
| `department_id` | string | Owning department *(proposed)* |
| `programme_ids` | array | Programmes offering this course *(proposed)* |
| `prerequisite_course_ids` | array | Prerequisite courses |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, archived |

### 6.3 Academic Calendar

#### Academic Session *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `institution_id` | string | Tenant scope |
| `name` | string | e.g., "2024/2025 Academic Session" |
| `start_date` | string (date) | |
| `end_date` | string (date) | |
| `status` | enum | upcoming, active, completed |

#### Semester *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `academic_session_id` | string | Parent session |
| `institution_id` | string | Tenant scope |
| `name` | string | e.g., "First Semester 2024/2025" |
| `term` | enum | first, second, third, summer |
| `start_date` | string (date) | |
| `end_date` | string (date) | |
| `registration_window` | object | `{ start, end }` |
| `add_drop_deadline` | string (date) | |
| `withdrawal_deadline` | string (date) | |
| `status` | enum | upcoming, registration_open, active, exams, grading, completed |

### 6.4 Teaching & Classes

#### Class *(Proposed Extension — Course Offering)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course |
| `semester_id` | string | Offering semester |
| `institution_id` | string | Tenant scope |
| `section_code` | string | e.g., "CSC 101 - Section A" |
| `lecturer_staff_id` | string | Primary lecturer (Staff reference) |
| `assistant_staff_ids` | array | Teaching assistants |
| `schedule` | array | Timetable slots (day, start_time, end_time, venue) |
| `capacity` | number | Max enrollment |
| `enrolled_count` | number | Current enrollment (denormalized) |
| `delivery_mode` | enum | in_person, online, hybrid |
| `status` | enum | scheduled, active, completed, cancelled |

#### Lecturer (Alias of `Staff` — shared with Administration)

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Linked User (IAD) |
| `institution_id` | string | Tenant scope |
| `staff_number` | string | Employee ID |
| `department_id` | string | Primary department *(proposed)* |
| `rank` | enum | graduate_assistant, assistant_lecturer, lecturer, senior_lecturer, professor |
| `status` | enum | active, on_leave, suspended, exited |

> **Implementation Note:** `Staff` entity is shared. ADS owns academic assignment; Administration owns employment.

#### Student (Alias of `User` + `StudentIdentifier` — IAD-owned)

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | IAD User reference |
| `matriculation_number` | string | From `StudentIdentifier` |
| `programme_id` | string | Enrolled programme *(proposed)* |
| `current_level` | number | 100, 200, 300, 400, 500 |
| `enrollment_status` | enum | active, probation, suspended, graduated, withdrawn |
| `academic_standing` | enum | good_standing, probation, warning, suspended |
| `advisor_staff_id` | string | Academic advisor |
| `institution_id` | string | Tenant scope |

> **Implementation Note:** Student identity is owned by IAD (`User` + `StudentIdentifier`). ADS extends with academic metadata via `StudentRecord`.

#### StudentRecord *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Student reference |
| `institution_id` | string | Tenant scope |
| `programme_id` | string | *(proposed)* |
| `current_level` | number | |
| `enrollment_status` | enum | active, probation, suspended, graduated, withdrawn |
| `academic_standing` | enum | good_standing, probation, warning, suspended |
| `gpa` | number | Computed GPA |
| `credits_earned` | number | Total credits completed |
| `credits_attempted` | number | Total credits attempted |
| `advisor_staff_id` | string | Academic advisor *(proposed)* |
| `expected_graduation_date` | string (date) | |

### 6.5 Enrollment

#### Enrollment *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `class_id` | string | Course offering |
| `course_id` | string | Denormalized for fast filtering |
| `semester_id` | string | Enrollment semester |
| `institution_id` | string | Tenant scope |
| `enrollment_date` | string (date) | |
| `enrollment_type` | enum | normal, repeat, audit, elective |
| `status` | enum | registered, active, withdrawn, completed, failed |
| `withdrawal_date` | string (date) | If withdrawn |
| `withdrawal_reason` | string | |
| `final_grade_id` | string | Final grade reference (set at completion) |
| `credits_attempted` | number | |
| `credits_earned` | number | |

### 6.6 Attendance

#### AttendanceSession *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `class_id` | string | Course offering *(proposed)* |
| `course_id` | string | Denormalized |
| `session_date` | string (date) | |
| `start_time` | string | HH:MM |
| `end_time` | string | HH:MM |
| `lecturer_id` | string | Session conductor |
| `institution_id` | string | Tenant scope |
| `delivery_mode` | enum | in_person, online, hybrid |
| `status` | enum | scheduled, active, completed, cancelled |

#### AttendanceRecord *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `session_id` | string | Parent session |
| `student_id` | string | User reference |
| `class_id` | string | *(proposed)* |
| `course_id` | string | Denormalized |
| `status` | enum | present, absent, late, excused |
| `check_in_time` | string (datetime) | |
| `excuse_reason` | string | If excused |
| `verified_by` | string | Lecturer or biometric system |
| `institution_id` | string | Tenant scope |

### 6.7 Assessment

#### Assignment *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course |
| `class_id` | string | *(proposed)* |
| `title` | string | |
| `description` | string | |
| `type` | enum | homework, project, presentation, lab_report, quiz |
| `max_score` | number | |
| `weight_percent` | number | Contribution to final grade |
| `due_date` | string (datetime) | |
| `submission_type` | enum | file_upload, text, link, none |
| `allow_late_submission` | boolean | |
| `late_penalty_percent` | number | Per day late |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, closed, graded |

#### Assessment *(Proposed Extension — Assessment Component)*

| Field | Type | Notes |
|---|---|---|
| `class_id` | string | Parent class offering |
| `course_id` | string | Denormalized |
| `title` | string | e.g., "Continuous Assessment", "Midterm" |
| `type` | enum | assignment, quiz, test, project, presentation, lab |
| `max_score` | number | |
| `weight_percent` | number | |
| `due_date` | string (datetime) | |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, closed, graded |

### 6.8 Examination

#### Exam *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `course_id` | string | Parent course |
| `class_id` | string | *(proposed)* |
| `title` | string | |
| `type` | enum | midterm, final, makeup, supplementary |
| `max_score` | number | |
| `weight_percent` | number | |
| `scheduled_date` | string (datetime) | |
| `duration_minutes` | number | |
| `venue` | string | Physical or virtual |
| `institution_id` | string | Tenant scope |
| `status` | enum | scheduled, active, completed, cancelled |

#### ExamPaper *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `exam_id` | string | Parent exam |
| `title` | string | |
| `instructions` | string | |
| `total_questions` | number | |
| `total_marks` | number | |
| `passing_marks` | number | |
| `time_limit_minutes` | number | |
| `institution_id` | string | Tenant scope |
| `status` | enum | draft, published, archived |

#### ExamQuestion *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `paper_id` | string | Parent paper |
| `question_text` | string | |
| `question_type` | enum | multiple_choice, true_false, short_answer, essay, code, file_upload |
| `options` | array | For MCQ |
| `correct_answer` | string | |
| `marks` | number | |
| `explanation` | string | |
| `order` | number | Display order |

#### ExamAttempt *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `paper_id` | string | Parent paper |
| `exam_id` | string | Denormalized |
| `student_id` | string | User reference |
| `class_id` | string | *(proposed)* |
| `institution_id` | string | Tenant scope |
| `start_time` | string (datetime) | |
| `end_time` | string (datetime) | |
| `answers` | array | Student responses |
| `score` | number | |
| `max_score` | number | |
| `percentage` | number | |
| `status` | enum | not_started, in_progress, submitted, graded, disputed |
| `graded_by` | string | Lecturer or AI |
| `graded_at` | string (datetime) | |
| `feedback` | string | |
| `time_spent_minutes` | number | |

#### ExamCertificate *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `exam_id` | string | |
| `attempt_id` | string | |
| `student_id` | string | User reference |
| `certificate_number` | string | Unique cert ID |
| `issued_date` | string (date) | |
| `score` | number | |
| `grade` | string | |
| `issued_by` | string | Issuing authority |
| `institution_id` | string | Tenant scope |
| `status` | enum | issued, revoked |

### 6.9 Grading

#### Grade *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., "A", "B+", "C" |
| `score_min` | number | Minimum percentage |
| `score_max` | number | Maximum percentage |
| `grade_point` | number | GPA contribution |
| `description` | string | |
| `institution_id` | string | Tenant scope |

#### StudentGrade *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `course_id` | string | |
| `class_id` | string | *(proposed)* |
| `semester_id` | string | *(proposed)* |
| `institution_id` | string | Tenant scope |
| `assessment_type` | enum | assignment, midterm, final, continuous, project |
| `assessment_id` | string | Reference to assignment/exam |
| `score` | number | Raw score |
| `max_score` | number | |
| `percentage` | number | |
| `grade` | string | Letter grade |
| `grade_point` | number | GPA contribution |
| `credits` | number | Course credits |
| `graded_by` | string | Lecturer |
| `graded_at` | string (datetime) | |
| `published_at` | string (datetime) | When visible to student |
| `status` | enum | draft, submitted, published, amended |
| `amendment_reason` | string | If amended |

### 6.10 Academic Records

#### Transcript *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `institution_id` | string | Tenant scope |
| `programme_id` | string | *(proposed)* |
| `generated_date` | string (date) | |
| `semester_summaries` | array | Per-semester GPA + credits + courses |
| `cumulative_gpa` | number | |
| `total_credits_earned` | number | |
| `total_credits_attempted` | number | |
| `class_of_degree` | string | e.g., "First Class Honours" |
| `status` | enum | active, official_issued, superseded |
| `issued_copies` | array | Official transcript issuances |

#### AcademicStanding *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `institution_id` | string | Tenant scope |
| `standing` | enum | good_standing, warning, probation, strict_probation, suspended, dismissed |
| `gpa` | number | GPA at standing determination |
| `term` | string | Academic term |
| `set_at` | string (datetime) | |
| `set_by` | string | Authority (lecturer/admin) |
| `review_date` | string (date) | Next review |
| `conditions` | string | Conditions for restoration |
| `status` | enum | active, resolved, escalated |

#### AcademicTimelineEntry *(Exists)*

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Student reference |
| `entry_type` | enum | enrollment, completion, grade, award, milestone, standing_change |
| `title` | string | |
| `description` | string | |
| `date` | string (date) | |
| `institution_id` | string | Tenant scope |
| `metadata` | object | Structured context |

### 6.11 Graduation

#### Graduation *(Proposed Extension)*

| Field | Type | Notes |
|---|---|---|
| `student_id` | string | User reference |
| `institution_id` | string | Tenant scope |
| `programme_id` | string | *(proposed)* |
| `academic_session_id` | string | Graduation session |
| `graduation_date` | string (date) | |
| `class_of_degree` | string | e.g., "First Class Honours" |
| `final_gpa` | number | |
| `total_credits_earned` | number | |
| `status` | enum | applied, approved, scheduled, graduated, revoked |
| `approved_by` | string | Authority |
| `approved_at` | string (datetime) | |
| `honors` | string | If applicable |

#### Certificate *(Proposed Extension — Graduation Certificate)*

| Field | Type | Notes |
|---|---|---|
| `graduation_id` | string | Parent graduation |
| `student_id` | string | User reference |
| `institution_id` | string | Tenant scope |
| `certificate_number` | string | Unique cert ID |
| `programme_name` | string | Denormalized |
| `degree_type` | string | e.g., "Bachelor of Science" |
| `class_of_degree` | string | |
| `issue_date` | string (date) | |
| `issued_by` | string | Issuing authority |
| `verification_code` | string | Public verification code |
| `status` | enum | issued, revoked, replaced |

### 6.12 Existing Supporting Entities

| Entity | Role |
|---|---|
| `OfficeHoursSlot` | Lecturer availability for student consultations |
| `OfficeHoursBooking` | Student bookings for office hours |
| `LiveClass` | Live classroom sessions (shared with Campus/Learning) |
| `LiveRecording` | Class recordings |
| `StaffAnnouncement` | Staff-targeted announcements |
| `AnnouncementRead` | Announcement read tracking |
| `Admission` | Admission records (shared with Administration) |
| `TimetableEntry` | Timetable slot entries |
| `InstitutionTimetable` | Institution-wide timetable |

---

## 7. Value Objects

Value objects are not persisted independently — they are embedded in entities or used transiently.

| Value Object | Type | Description |
|---|---|---|
| `CourseCode` | string | Normalized course identifier (`courseNormalizer.js`) |
| `GPAScale` | object | GPA calculation rules (`gpaScale.js`) — 4.0, 5.0, percentage scales |
| `GradePoint` | number | Numeric GPA contribution for a grade |
| `CreditHour` | number | Credit weight of a course |
| `TimeSlot` | object | `{ day, start_time, end_time, venue }` |
| `AcademicSession` | object | `{ year, term, start_date, end_date }` |
| `EnrollmentStatus` | enum | registered, active, withdrawn, completed, failed |
| `AcademicStanding` | enum | good_standing, warning, probation, suspended, dismissed |
| `AttendanceStatus` | enum | present, absent, late, excused |
| `GradeLetter` | string | A, B+, C, F, etc. |
| `ScorePercentage` | number | 0-100 normalized score |
| `PrerequisiteChain` | array | Ordered course prerequisites |
| `ApprovalChain` | array | Ordered approver roles |

---

## 8. Aggregates

### Aggregate 1: Institutional Hierarchy

**Root:** `Institution` (IAD-owned, ADS-extended)
**Members:** `Faculty`, `School`, `Department`, `Programme`

**Invariants:**
- Hierarchy is strict: Faculty → School → Department → Programme.
- A programme belongs to exactly one department.
- Deletion cascades: deleting a faculty archives all child schools, departments, programmes.

### Aggregate 2: Curriculum

**Root:** `Curriculum`
**Members:** Course requirements, elective groups

**Invariants:**
- Total credits match programme requirements.
- Versioning: a new curriculum supersedes the old; existing enrollments keep their version.

### Aggregate 3: Course Offering

**Root:** `Class` (course offering)
**Members:** `Enrollment` records, `AttendanceSession` records, `Assignment` records, `Exam` records, `Assessment` records

**Invariants:**
- Enrolled count cannot exceed capacity.
- Enrollment status transitions follow the enrollment lifecycle.
- All assessments belong to exactly one class offering.

### Aggregate 4: Exam

**Root:** `Exam`
**Members:** `ExamPaper`, `ExamQuestion`, `ExamAttempt`

**Invariants:**
- A student has at most one active attempt per exam (retakes are separate attempts with status tracking).
- Attempt time limits are enforced.
- Score calculation follows the paper's marking scheme.

### Aggregate 5: Academic Record

**Root:** `StudentRecord`
**Members:** `StudentGrade` records, `AcademicTimelineEntry` records, `AcademicStanding` records, `Transcript`

**Invariants:**
- GPA is computed from published grades only.
- Academic standing is derived from GPA per institution policy.
- Transcript is a read model generated from grade records.

### Aggregate 6: Graduation

**Root:** `Graduation`
**Members:** `Certificate` records

**Invariants:**
- Graduation requires: all programme credits earned, GPA above minimum, no outstanding fees (Administration check), identity verified (IAD check).
- Certificate issuance is one-time; revocation requires authority code.

---

## 9. Domain Services

Domain services contain business logic that doesn't belong to a single entity.

| Service | Implementation | Responsibility |
|---|---|---|
| `AcademicRepository` | `src/lib/academic/academicApi.js` | Data access wrapper for academic entities |
| `CourseNormalizer` | `src/lib/academic/courseNormalizer.js` | Normalize course codes across formats |
| `GPACalculator` | `src/lib/academic/gpaScale.js` | Calculate GPA per institution scale |
| `ReportEngine` | `src/lib/academic/reportEngine.js` | Generate transcripts, performance reports, study analytics |
| `EnrollmentService` | *(proposed)* `src/lib/academic/enrollmentService.js` | Validate prerequisites, check capacity, process enrollment |
| `AttendanceService` | `src/lib/attendance/useSmartAttendance.js` | Smart attendance recording, biometric/QR integration |
| `ExamGradingService` | `src/lib/exam/grading.js` | Grade exam attempts, apply marking schemes |
| `AcademicPolicyService` | *(proposed)* `src/lib/academic/policyEngine.js` | Enforce enrollment limits, GPA thresholds, prerequisites |
| `TranscriptGenerator` | *(proposed)* extends `reportEngine.js` | Generate official transcripts |
| `StandingCalculator` | *(proposed)* `src/lib/academic/standingCalculator.js` | Determine academic standing from GPA |
| `AcademicModuleRegistry` | `src/lib/academic/registry.js`, `src/lib/academics/registry.js` | Register academic UI modules |
| `AcademicRecommendations` | `src/hooks/useAcademicRecommendations.js` | AI-powered academic recommendations |

---

## 10. Application Services

Application services orchestrate domain services for use-case flows.

| Service | Flow |
|---|---|
| `RegistrationFlow` | Student selects courses → prerequisite check → capacity check → financial clearance check (Administration) → enrollment created |
| `EnrollmentManagementFlow` | Add/drop courses within registration window → update enrollment status |
| `ClassSchedulingFlow` | Lecturer/admin creates class → assigns timetable slot → assigns to course offering |
| `AssessmentCreationFlow` | Lecturer creates assignment/exam → configures grading → publishes to students |
| `ExamExecutionFlow` | Student starts attempt → time tracking → auto-submit on timeout → grading → score publication |
| `GradeSubmissionFlow` | Lecturer enters grades → submit for approval → publish to students → update transcript |
| `GradeAmendmentFlow` | Lecturer requests amendment → authority code verification → audit log → update grade |
| `AttendanceRecordingFlow` | Lecturer creates session → marks attendance → syncs to enrollment |
| `StandingReviewFlow` | End of semester → calculate GPA → determine standing → notify student → update record |
| `GraduationApplicationFlow` | Student applies → eligibility check (credits, GPA, fees, identity) → department approval → faculty approval → graduation recorded → certificate issued |
| `TranscriptRequestFlow` | Student requests → generate transcript → official issuance (if authorized) |
| `OnboardingFlow` | Admission → student record creation → programme enrollment → orientation |

---

## 11. Commands

Commands are write operations that change state.

| Command | Auth Requirement | Effect |
|---|---|---|
| `CreateFaculty` | Admin + authority code | Creates Faculty |
| `CreateSchool` | Admin + authority code | Creates School under Faculty |
| `CreateDepartment` | Admin + authority code | Creates Department under School |
| `CreateProgramme` | Admin + authority code | Creates Programme under Department |
| `CreateCurriculum` | Admin | Creates/versions a Curriculum |
| `CreateCourse` | Admin / Lecturer | Creates Course in catalog |
| `CreateAcademicSession` | Admin | Creates academic session |
| `CreateSemester` | Admin | Creates semester under session |
| `CreateClassOffering` | Admin / Lecturer | Creates course offering (Class) |
| `EnrollStudent` | Student / Admin | Creates Enrollment (gated by prerequisites + clearance) |
| `WithdrawEnrollment` | Student / Admin (within window) | Updates Enrollment status to withdrawn |
| `CreateAssignment` | Lecturer | Creates Assignment |
| `CreateAssessment` | Lecturer | Creates Assessment component |
| `CreateExam` | Lecturer / Admin | Creates Exam |
| `CreateExamPaper` | Lecturer | Creates ExamPaper with questions |
| `StartExamAttempt` | Student (verified) | Creates ExamAttempt |
| `SubmitExamAttempt` | Student | Submits attempt for grading |
| `GradeExamAttempt` | Lecturer / AI | Updates attempt score + status |
| `PublishExamResults` | Lecturer / Admin | Makes results visible to students |
| `RecordAttendance` | Lecturer / System | Creates AttendanceRecord |
| `SubmitGrade` | Lecturer | Creates StudentGrade (draft) |
| `PublishGrade` | Lecturer / Admin (authority code for amendments) | Publishes StudentGrade |
| `AmendGrade` | Lecturer + authority code | Amends published grade with reason |
| `UpdateAcademicStanding` | Admin + authority code | Updates AcademicStanding |
| `ApplyForGraduation` | Student | Creates Graduation application |
| `ApproveGraduation` | Admin + authority code | Approves graduation, triggers certificate |
| `IssueCertificate` | Admin + authority code | Issues Certificate |
| `RevokeCertificate` | Admin + authority code | Revokes Certificate |
| `GenerateTranscript` | Student (own) / Admin | Generates Transcript |
| `IssueOfficialTranscript` | Admin | Issues official transcript copy |

---

## 12. Queries

Queries are read operations that do not change state.

| Query | Access | Returns |
|---|---|---|
| `GetInstitutionHierarchy` | Authenticated | Faculty → School → Department → Programme tree |
| `ListFaculties` | Authenticated | Faculty list |
| `ListProgrammes` | Public | Programme catalog |
| `GetProgramme` | Public | Programme details + curriculum |
| `GetCurriculum` | Authenticated | Curriculum with course requirements |
| `ListCourses` | Authenticated | Course catalog |
| `GetCourse` | Authenticated | Course details + prerequisites |
| `ListClasses` | Student / Lecturer / Admin | Course offerings for semester |
| `GetClassDetails` | Enrolled student / Lecturer / Admin | Class with schedule, enrollment, assessments |
| `GetStudentEnrollments` | Student (own) / Admin | Enrollment history |
| `CheckEnrollmentEligibility` | Student / System | Prerequisite + clearance check result |
| `GetTimetable` | Student / Lecturer | Timetable entries for user |
| `GetAttendance` | Student (own) / Lecturer / Admin | Attendance records |
| `GetAttendanceRate` | Student (own) / Lecturer | Computed attendance percentage |
| `ListAssignments` | Enrolled student / Lecturer | Assignments for class |
| `GetExamPaper` | Enrolled student (during exam window) / Lecturer | Exam paper |
| `GetExamAttempt` | Student (own) / Lecturer / Admin | Attempt details + score |
| `GetStudentGrades` | Student (own) / Admin / Lecturer | Grade history |
| `GetTranscript` | Student (own) / Admin | Generated transcript |
| `GetAcademicStanding` | Student (own) / Admin | Current standing |
| `GetGPA` | Student (own) / Admin | Computed GPA |
| `GetGraduationStatus` | Student (own) / Admin | Graduation application status |
| `VerifyCertificate` | Public | Certificate verification by code |
| `GetAcademicTimeline` | Student (own) / Admin | Academic milestone timeline |
| `GenerateReport` | Student (own) / Admin | Full academic report via `reportEngine.js` |

---

## 13. Events

Events are published through entity realtime subscriptions.

| Event | Trigger | Consumers |
|---|---|---|
| `CurriculumPublished` | Curriculum status → published | Learning (content alignment), Analytics |
| `CourseCreated` | Course created | Learning (materials), Community (study groups) |
| `ClassCreated` | Class offering created | Notification (enrollment window), Timetable |
| `EnrollmentCreated` | Student enrolled | Notification, Learning (content access), AI (Bud context) |
| `EnrollmentWithdrawn` | Student withdrawn | Notification, Administration (fee adjustment) |
| `AssignmentCreated` | Assignment published | Workflow (deadline reminders), Notification |
| `ExamScheduled` | Exam created/scheduled | Workflow (exam countdown), Notification |
| `ExamAttemptStarted` | Student starts attempt | Monitoring (integrity), AI (Exam Coach) |
| `ExamAttemptSubmitted` | Student submits attempt | AI (grading if auto), Notification |
| `ExamGraded` | Attempt graded | Notification, Analytics |
| `GradePublished` | StudentGrade published | Notification, Analytics, Administration (standing) |
| `GradeAmended` | Grade amended | AuditLog, Notification, Analytics |
| `AttendanceRecorded` | Attendance marked | Analytics, Administration (compliance) |
| `StandingUpdated` | Academic standing changed | Notification, Administration (financial aid), AI (Bud support) |
| `GraduationApplied` | Student applies for graduation | Administration (fee check), Notification |
| `GraduationApproved` | Graduation approved | Notification, IAD (identity verification), Certificate issuance |
| `CertificateIssued` | Certificate issued | Notification, Analytics, IAD (credential) |
| `CertificateRevoked` | Certificate revoked | Notification, AuditLog, Analytics |
| `TranscriptRequested` | Student requests transcript | Administration (official copy), Notification |
| `StaffAnnouncementPublished` | Staff announcement published | Workflow (activateAnnouncements), Notification |

---

## 14. APIs

### Entity SDK (Primary)

```js
// Course management
base44.entities.Course.list()
base44.entities.Course.filter({ institution_id })
base44.entities.Course.create({ title, code, credits, ... })
base44.entities.Course.update(id, { ... })

// Enrollment
base44.entities.CourseMaterialProgress.filter({ user_id })
base44.entities.CourseMaterialProgress.create({ ... })

// Assignments
base44.entities.Assignment.filter({ course_id })
base44.entities.Assignment.create({ ... })

// Exams
base44.entities.Exam.filter({ course_id })
base44.entities.ExamPaper.filter({ exam_id })
base44.entities.ExamQuestion.filter({ paper_id })
base44.entities.ExamAttempt.filter({ student_id })
base44.entities.ExamAttempt.create({ ... })
base44.entities.ExamAttempt.update(id, { status, score })

// Attendance
base44.entities.AttendanceSession.filter({ class_id })
base44.entities.AttendanceRecord.filter({ student_id })

// Grades
base44.entities.StudentGrade.filter({ student_id })
base44.entities.Grade.list()

// Office hours
base44.entities.OfficeHoursSlot.filter({ lecturer_id })
base44.entities.OfficeHoursBooking.filter({ student_id })

// Timeline
base44.entities.AcademicTimelineEntry.filter({ user_id })
```

### Backend Functions

| Function | Purpose |
|---|---|
| `examReminders` | Exam countdown notifications |
| `googleCalendarSync` | Sync academic calendar with Google Calendar |
| `studyGroupEventBridge` | Bridge academic events to study groups |
| `activateAnnouncements` | Activate scheduled staff announcements |
| `transcribeEpisode` | Transcribe lecture recordings |

### Academic-Specific Endpoints (Proposed)

| Endpoint | Purpose |
|---|---|
| `checkEnrollmentEligibility` | Validate prerequisites + financial clearance |
| `calculateGPA` | Compute GPA from published grades |
| `generateTranscript` | Generate official transcript |
| `verifyCertificate` | Public certificate verification |

---

## 15. Permissions

### RLS Patterns

| Pattern | Rule | Usage |
|---|---|---|
| **Tenant scope** | `data.institution_id: "{{user.data.institution_id}}"` | All academic entities |
| **Student ownership** | `data.student_id: "{{user.id}}"` | Grades, attendance, enrollments |
| **Lecturer ownership** | `data.lecturer_id: "{{user.id}}"` or `created_by_id` | Classes, assignments, exams |
| **Enrollment gate** | Enrollment exists for (student, class) | Content access |
| **Published status** | `data.status: "published"` | Public catalog access |
| **Role-based** | `user_condition: { role: "admin" }` | Administrative operations |

### Permission Matrix

| Resource | Read | Create | Update | Delete |
|---|---|---|---|---|
| `Faculty` / `School` / `Department` / `Programme` | Authenticated | Admin + authority | Admin + authority | Admin + authority |
| `Curriculum` | Authenticated | Admin | Admin | Admin |
| `Course` | Published / owner / admin | Admin / Lecturer | Owner / Admin | Admin |
| `CourseMaterial` | Published / owner / admin | Admin / Lecturer | Owner / Admin | Owner / Admin |
| `Class` (offering) | Enrolled / lecturer / admin | Admin / Lecturer | Lecturer / Admin | Admin |
| `Enrollment` | Student (own) / admin | Student / Admin | Student / Admin | Admin |
| `Assignment` | Enrolled / owner / admin | Lecturer | Owner / Admin | Owner / Admin |
| `Exam` / `ExamPaper` | Enrolled / owner / admin | Lecturer / Admin | Owner / Admin | Admin |
| `ExamQuestion` | Owner / admin | Lecturer | Owner / Admin | Admin |
| `ExamAttempt` | Student (own) / lecturer / admin | Student (own) | Lecturer / Admin (grade) | Admin |
| `AttendanceRecord` | Student (own) / lecturer / admin | Lecturer / System | Lecturer / Admin | Admin |
| `StudentGrade` | Student (own) / lecturer / admin | Lecturer | Lecturer / Admin (authority for amend) | Admin |
| `Transcript` | Student (own) / admin | System / Admin | Admin | Admin |
| `AcademicStanding` | Student (own) / admin | Admin + authority | Admin + authority | Admin |
| `Graduation` | Student (own) / admin | Student (apply) | Admin + authority | Admin |
| `Certificate` | Public (verify) / admin | Admin + authority | Admin + authority (revoke) | Admin |
| `OfficeHoursSlot` | Open / owner / admin | Lecturer | Owner / Admin | Owner / Admin |
| `StaffAnnouncement` | Staff / admin | Admin / Staff | Owner / Admin | Owner / Admin |

### Authority Code Requirements

| Action | Authority Tier |
|---|---|
| Create/modify institutional hierarchy | A2 (Administrative) |
| Publish grades (bulk) | A3 (Operational) |
| Amend published grades | A2 (Administrative) |
| Update academic standing | A2 (Administrative) |
| Approve graduation | A2 (Administrative) |
| Issue/revoke certificates | A2 (Administrative) |
| Override enrollment limits | A2 (Administrative) |

---

## 16. Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| Deadline Reminders | `scheduled` | Assignment deadline notifications |
| Exam Countdown | `scheduled` | Exam countdown notifications |
| Activate Scheduled Announcements | `scheduled` | Staff announcement activation |
| Study Group Message Notifications | `entity` (StudyGroupMessage) | Academic study group messaging |
| Study Group Task Notifications | `entity` (StudyGroupTask) | Academic study group tasks |
| Grade Publication Notification | `entity` (StudentGrade published) | Notify students of new grades |
| Standing Review | `scheduled` (end of semester) | Recalculate academic standing |
| Graduation Eligibility Check | `scheduled` | Identify eligible graduates |

---

## 17. AI Interactions

### Bud Study Agent

The Bud Study agent (`base44/agents/study.jsonc`) is the primary AI interface for academic assistance.

| Intent | Bud Action | Authority Required |
|---|---|---|
| "What assignments are due?" | Reads Assignment entities, prioritizes by due date | None (self-query) |
| "Help me study for my exam" | Routes to Exam Coach, generates study plan | None |
| "What's my GPA?" | Reads StudentGrade, calculates GPA | None (self-query) |
| "Can I enroll in CSC 401?" | Checks prerequisites, capacity, clearance | None (self-query) |
| "Explain my academic standing" | Reads AcademicStanding, explains implications | None (self-query) |
| "Generate my transcript" | Triggers transcript generation | None (self-service) |
| "Apply for graduation" | Checks eligibility, initiates application | None (self-service) |
| "Override a grade" | Routes to lecturer → authority code verification | A2+ authority code |

### AI-Powered Academic Tools

| Tool | Location | Purpose |
|---|---|---|
| Exam Coach | `/exam/coach` | AI exam preparation with practice questions |
| Assignment Assistant | `/study/assignment` | AI assignment help (guidance, not completion) |
| Project Assistant | `/study/project` | AI project guidance |
| Academic Recommendations | `useAcademicRecommendations.js` | Course/program recommendations based on performance |
| Report Insights | `reportEngine.js` + `InvokeLLM` | LLM-generated insights on academic performance |
| Smart Attendance | `useSmartAttendance.js` | AI-assisted attendance verification |
| Exam Auto-Grading | `grading.js` + `InvokeLLM` | AI grading for essay/code questions |

### Oracle Governance

Oracle validates all executive academic actions:
- Grade amendments require authority code verification
- Standing changes are audit-logged
- Graduation approvals route through Oracle
- Certificate revocation requires A2+ authority

---

## 18. Integration Points

| Integration | Direction | Mechanism |
|---|---|---|
| **Identity & Access (IAD)** | Bidirectional | ADS references `user_id`, `institution_id`; IAD provides identity verification status |
| **Learning Domain** | Bidirectional | ADS owns `Course` structure; Learning owns `CourseMaterial` delivery + `CourseMaterialProgress` |
| **Research Domain** | Bidirectional | ADS owns `FYPProject` academic administration; Research owns research lifecycle |
| **Administration Domain** | Bidirectional | ADS checks financial clearance before enrollment; Administration owns fees, scholarships |
| **Analytics Domain** | Outbound | ADS provides raw academic data; Analytics computes insights |
| **AI Domain** | Bidirectional | ADS provides assessment structure; AI provides tutoring, grading, recommendations |
| **Workflow Domain** | Bidirectional | ADS events trigger workflows (reminders, standing reviews) |
| **Campus Domain** | Bidirectional | ADS uses campus venues for scheduling; Campus owns physical infrastructure |
| **Google Calendar** | Outbound | Academic calendar sync via `googleCalendarSync` function + connector |
| **Google Classroom** | Available | Not yet connected; available for course content sync |

---

## 19. Security Requirements

1. **Tenant isolation enforced via RLS.** All academic entities scoped by `institution_id`.
2. **Student data is ownership-scoped.** Grades, attendance, enrollments: `data.student_id: "{{user.id}}"`.
3. **Exam integrity is non-negotiable.**
   - Attempts are time-bound and enforced server-side.
   - Student identity verified before attempt start.
   - Attempts are audit-logged (start, submit, grade).
   - No retroactive attempt modification without authority code.
4. **Grade immutability after publication.** Published grades can only be amended through formal workflow with authority code + audit log.
5. **Enrollment gating.** Enrollment requires: identity verification (IAD), financial clearance (Administration), prerequisite completion (ADS).
6. **Certificate verification.** Public verification codes; revocation requires authority code.
7. **Transcript integrity.** Official transcripts are admin-issued; student-generated copies are watermarked "unofficial."
8. **Proctoring.** Live exams (in-person) verified by lecturer; online exams use time-bound attempts + browser integrity checks.
9. **Academic standing is authoritative.** Standing changes require admin + authority code; students cannot self-modify.
10. **Audit trail.** All grade changes, standing updates, enrollment modifications, and certificate issuances are logged to `AuditLog`.

---

## 20. Privacy Requirements

1. **Student-centric data ownership.** Students own their academic records; access is granted to lecturers/admins by role.
2. **Matriculation privacy.** `src/lib/matriculationPrivacy.js` governs matriculation number visibility — not exposed to peers.
3. **Grade privacy.** Grades are visible only to: the student, their lecturers, their academic advisor, and admins. Never visible to peers.
4. **Attendance privacy.** Attendance records are visible only to the student, their lecturers, and admins.
5. **Transcript access.** Students can generate their own transcript; official copies require admin issuance.
6. **Standing privacy.** Academic standing is visible only to the student, their advisor, and admins. Not broadcast.
7. **Certificate verification.** Public verification reveals only: programme, degree type, class of degree, issue date. No GPA or detailed grades.
8. **Data retention.** Academic records are retained permanently (compliance requirement). Student-initiated deletion removes personal data but retains anonymized academic records for institutional accreditation.
9. **Analytics privacy.** Academic analytics use aggregated/anonymized data; no individual student PII in dashboards visible to non-admins.

---

## 21. Audit Requirements

| Event | Logged To | Retention |
|---|---|---|
| Grade publication | `AuditLog` | Permanent |
| Grade amendment | `AuditLog` + `StudentGrade.amendment_reason` | Permanent |
| Exam attempt (start/submit/grade) | `AuditLog` + `ExamAttempt` | Permanent |
| Enrollment creation/withdrawal | `AuditLog` + `Enrollment` | Permanent |
| Academic standing change | `AuditLog` + `AcademicStanding` | Permanent |
| Graduation approval | `AuditLog` + `Graduation` | Permanent |
| Certificate issuance/revocation | `AuditLog` + `Certificate` | Permanent |
| Curriculum version change | `AuditLog` + `Curriculum` | Permanent |
| Attendance modification | `AuditLog` | Per policy |
| Timetable changes | `AuditLog` | Per policy |
| Authority code usage (academic) | `AuditLog` via `logExecutiveAction` | Permanent |
| AI-graded assessments | `SparkExecutionLog` | Permanent |

---

## 22. Data Ownership

| Entity | Owner | Tenant-Scoped? |
|---|---|---|
| `Institution` (academic alias) | IAD (shared) | Is the tenant |
| `Faculty` / `School` / `Department` / `Programme` | ADS | Yes |
| `Curriculum` | ADS | Yes |
| `Course` | ADS | Yes |
| `CourseMaterial` | ADS (structure) / Learning (delivery) | Yes |
| `CourseMaterialProgress` | Learning | Yes |
| `AcademicSession` / `Semester` | ADS | Yes |
| `Class` (offering) | ADS | Yes |
| `Staff` (lecturer) | Administration (employment) / ADS (assignment) | Yes |
| `StudentRecord` | ADS | Yes |
| `Enrollment` | ADS | Yes |
| `AttendanceSession` / `AttendanceRecord` | ADS | Yes |
| `Assignment` / `Assessment` | ADS | Yes |
| `Exam` / `ExamPaper` / `ExamQuestion` | ADS | Yes |
| `ExamAttempt` | ADS | Yes |
| `ExamCertificate` | ADS | Yes |
| `Grade` / `StudentGrade` | ADS | Yes |
| `Transcript` | ADS | Yes |
| `AcademicStanding` | ADS | Yes |
| `AcademicTimelineEntry` | ADS | Yes |
| `Graduation` / `Certificate` | ADS | Yes |
| `OfficeHoursSlot` / `OfficeHoursBooking` | ADS | Yes |
| `LiveClass` / `LiveRecording` | ADS (shared with Campus/Learning) | Yes |
| `StaffAnnouncement` | ADS (content) / Administration (distribution) | Yes |
| `Admission` | ADS (shared with Administration) | Yes |
| `TimetableEntry` / `InstitutionTimetable` | ADS | Yes |

---

## 23. Lifecycle

### Institutional Hierarchy Lifecycle

```
Created → Active → (Reorganized) → Archived
```

### Curriculum Lifecycle

```
Draft → Published → Active → Superseded (by new version)
```

### Course Lifecycle

```
Draft → Published → Active → Archived
```

### Semester Lifecycle

```
Upcoming → Registration Open → Active → Exams → Grading → Completed
```

### Class Offering Lifecycle

```
Scheduled → Active (registration) → Active (teaching) → Completed → Archived
```

### Enrollment Lifecycle

```
Registered → Active → (Withdrawn) → Completed / Failed
```

### Assignment Lifecycle

```
Draft → Published → Open → Closed → Graded
```

### Exam Lifecycle

```
Scheduled → Active (exam window) → Completed → Graded → Published
```

### Exam Attempt Lifecycle

```
Not Started → In Progress → Submitted → Graded → (Disputed → Reviewed)
```

### Grade Lifecycle

```
Draft → Submitted → Published → (Amended with authority)
```

### Academic Standing Lifecycle

```
Good Standing → (GPA drops) → Warning → Probation → Strict Probation → Suspended → Dismissed
                                                                ↓
                                                    Restored (GPA improves)
```

### Graduation Lifecycle

```
Applied → Department Review → Faculty Review → Approved → Scheduled → Graduated → Certificate Issued
                                                                    ↓
                                                            Rejected (with reason)
```

### Certificate Lifecycle

```
Issued → (Active) → Revoked (authority code) / Replaced (new issue)
```

---

## 24. Extension Points

| Extension | Mechanism |
|---|---|
| New institutional hierarchy levels | Extend Faculty/School/Department pattern |
| New degree types | `Programme.degree_type` enum extension |
| New assessment types | `Assessment.type` / `Assignment.type` enum extension |
| New exam question types | `ExamQuestion.question_type` enum extension + grading logic |
| New grading scales | `gpaScale.js` + `Grade` entity records |
| New attendance methods (biometric, QR, NFC) | `AttendanceSession.delivery_mode` + `useSmartAttendance` |
| New report types | `reportEngine.js` + report components |
| New academic policies | `policyEngine.js` (proposed) |
| New certificate types | `Certificate` schema extension |
| New AI grading capabilities | `grading.js` + `InvokeLLM` integration |
| External exam board integrations | Backend functions in `base44/functions/` |
| Accreditation reporting | Analytics domain + `reportEngine.js` |

---

## 25. Conformance Requirements

Any implementation claiming conformance to this specification must:

- [ ] Enforce `institution_id` tenant scoping via RLS on all academic entities
- [ ] Gate enrollment on identity verification (IAD), financial clearance (Administration), and prerequisite completion (ADS)
- [ ] Enforce exam attempt time limits server-side
- [ ] Make published grades immutable (amendments require authority code + audit log)
- [ ] Log all grade changes, standing updates, enrollment modifications, and certificate issuances to `AuditLog`
- [ ] Require authority codes for: grade amendments, standing changes, graduation approvals, certificate issuance/revocation
- [ ] Enforce student-ownership RLS on grades, attendance, and enrollments
- [ ] Provide transcript generation with official/unofficial distinction
- [ ] Provide public certificate verification (revealing only non-sensitive fields)
- [ ] Enforce matriculation privacy (`matriculationPrivacy.js`)
- [ ] Support curriculum versioning (superseded curricula retain enrollments)
- [ ] Calculate GPA per institution-configured scale
- [ ] Support academic standing lifecycle with review dates
- [ ] Route executive academic actions through Oracle authority verification
- [ ] Never expose Oracle's command identifier publicly
- [ ] Never bypass the platform entity store (no custom database layer)

---

## Implementation Mapping

### Existing Implementation

| Spec Concept | v1.0 Implementation |
|---|---|
| Course management | `Course` entity + `src/lib/academic/academicApi.js` |
| Course materials | `CourseMaterial` entity + `src/components/academics/CourseMaterialComposer.jsx` |
| Assignments | `Assignment` entity + `src/pages/academics/Assignments.jsx` |
| Exams | `Exam`, `ExamPaper`, `ExamQuestion`, `ExamAttempt` entities |
| Exam platform | `src/pages/exam/` — ExamHub, ExamStart, ExamTaker, ExamResult, ExamAnalytics, ExamCoach, ExamAuthor |
| Exam grading | `src/lib/exam/grading.js` |
| Attendance | `AttendanceRecord`, `AttendanceSession` entities + `src/lib/attendance/useSmartAttendance.js` |
| Smart attendance | `src/pages/attendance/SmartAttendance.jsx` |
| Grades | `StudentGrade`, `Grade` entities |
| Timetable | `TimetableEntry`, `InstitutionTimetable` entities + `src/pages/academics/Timetable.jsx` |
| Office hours | `OfficeHoursSlot`, `OfficeHoursBooking` entities + `src/pages/academics/OfficeHours.jsx` |
| Academic timeline | `AcademicTimelineEntry` entity + `src/lib/identity/useAcademicTimeline.js` |
| Staff announcements | `StaffAnnouncement`, `AnnouncementRead` entities + `activateAnnouncements` function |
| Live classes | `LiveClass`, `LiveRecording` entities + `src/pages/classroom/LiveClassroom.jsx` |
| Lecturer portal | `src/pages/lecturer/LecturerPortal.jsx` + 14 sections |
| Academic reports | `src/lib/academic/reportEngine.js` + `src/components/academics/report/` |
| GPA calculation | `src/lib/academic/gpaScale.js` |
| Course normalization | `src/lib/academic/courseNormalizer.js` |
| Academic hub | `src/pages/academics/AcademicHub.jsx` |
| Courses page | `src/pages/academics/Courses.jsx` |
| Course space | `src/pages/academics/CourseSpace.jsx` |
| Calendar | `src/pages/academics/Calendar.jsx` |
| Projects | `Project`, `FYPProject` entities + `src/pages/academics/Projects.jsx` |
| Results | `src/pages/academics/Results.jsx` |
| Summary report | `src/pages/academics/SummaryReport.jsx` |
| Unified agenda | `src/pages/academics/UnifiedAgenda.jsx` |
| Admissions | `Admission` entity (shared with Administration) |
| Staff | `Staff` entity (shared with Administration) |

### Proposed Extensions (New Entities)

| Spec Concept | Proposed Entity | Priority |
|---|---|---|
| Faculty | `Faculty` | High — enables hierarchy |
| School | `School` | High — enables hierarchy |
| Department | `Department` | High — enables hierarchy |
| Programme | `Programme` | High — enables degree management |
| Curriculum | `Curriculum` | Medium — enables versioning |
| Academic Session | `AcademicSession` | Medium — enables calendar |
| Semester | `Semester` | Medium — enables term management |
| Class (offering) | `Class` | High — enables course offerings |
| Enrollment | `Enrollment` | High — replaces implicit enrollment |
| Assessment | `Assessment` | Medium — formalizes assessment components |
| Transcript | `Transcript` | Medium — formalizes transcript records |
| Academic Standing | `AcademicStanding` | Medium — formalizes standing |
| Graduation | `Graduation` | Medium — enables graduation workflow |
| Certificate (graduation) | `Certificate` | Medium — enables degree certificates |

> **Note:** These proposed extensions would be created as new entities in `base44/entities/` when the features are prioritized. The existing implementation uses implicit structures (e.g., enrollment via `CourseMaterialProgress`) that these entities would formalize.

---

## Cross-Domain Dependencies

### Identity & Access (IAD)
- **ADS depends on IAD for:** User identity, institution tenant, identity verification status
- **IAD provides:** `user_id`, `institution_id`, verification level
- **ADS provides to IAD:** Academic role context (student, lecturer) for routing

### Learning Domain
- **ADS depends on Learning for:** Content delivery, progress tracking
- **Learning depends on ADS for:** Course structure, enrollment validation
- **Shared entities:** `CourseMaterial` (ADS owns structure, Learning owns delivery), `CourseMaterialProgress` (Learning owns)

### Research Domain
- **ADS depends on Research for:** Research project lifecycle
- **Research depends on ADS for:** FYP academic administration
- **Shared entities:** `FYPProject` (ADS owns academic admin, Research owns research)

### Administration Domain
- **ADS depends on Administration for:** Financial clearance, fee status, scholarship eligibility
- **Administration depends on ADS for:** Academic standing (for financial aid), enrollment status (for fees)
- **Shared entities:** `Staff` (Administration owns employment, ADS owns assignment), `Admission` (shared), `StaffAnnouncement` (ADS owns content, Administration distributes)

### Analytics Domain
- **ADS provides to Analytics:** Raw academic data (grades, attendance, enrollment)
- **Analytics provides to ADS:** Derived insights (performance trends, at-risk students)
- **Shared entities:** `AuditLog` (ADS writes, Analytics reads for compliance)

### AI Domain
- **ADS provides to AI:** Assessment structure, grade history, academic context
- **AI provides to ADS:** Tutoring (Bud Study), grading assistance, recommendations, exam coaching
- **Shared entities:** `SparkExecutionLog` (for AI-graded assessments)

### Workflow Domain
- **ADS events trigger workflows:** Assignment deadlines, exam countdowns, standing reviews
- **Workflow provides to ADS:** Automated reminders, scheduled reviews
- **Shared entities:** `CalendarEvent` (ADS owns academic events, Workflow owns calendar infra)

### Campus Domain
- **ADS depends on Campus for:** Physical venue allocation
- **Campus depends on ADS for:** Class scheduling context
- **Shared entities:** `LiveClass` (ADS owns academic context, Campus owns physical)

---

## Known Limitations (Platform-Dependent)

1. **No native exam proctoring** — online exams rely on time limits + browser integrity, not camera monitoring
2. **No real-time collaboration** — live class recording/playback only, no WebRTC (platform limitation)
3. **Biometric attendance** — `Device` entity exists; full biometric verification is platform-dependent
4. **External exam board integration** — requires backend functions with API keys (not yet built)
5. **Accreditation reporting** — requires custom report engine extensions (proposed)

These are **deferred until platform support or prioritization**. The schema reserves the fields; they are non-functional until then.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.2 | 2026-08-01 | Added Academic Domain Specification (ADS) — Domain Architecture Extension to frozen v1.0. Defines institutional hierarchy, curriculum, enrollment, assessment, grading, records, graduation, and certification with DDD structure. |

---

*UNIBUD OS — Academic Domain Specification (ADS) v1.2*
*Extends frozen v1.0 master architecture. Single source of truth for academic structure, curriculum, enrollment, assessment, grading, and academic records.*
*Every academic entity, workflow, and policy is mapped to its domain boundary.*