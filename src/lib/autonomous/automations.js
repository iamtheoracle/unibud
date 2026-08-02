/**
 * UNIBUD Autonomous Automations Registry
 *
 * Every autonomous capability in UNIBUD is registered here. Users can
 * enable, disable, or customize each automation from the Automation Settings page.
 *
 * Categories:
 *  briefing     — daily/weekly AI summaries
 *  academic     — risk detection, readiness, GPA, attendance
 *  campus       — intelligent notifications about campus changes
 *  wellness     — breaks, sleep, hydration, focus
 *  automation   — auto-organize, auto-generate, auto-sync
 *  recommendation — study partners, tutors, clubs, events, scholarships
 *  productivity — unfinished work, priorities, workload, conflicts
 *  learning     — weak subjects, revision plans, progress tracking
 *  social       — classmates, communities, mentors
 *  safety       — suspicious activity, spam, emergency alerts
 */

export const AUTOMATION_CATEGORIES = [
  { id: "briefing", label: "Daily Briefings", icon: "Sun" },
  { id: "academic", label: "Academic Intelligence", icon: "GraduationCap" },
  { id: "campus", label: "Campus Intelligence", icon: "Building2" },
  { id: "wellness", label: "Wellness & Focus", icon: "Heart" },
  { id: "automation", label: "Smart Automation", icon: "Zap" },
  { id: "recommendation", label: "Recommendations", icon: "Sparkles" },
  { id: "productivity", label: "Productivity", icon: "CheckSquare" },
  { id: "learning", label: "Learning Intelligence", icon: "Brain" },
  { id: "social", label: "Social Intelligence", icon: "Users" },
  { id: "safety", label: "Safety & Security", icon: "ShieldCheck" },
  { id: "living", label: "Living Campus", icon: "Flame" },
];

