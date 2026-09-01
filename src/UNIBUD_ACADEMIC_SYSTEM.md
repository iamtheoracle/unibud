# UNIBUD ACADEMIC SYSTEM SPECIFICATION

> One complete Academic System supporting students from admission through graduation — regardless of country, university, or education system.
> Modern, organized, intelligent, and enjoyable. Every academic feature connects naturally with StudyBuddy, Calendar, Communities, Messaging, Discover, and every other module.

---

## 1. INSTITUTIONAL STRUCTURE

### 1.1 Configurable Academic Architecture

Every institution has its own configurable structure. Never assume one academic model.

| Component | Configurable Fields |
|---|---|
| **Campuses** | Name, location, address, geolocation |
| **Faculties / Colleges / Schools** | Name, dean, description, campus |
| **Departments** | Name, HOD, description, faculty |
| **Programmes** | Name, code, duration, degree type, credit requirements, graduation requirements |
| **Qualifications** | Degree type (BSc, BA, BEng, MSc, PhD, HND, ND, etc.) |
| **Academic Sessions** | Start/end dates, registration periods, holiday periods |
| **Semesters / Trimesters / Terms** | Name, start/end dates, mid-semester break, exam period |
| **Grading Systems** | GPA (4.0/5.0), percentage, letter grades, UK classification, CGPA scale — configurable per programme |
| **Credit Systems** | Credit unit values, credit hour calculations, credit transfer rules |
| **Attendance Rules** | Minimum attendance for exam eligibility, attendance tracking methods |
| **Examination Structures** | Exam types, weighting, continuous assessment vs. final exam split |
| **Graduation Requirements** | Total credits, CGPA minimum, required courses, project/thesis requirements |

### 1.2 Rules
- Every institution's configuration is isolated — changes to one university never affect another.
- Configurable through admin portal or secure integrations.
- Institutions can define their own terminology (e.g., "course" vs. "module", "semester" vs. "term").
- Adapts to NUC (Nigeria), ABET (US), QAA (UK), Bologna (EU), and other frameworks.

---

## 2. COURSE LEARNING HUB

Every course is a complete learning hub — not a simple course page.

### 2.1 Course Hub Sections

| Section | Content |
|---|---|
| **Overview** | Course title, code, description, credit units, semester |
| **Objectives** | What the course aims to achieve |
| **Learning Outcomes** | What students will be able to do after completing |
| **Lecturer Information** | Name, photo, contact, office hours |
| **Teaching Assistants** | TA names and contact |
| **Prerequisites** | Required prior courses |
| **Timetable** | Lecture, tutorial, lab, practical schedules |
| **Attendance** | Attendance records and requirements |
| **Assignments** | All assignments for the course |
| **Projects** | Course projects and guidelines |
| **Examinations** | Exam dates, formats, past questions |
| **Quizzes** | Course quizzes and assessments |
| **Lecture Notes** | Uploaded notes and materials |
| **Presentations** | Slide decks and lecture slides |
| **PDFs** | Reading materials and documents |
| **Books** | Recommended and required textbooks |
| **Journals** | Academic journal references |
| **Videos** | Lecture recordings and educational videos |
| **Practical Sessions** | Lab and practical schedules |
| **Laboratories** | Lab locations and requirements |
| **Announcements** | Course-specific announcements |
| **Grades** | Grade breakdown and progress |
| **Progress Tracking** | Visual progress through course content |
| **Bookmarks** | Saved materials |
| **Downloads** | Downloaded materials (offline access) |
| **Revision Resources** | Study guides, summaries, flashcards |
| **Recommended Materials** | Additional learning resources |

### 2.2 Student Uploads

Students upload materials directly into their courses:

| Type | Support |
|---|---|
| PDFs | Full text extraction and understanding |
| Word Documents | .docx content analysis |
| PowerPoint | .pptx slide explanation |
| Spreadsheets | .xlsx/.csv data analysis |
| Images | Photo of textbook, whiteboard, notes |
| Handwritten Notes | OCR recognition |
| Audio Recordings | Lecture recordings, voice notes |

### 2.3 StudyBuddy Integration in Courses

When students upload materials, StudyBuddy:
- Explains the content naturally.
- Summarizes it.
- Generates revision notes.
- Creates quizzes from the content.
- Produces flashcards.
- Answers questions about the content.
- Organizes learning materials.
- Never modifies original files unless explicitly requested.

---

## 3. NOTES SYSTEM

One intelligent Notes system.

### 3.1 Supported Content Types

