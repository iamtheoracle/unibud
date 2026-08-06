/**
 * Achievement Catalog — the canonical definition of every achievement
 * in UNIBUD. Each entry defines the key, display metadata, the metric
 * to check, and the threshold that must be met.
 *
 * The backend function (checkAchievements) reads this catalog, computes
 * the student's current metrics, and awards any newly-earned achievements.
 *
 * Philosophy: Celebrate genuine progress — consistency, learning,
 * collaboration, and academic success. No artificial points or currencies.
 */

export const ACHIEVEMENT_CATEGORIES = [
  { id: "study", label: "Study", icon: "BookOpen", color: "142 71% 45%" },
  { id: "assignments", label: "Assignments", icon: "CheckCircle2", color: "217 91% 60%" },
  { id: "exams", label: "Exams", icon: "Award", color: "262 83% 58%" },
  { id: "learning", label: "Learning", icon: "Lightbulb", color: "32 92% 50%" },
  { id: "collaboration", label: "Collaboration", icon: "Users", color: "173 75% 38%" },
  { id: "campus_life", label: "Campus Life", icon: "Calendar", color: "198 88% 45%" },
  { id: "milestone", label: "Milestones", icon: "Flag", color: "0 84% 60%" },
];

export const ACHIEVEMENTS = [
  // ── Study ──
  { key: "first_study_session", title: "First Study Session", description: "You completed your first study session.", category: "study", icon: "BookOpen", color: "142 71% 45%", metric: "study_sessions_count", threshold: 1, bud: "You completed your first study session — the journey begins!" },
  { key: "study_streak_3", title: "3-Day Study Streak", description: "You studied for 3 consecutive days.", category: "study", icon: "Flame", color: "32 92% 50%", metric: "study_streak", threshold: 3, bud: "3-day study streak! Your consistency is building momentum." },
  { key: "study_streak_7", title: "7-Day Study Streak", description: "You studied for 7 consecutive days.", category: "study", icon: "Flame", color: "0 84% 60%", metric: "study_streak", threshold: 7, bud: "A full week of studying — outstanding dedication!" },
  { key: "study_streak_30", title: "30-Day Study Streak", description: "You studied for 30 consecutive days.", category: "study", icon: "Trophy", color: "46 74% 55%", metric: "study_streak", threshold: 30, bud: "30 days of consistent studying — you're building a powerful habit." },
  { key: "study_100_hours", title: "100 Hours Studied", description: "You've spent 100 hours studying.", category: "study", icon: "Clock", color: "142 71% 45%", metric: "total_study_hours", threshold: 100, bud: "100 hours of focused study — your effort is remarkable." },
  { key: "consistent_learner", title: "Consistent Learner", description: "Studied on 5 different days in a week.", category: "study", icon: "TrendingUp", color: "142 71% 45%", metric: "study_days_this_week", threshold: 5, bud: "You studied 5 days this week — consistency is your superpower." },

  // ── Assignments ──
  { key: "first_assignment", title: "First Assignment Submitted", description: "You submitted your first assignment.", category: "assignments", icon: "FileCheck", color: "217 91% 60%", metric: "assignments_completed", threshold: 1, bud: "First assignment submitted — you're on your way!" },
  { key: "assignments_10", title: "10 Assignments Completed", description: "You've completed 10 assignments.", category: "assignments", icon: "CheckCircle2", color: "217 91% 60%", metric: "assignments_completed", threshold: 10, bud: "10 assignments done — steady progress pays off." },
  { key: "all_on_time", title: "Always On Time", description: "Submitted every assignment on time this semester.", category: "assignments", icon: "Timer", color: "142 71% 45%", metric: "all_assignments_on_time", threshold: 1, bud: "Every assignment submitted on time — that's excellence." },
  { key: "semester_champion", title: "Semester Assignment Champion", description: "Completed every assignment this semester.", category: "assignments", icon: "Crown", color: "46 74% 55%", metric: "all_assignments_completed", threshold: 1, bud: "You completed every assignment this semester — brilliant work!" },

  // ── Exams ──
  { key: "first_exam", title: "First Exam Completed", description: "You completed your first exam.", category: "exams", icon: "ClipboardCheck", color: "262 83% 58%", metric: "exams_completed", threshold: 1, bud: "First exam completed — you handled it well." },
  { key: "excellent_performance", title: "Excellent Performance", description: "Scored 80% or above on an exam.", category: "exams", icon: "Star", color: "46 74% 55%", metric: "best_exam_score_pct", threshold: 80, bud: "You scored over 80% — outstanding academic performance!" },
  { key: "continuous_improvement", title: "Continuous Improvement", description: "Your grades improved across semesters.", category: "exams", icon: "TrendingUp", color: "142 71% 45%", metric: "gpa_improved", threshold: 1, bud: "Your grades are trending upward — keep growing!" },
  { key: "semester_excellence", title: "Semester Excellence", description: "Achieved a CGPA of 4.5 or higher.", category: "exams", icon: "Award", color: "46 74% 55%", metric: "current_gpa", threshold: 4.5, bud: "CGPA of excellence — your hard work speaks for itself." },

  // ── Learning ──
  { key: "notes_creator", title: "Notes Creator", description: "You created your first note.", category: "learning", icon: "StickyNote", color: "32 92% 50%", metric: "notes_count", threshold: 1, bud: "First note created — building your knowledge library!" },
  { key: "notes_10", title: "10 Notes Created", description: "You've created 10 notes.", category: "learning", icon: "Notebook", color: "32 92% 50%", metric: "notes_count", threshold: 10, bud: "10 notes and counting — your study library is growing." },
  { key: "flashcards_master", title: "Flashcard Master", description: "Completed your first flashcard set.", category: "learning", icon: "Layers", color: "32 92% 50%", metric: "flashcard_sets_completed", threshold: 1, bud: "Flashcards mastered — active recall is a powerful tool." },
  { key: "practice_tests_5", title: "Practice Makes Perfect", description: "Completed 5 practice tests.", category: "learning", icon: "FileQuestion", color: "32 92% 50%", metric: "practice_tests_count", threshold: 5, bud: "5 practice tests done — preparation meets opportunity." },
  { key: "research_completed", title: "Research Completed", description: "Completed your first research project.", category: "learning", icon: "Microscope", color: "262 83% 58%", metric: "research_projects_count", threshold: 1, bud: "Research project completed — you're thinking like a scholar." },

  // ── Collaboration ──
  { key: "first_study_group", title: "First Study Group", description: "You joined your first study group.", category: "collaboration", icon: "Users", color: "173 75% 38%", metric: "study_groups_count", threshold: 1, bud: "You joined a study group — learning together is powerful." },
  { key: "helpful_teammate", title: "Helpful Teammate", description: "Contributed to a study group discussion.", category: "collaboration", icon: "HeartHandshake", color: "173 75% 38%", metric: "study_group_contributions", threshold: 1, bud: "You helped your study group — collaboration at its best." },
  { key: "project_contributor", title: "Project Contributor", description: "Completed a collaborative project.", category: "collaboration", icon: "FolderCheck", color: "173 75% 38%", metric: "projects_completed", threshold: 1, bud: "Project completed — great teamwork!" },
  { key: "community_helper", title: "Community Helper", description: "Helped a peer in the community.", category: "collaboration", icon: "HandHeart", color: "173 75% 38%", metric: "community_helps_count", threshold: 1, bud: "You helped a peer — that's the UNIBUD spirit." },

  // ── Campus Life ──
  { key: "first_event", title: "First Event Attended", description: "You attended your first campus event.", category: "campus_life", icon: "Calendar", color: "198 88% 45%", metric: "events_attended", threshold: 1, bud: "First campus event — you're part of the community!" },
  { key: "club_member", title: "Club Member", description: "You joined a campus club.", category: "campus_life", icon: "Users", color: "198 88% 45%", metric: "clubs_joined", threshold: 1, bud: "You joined a club — campus life just got richer." },
  { key: "campus_leader", title: "Campus Leader", description: "Took on a leadership role.", category: "campus_life", icon: "Crown", color: "46 74% 55%", metric: "leadership_roles", threshold: 1, bud: "You stepped into leadership — inspiring others." },
  { key: "volunteer", title: "Volunteer", description: "Completed volunteer service.", category: "campus_life", icon: "HandHeart", color: "0 84% 60%", metric: "volunteer_count", threshold: 1, bud: "You gave back through volunteering — that matters." },

  // ── Milestones ──
  { key: "degree_25", title: "25% Degree Progress", description: "You've completed a quarter of your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 25, bud: "You're 25% through your degree — a quarter of the way there!" },
  { key: "degree_50", title: "50% Degree Progress", description: "You're halfway through your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 50, bud: "Halfway through your degree — the finish line is in sight!" },
  { key: "degree_75", title: "75% Degree Progress", description: "You've completed three-quarters of your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 75, bud: "75% done — you're nearly at graduation!" },
  { key: "degree_100", title: "Degree Completed", description: "You've completed your degree.", category: "milestone", icon: "GraduationCap", color: "46 74% 55%", metric: "degree_progress", threshold: 100, bud: "Congratulations — you've completed your degree!" },
  { key: "first_semester", title: "First Semester Completed", description: "You completed your first semester.", category: "milestone", icon: "CalendarCheck", color: "198 88% 45%", metric: "semesters_completed", threshold: 1, bud: "First semester completed — you've settled into university life." },
  { key: "first_internship", title: "First Internship", description: "Completed your first internship.", category: "milestone", icon: "Briefcase", color: "217 91% 60%", metric: "internships_completed", threshold: 1, bud: "Internship completed — real-world experience earned." },
  { key: "final_year", title: "Final Year", description: "You've reached your final year.", category: "milestone", icon: "Trophy", color: "46 74% 55%", metric: "is_final_year", threshold: 1, bud: "Final year — the last stretch before graduation. You've got this!" },
];

export const achievementByKey = (key) => ACHIEVEMENTS.find((a) => a.key === key);
export const achievementsByCategory = (cat) => ACHIEVEMENTS.filter((a) => a.category === cat);