export const AUTOMATIONS = [
  // ── Daily Briefings ──
  { id: "morning_briefing", category: "briefing", name: "Morning Summary", desc: "Daily morning briefing with classes, deadlines, and events", defaultEnabled: true },
  { id: "evening_recap", category: "briefing", name: "Evening Recap", desc: "Evening summary of accomplishments and tomorrow's plan", defaultEnabled: true },
  { id: "weekly_summary", category: "briefing", name: "Weekly Summary", desc: "Weekly academic performance and progress summary", defaultEnabled: true },
  { id: "semester_summary", category: "briefing", name: "Semester Summary", desc: "Semester-level academic overview", defaultEnabled: false },

  // ── Academic Intelligence ──
  { id: "assignment_risk", category: "academic", name: "Assignment Risk Detection", desc: "Detect assignments at risk of being late", defaultEnabled: true },
  { id: "exam_readiness", category: "academic", name: "Exam Readiness Analysis", desc: "Analyze exam preparation progress", defaultEnabled: true },
  { id: "attendance_monitoring", category: "academic", name: "Attendance Monitoring", desc: "Monitor attendance and flag low attendance", defaultEnabled: true },
  { id: "gpa_trend", category: "academic", name: "GPA Trend Analysis", desc: "Track GPA trajectory over time", defaultEnabled: true },
  { id: "study_habit", category: "academic", name: "Study Habit Analysis", desc: "Analyze study patterns and suggest improvements", defaultEnabled: true },
  { id: "personalized_study_plans", category: "academic", name: "Personalized Study Plans", desc: "Generate tailored study plans", defaultEnabled: true },

  // ── Campus Intelligence ──
  { id: "lecturer_posts", category: "campus", name: "Lecturer Posts", desc: "Notify when a lecturer posts", defaultEnabled: true },
  { id: "new_notes", category: "campus", name: "New Notes Available", desc: "Notify when new notes are available", defaultEnabled: true },
  { id: "grades_released", category: "campus", name: "Grades Released", desc: "Notify when grades are released", defaultEnabled: true },
  { id: "scholarship_open", category: "campus", name: "Scholarship Openings", desc: "Notify when scholarships open", defaultEnabled: true },
  { id: "internship_open", category: "campus", name: "Internship Openings", desc: "Notify when internships open", defaultEnabled: true },
  { id: "club_recruit", category: "campus", name: "Club Recruitment", desc: "Notify when clubs recruit", defaultEnabled: true },
  { id: "event_match", category: "campus", name: "Event Matching", desc: "Notify when events match your interests", defaultEnabled: true },
  { id: "classroom_change", category: "campus", name: "Classroom Changes", desc: "Notify when classrooms change", defaultEnabled: true },
  { id: "assignment_change", category: "campus", name: "Assignment Changes", desc: "Notify when assignments change", defaultEnabled: true },
  { id: "deadline_move", category: "campus", name: "Deadline Changes", desc: "Notify when deadlines move", defaultEnabled: true },

  // ── Wellness & Focus ──
  { id: "smart_breaks", category: "wellness", name: "Smart Break Reminders", desc: "Remind you to take breaks during long study sessions", defaultEnabled: true },
  { id: "wellness_check", category: "wellness", name: "Wellness Check-ins", desc: "Periodic wellness check-ins", defaultEnabled: true },
  { id: "sleep_reminders", category: "wellness", name: "Smart Sleep Reminders", desc: "Remind you to get enough sleep", defaultEnabled: true },
  { id: "hydration", category: "wellness", name: "Hydration Reminders", desc: "Remind you to stay hydrated", defaultEnabled: false },
  { id: "focus_suggestions", category: "wellness", name: "Focus Mode Suggestions", desc: "Suggest focus mode during study time", defaultEnabled: true },

  // ── Smart Automation ──
  { id: "auto_organize_notes", category: "automation", name: "Auto-Organize Notes", desc: "Automatically organize notes by subject", defaultEnabled: false },
  { id: "auto_categorize_files", category: "automation", name: "Auto-Categorize Files", desc: "Automatically categorize uploaded files", defaultEnabled: false },
  { id: "auto_tag_documents", category: "automation", name: "Auto-Tag Documents", desc: "Automatically tag documents", defaultEnabled: false },
  { id: "auto_summarize_pdf", category: "automation", name: "Auto-Summarize PDFs", desc: "Automatically summarize uploaded PDFs", defaultEnabled: false },
  { id: "auto_flashcards", category: "automation", name: "Auto-Generate Flashcards", desc: "Automatically generate flashcards from notes", defaultEnabled: false },
  { id: "auto_quizzes", category: "automation", name: "Auto-Generate Quizzes", desc: "Automatically generate quizzes from notes", defaultEnabled: false },
  { id: "auto_sync_calendar", category: "automation", name: "Auto-Sync Calendar", desc: "Automatically sync academic calendars", defaultEnabled: true },
  { id: "auto_reminders", category: "automation", name: "Auto-Create Reminders", desc: "Automatically create reminders from detected deadlines", defaultEnabled: true },

  // ── Recommendations ──
  { id: "rec_study_partners", category: "recommendation", name: "Study Partner Recommendations", desc: "Recommend study partners", defaultEnabled: true },
  { id: "rec_tutors", category: "recommendation", name: "Tutor Recommendations", desc: "Recommend tutors", defaultEnabled: true },
  { id: "rec_clubs", category: "recommendation", name: "Club Recommendations", desc: "Recommend clubs", defaultEnabled: true },
  { id: "rec_events", category: "recommendation", name: "Event Recommendations", desc: "Recommend campus events", defaultEnabled: true },
  { id: "rec_internships", category: "recommendation", name: "Internship Recommendations", desc: "Recommend internships", defaultEnabled: true },
  { id: "rec_scholarships", category: "recommendation", name: "Scholarship Recommendations", desc: "Recommend scholarships", defaultEnabled: true },
  { id: "rec_research", category: "recommendation", name: "Research Opportunities", desc: "Recommend research opportunities", defaultEnabled: true },
  { id: "rec_books", category: "recommendation", name: "Book Recommendations", desc: "Recommend books for your courses", defaultEnabled: true },
  { id: "rec_courses", category: "recommendation", name: "Course Recommendations", desc: "Recommend courses", defaultEnabled: true },

  // ── Productivity ──
  { id: "unfinished_work", category: "productivity", name: "Detect Unfinished Work", desc: "Detect unfinished assignments and tasks", defaultEnabled: true },
  { id: "suggest_priorities", category: "productivity", name: "Suggest Priorities", desc: "Suggest daily task priorities", defaultEnabled: true },
  { id: "workload_estimate", category: "productivity", name: "Estimate Workload", desc: "Estimate upcoming workload", defaultEnabled: true },
  { id: "schedule_conflicts", category: "productivity", name: "Detect Schedule Conflicts", desc: "Predict schedule conflicts", defaultEnabled: true },
  { id: "study_rooms", category: "productivity", name: "Suggest Study Rooms", desc: "Suggest available study rooms", defaultEnabled: false },
  { id: "best_study_times", category: "productivity", name: "Suggest Best Study Times", desc: "Suggest optimal study times", defaultEnabled: true },
  { id: "detect_duplicates", category: "productivity", name: "Detect Duplicate Tasks", desc: "Detect duplicate tasks", defaultEnabled: true },
  { id: "missed_deadlines", category: "productivity", name: "Detect Missed Deadlines", desc: "Detect missed deadlines", defaultEnabled: true },

  // ── Learning Intelligence ──
  { id: "weak_subjects", category: "learning", name: "Detect Weak Subjects", desc: "Detect subjects needing more attention", defaultEnabled: true },
  { id: "revision_plans", category: "learning", name: "Suggest Revision Plans", desc: "Suggest revision plans for weak subjects", defaultEnabled: true },
  { id: "learning_progress", category: "learning", name: "Track Learning Progress", desc: "Track learning progress over time", defaultEnabled: true },
  { id: "exam_prediction", category: "learning", name: "Predict Exam Performance", desc: "Predict exam performance based on study patterns", defaultEnabled: true },
  { id: "study_consistency", category: "learning", name: "Measure Study Consistency", desc: "Track study streak consistency", defaultEnabled: true },

  // ── Social Intelligence ──
  { id: "rec_classmates", category: "social", name: "Recommend Classmates", desc: "Recommend classmates to connect with", defaultEnabled: true },
  { id: "rec_communities", category: "social", name: "Recommend Communities", desc: "Recommend communities to join", defaultEnabled: true },
  { id: "rec_discussions", category: "social", name: "Recommend Discussions", desc: "Recommend relevant discussions", defaultEnabled: true },
  { id: "rec_creators", category: "social", name: "Recommend Creators", desc: "Recommend campus creators to follow", defaultEnabled: true },
  { id: "rec_mentors", category: "social", name: "Recommend Mentors", desc: "Recommend mentors", defaultEnabled: true },
  { id: "rec_alumni", category: "social", name: "Recommend Alumni", desc: "Recommend alumni connections", defaultEnabled: true },
  { id: "rec_networking", category: "social", name: "Networking Opportunities", desc: "Recommend networking opportunities", defaultEnabled: true },

  // ── Safety & Security ──
  { id: "suspicious_activity", category: "safety", name: "Detect Suspicious Activity", desc: "Detect suspicious account activity", defaultEnabled: true },
  { id: "unusual_logins", category: "safety", name: "Detect Unusual Logins", desc: "Detect unusual login attempts", defaultEnabled: true },
  { id: "account_compromise", category: "safety", name: "Detect Account Compromise", desc: "Detect potential account compromise", defaultEnabled: true },
  { id: "spam_detection", category: "safety", name: "Spam Detection", desc: "Detect spam content", defaultEnabled: true },
  { id: "phishing_detection", category: "safety", name: "Phishing Detection", desc: "Detect phishing attempts", defaultEnabled: true },
  { id: "abuse_detection", category: "safety", name: "Abuse Detection", desc: "Detect abusive content", defaultEnabled: true },
  { id: "emergency_alerts", category: "safety", name: "Emergency Alerts", desc: "Detect emergency announcements", defaultEnabled: true },

  // ── Living Campus ──
  { id: "living_campus", category: "living", name: "Living Campus Engine", desc: "Continuously simulate realistic campus activity", defaultEnabled: true },
  { id: "living_social", category: "living", name: "Social Activity", desc: "Generate realistic posts, stories, and engagement", defaultEnabled: true },
  { id: "living_academic", category: "living", name: "Academic Activity", desc: "Generate assignment announcements and study sessions", defaultEnabled: true },
  { id: "living_marketplace", category: "living", name: "Marketplace Activity", desc: "Generate realistic marketplace listings", defaultEnabled: true },
  { id: "living_events", category: "living", name: "Event Activity", desc: "Generate campus events and updates", defaultEnabled: true },
  { id: "living_engagement", category: "living", name: "Engagement Simulation", desc: "Simulate organic likes, comments, and reactions", defaultEnabled: true },
];

export function getAutomationsByCategory(categoryId) {
  return AUTOMATIONS.filter((a) => a.category === categoryId);
}

export function getAutomation(id) {
  return AUTOMATIONS.find((a) => a.id === id);
}