| Type | Support |
|---|---|
| Rich Text | Full formatting (bold, italic, lists, headings) |
| Tables | Structured data tables |
| Mathematics | LaTeX equation rendering |
| Equations | Mathematical notation |
| Code Blocks | Syntax-highlighted code |
| Diagrams | Inline diagrams and drawings |
| Images | Embedded images |
| Handwriting | Stylus/finger handwriting |
| Audio Notes | Voice notes attached to text |
| PDF Annotation | Highlight and annotate PDFs |
| Highlighting | Text highlighting in multiple colors |
| Bookmarks | Bookmark specific sections |

### 3.2 Organization

| Feature | Description |
|---|---|
| **Folders** | Hierarchical folder structure |
| **Tags** | Multi-tag system for cross-referencing |
| **Search** | Full-text search across all notes |
| **Version History** | Every edit saved with timestamp |
| **Offline Editing** | Edit without internet, sync on reconnect |
| **Cloud Sync** | Autosave and synchronize across all devices |
| **Collaborative Sharing** | Share notes with permitted users (with permissions) |

### 3.3 Rules
- Notes automatically save continuously (debounced autosave).
- Never lose notes due to poor connectivity.
- Version history allows rollback to any previous state.
- Collaborative sharing respects permission boundaries.

---

## 4. ASSIGNMENT WORKSPACE

Every assignment is a complete workspace.

### 4.1 Assignment Fields

| Field | Description |
|---|---|
| **Title** | Assignment name |
| **Description** | Full assignment description |
| **Course** | Associated course |
| **Deadline** | Due date and time |
| **Lecturer Instructions** | Specific instructions from lecturer |
| **Submission Method** | File upload, text, link, or in-app |
| **Grading Rubric** | How the assignment will be graded |
| **Attachments** | Course materials and reference files |
| **Comments** | Discussion between student and lecturer |
| **Revision History** | All draft versions |
| **Progress Tracking** | Visual progress (not started, in progress, submitted, graded) |
| **Draft Saving** | Continuous autosave of work |
| **Offline Editing** | Work offline, sync on reconnect |
| **Submission History** | All submission attempts |
| **Late Submission Indicator** | Visual warning for overdue |
| **Reminders** | Smart reminders before deadline |
| **Synchronization** | Cross-device sync |

### 4.2 Rules
- Students never lose work because of poor connectivity or accidental closure.
- Drafts autosave locally and sync to cloud.
- Offline drafts queue and sync when connectivity returns.
- Late submissions are clearly marked but still accepted (institution policy permitting).

---

## 5. PROJECT ASSISTANT

Premium project management for academic work.

### 5.1 Features

| Feature | Description |
|---|---|
| **Kanban Boards** | Drag-and-drop task columns (To Do, In Progress, Done) |
| **Timelines** | Gantt-style project timeline |
| **Calendars** | Project deadline calendar view |
| **Milestones** | Key project milestones |
| **Subtasks** | Break tasks into subtasks |
| **Labels** | Color-coded labels |
| **Tags** | Categorization tags |
| **Priorities** | Priority levels (low, medium, high, critical) |
| **Progress Indicators** | Visual progress bars |
| **Shared Workspaces** | Collaborate with team members |
| **Files** | Attach files to tasks and projects |
| **Comments** | Task and project comments |
| **Version History** | Track changes over time |
| **Drag-and-Drop** | Reorganize tasks naturally |
| **Archive** | Archive completed projects |
| **Restore** | Restore archived projects |
| **Search** | Search within projects |
| **Collaboration** | Real-time collaboration |

### 5.2 Integration
Projects integrate directly with:
- Calendar (deadlines sync automatically)
- StudyBuddy (guidance on project approach)
- Courses (link projects to courses)
- Communities (collaborate with study groups)

---

## 6. CALENDAR

One comprehensive calendar.

### 6.1 Views

| View | Display |
|---|---|
| **Daily** | Hourly breakdown of today's events |
| **Weekly** | 7-day week view |
| **Monthly** | Full month overview |
| **Semester** | Academic semester view |
| **Academic Year** | Full academic year overview |

### 6.2 Event Types

Lectures, tutorials, practicals, examinations, assignments, projects, meetings, events, internships, research activities, scholarship deadlines, student loan deadlines, personal reminders.

### 6.3 External Calendar Sync

| Provider | Sync |
|---|---|
| **Google Calendar** | Two-way sync (with permission) |
| **Apple Calendar** | Two-way sync (with permission) |
| **Microsoft Outlook** | Two-way sync (with permission) |

### 6.4 Rules
- Auto-detect local timezone.
- Prevent duplicate events when syncing from multiple sources.
- Color-coded by event type.
- Drag to reschedule (personal events only).
- Smart conflict detection (overlapping events highlighted).

---

## 7. SMART REMINDERS

Reminders that understand priority and urgency.

### 7.1 Reminder Types

| Type | Default Timing |
|---|---|
| **Before Lectures** | 15 minutes before |
| **Assignment Deadlines** | 3 days, 1 day, 2 hours before |
| **Examinations** | 1 week, 3 days, 1 day, 2 hours before |
| **Meetings** | 30 minutes before |
| **Scholarship Deadlines** | 1 week, 3 days before |
| **Internship Interviews** | 1 day, 2 hours before |
| **Project Milestones** | Configurable |
| **School Fees** | 1 week before |
| **Hostel Payments** | 1 week before |
| **University Events** | 1 day before |

### 7.2 Customization
- Complete control over reminder timing.
- Choice of delivery channels (in-app, push, email, SMS).
- Notification behavior (sound, vibration, silent).
- Per-category preferences.
- Quiet hours (no notifications during specified times).

---

## 8. ACADEMIC PLANNING TOOLS

| Tool | Description |
|---|---|
| **GPA Calculator** | Calculate semester GPA based on grades and credits |
| **CGPA Calculator** | Calculate cumulative GPA across semesters |
| **Credit Unit Tracker** | Track completed and remaining credits |
| **Graduation Requirement Tracker** | Track progress toward graduation requirements |
| **Semester Planner** | Plan course load for upcoming semesters |
| **Timetable Manager** | Manage and customize timetable view |
| **Attendance Tracker** | Track attendance against requirements |
| **Reading Progress Tracker** | Track reading progress through course materials |
| **Daily Goals** | Set and track daily academic goals |
| **Weekly Goals** | Set and track weekly academic goals |
| **Monthly Goals** | Set and track monthly academic goals |
| **Academic Roadmaps** | Long-term academic planning |

### Rules
- All calculations automatically update whenever grades or completed courses change.
- GPA/CGPA calculations respect the institution's grading system.
- Graduation requirements are configurable per programme.

---

## 9. ATTENDANCE MANAGEMENT

| Feature | Description |
|---|---|
| **Display** | Where institutions provide attendance information |
| **History** | Full attendance history per course |
| **Trends** | Visual attendance trends |
| **Warnings** | Alerts when attendance drops below requirements |
| **Missed Classes** | Clear record of missed sessions |
| **Requirements** | Display attendance requirements for exam eligibility or graduation |

---

## 10. EXAM CENTRE

One intelligent Exam Centre.

### 10.1 Features

| Feature | Description |
|---|---|
| **Revision Schedules** | Organize revision timetables |
| **Personalized Study Plans** | StudyBuddy generates plans based on exam schedule and student's weak areas |
| **Mock Examinations** | Practice exams simulating real conditions |
| **Practice Quizzes** | Topic-specific quizzes |
| **Flashcards** | Spaced repetition flashcards |
| **Revision Summaries** | Condensed topic summaries |

### 10.2 StudyBuddy in Exam Centre
- Identifies weak topics based on learning progress.
- Recommends review sessions for weak areas.
- Adjusts revision priorities based on upcoming deadlines.
- Generates practice questions in exam format.
- Provides timed mock exams with scoring.

---

## 11. RESEARCH SUPPORT

| Feature | Description |
|---|---|
| **References** | Organize academic references |
| **Citations** | Manage citations in multiple formats (APA, MLA, Chicago, Harvard, IEEE) |
| **Research Papers** | Store and organize research papers |
| **Journals** | Track journal articles |
| **Books** | Research book references |
| **Datasets** | Organize research datasets |
| **Laboratory Notes** | Lab notebook functionality |
| **Bibliographies** | Automatic bibliography generation |
| **Literature Reviews** | Organize literature review notes |

### StudyBuddy Research Assistance
- Research planning guidance.
- Academic writing assistance.
- Citation formatting help.
- Source organization.
- Critical thinking encouragement.
- Academic integrity enforcement (proper citation, no plagiarism).

---

## 12. CROSS-MODULE INTEGRATION

Every academic feature integrates naturally with:

| Module | Integration |
|---|---|
| **Communities** | Course discussions, study groups, project teams |
| **Messaging** | Direct messages about assignments, courses |
| **StudyBuddy** | Concept explanation, study help, exam prep |
| **Calendar** | All academic deadlines sync to calendar |
| **Discover** | Recommend courses, research, opportunities |
| **Career Centre** | Connect academic progress to career goals |
| **Marketplace** | Buy textbooks and materials for courses |
| **Notes** | Course-specific notes |
| **Notifications** | Academic reminders and alerts |

### Rules
- Students never feel like they are switching between disconnected systems.
- Every academic workflow reduces stress, improves organization, strengthens understanding, and encourages continuous learning.

---

> **The Academic System — the foundation of university success, flexible enough to support institutions across the world.**