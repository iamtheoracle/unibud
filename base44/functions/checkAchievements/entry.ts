import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * checkAchievements — evaluates a student's academic metrics against the
 * achievement catalog and awards any newly-earned achievements.
 *
 * Returns newly earned achievements so the frontend can show Bud's
 * congratulation messages naturally.
 *
 * Actions:
 *  • check  — evaluate all achievements and award new ones (default)
 *  • list   — return the student's earned achievements with catalog metadata
 *  • update_visibility — change visibility of an achievement
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || "check";

    const userId = user.id;
    const userName = user.full_name || user.preferred_name || "Student";
    const userUniv = user.university || "";
    const instId = user.institution_id || user.data?.institution_id || "";

    // ── list: return earned achievements ──
    if (action === "list") {
      const earned = await base44.asServiceRole.entities.StudentAchievement.filter(
        { created_by_id: userId },
        "-date_earned",
        200
      );
      return Response.json({ achievements: earned || [], count: (earned || []).length });
    }

    // ── update_visibility ──
    if (action === "update_visibility") {
      const { achievement_id, visibility } = body;
      if (!achievement_id || !visibility) {
        return Response.json({ error: "achievement_id and visibility required" }, { status: 400 });
      }
      const valid = ["private", "friends", "university", "public"];
      if (!valid.includes(visibility)) {
        return Response.json({ error: "Invalid visibility" }, { status: 400 });
      }
      await base44.asServiceRole.entities.StudentAchievement.update(achievement_id, { visibility });
      return Response.json({ ok: true });
    }

    // ── check: evaluate and award ──
    // Fetch all earned achievement keys to avoid duplicates
    const existing = await base44.asServiceRole.entities.StudentAchievement.filter(
      { created_by_id: userId },
      "-date_earned",
      200
    );
    const earnedKeys = new Set((existing || []).map((a) => a.achievement_key));

    // Compute metrics by fetching entity data
    const metrics = await computeMetrics(base44, userId, user);

    // Import catalog inline (since we can't import from src/ in a backend function)
    const ACHIEVEMENTS = getCatalog();

    const newlyEarned = [];
    for (const ach of ACHIEVEMENTS) {
      if (earnedKeys.has(ach.key)) continue;

      const metricValue = metrics[ach.metric] || 0;
      const isEarned = metricValue >= ach.threshold;

      if (isEarned) {
        const record = await base44.asServiceRole.entities.StudentAchievement.create({
          achievement_key: ach.key,
          title: ach.title,
          description: ach.description,
          category: ach.category,
          date_earned: new Date().toISOString(),
          visibility: "private", // Student controls — default private
          bud_message: ach.bud,
          icon: ach.icon,
          accent_color: ach.color,
          metadata: { metric: ach.metric, threshold: ach.threshold, value: metricValue },
          institution_id: instId,
          student_name: userName,
          university: userUniv,
        });
        newlyEarned.push({
          id: record.id,
          achievement_key: ach.key,
          title: ach.title,
          description: ach.description,
          category: ach.category,
          bud_message: ach.bud,
          icon: ach.icon,
          accent_color: ach.color,
        });
      }
    }

    return Response.json({
      ok: true,
      newly_earned: newlyEarned,
      total_earned: earnedKeys.size + newlyEarned.length,
      metrics: metrics,
    });
  } catch (error) {
    return Response.json({ error: error.message || "Achievement check failed" }, { status: 500 });
  }
});

/**
 * Computes all metrics needed for achievement evaluation.
 */
async function computeMetrics(base44, userId, user) {
  const m = {};

  // Study sessions
  try {
    const sessions = await base44.asServiceRole.entities.StudySession.filter(
      { created_by_id: userId },
      "-created_date",
      500
    );
    m.study_sessions_count = (sessions || []).length;
    m.study_streak = (sessions && sessions[0]?.study_streak) || 0;
    m.total_study_hours = Math.round((sessions || []).reduce((s, x) => s + (x.duration_minutes || 0), 0) / 60);
    m.study_days_this_week = countStudyDaysThisWeek(sessions || []);
  } catch { m.study_sessions_count = 0; m.study_streak = 0; m.total_study_hours = 0; m.study_days_this_week = 0; }

  // Assignments
  try {
    const assignments = await base44.asServiceRole.entities.Assignment.filter(
      { created_by_id: userId },
      "-created_date",
      500
    );
    const all = assignments || [];
    const completed = all.filter((a) => a.status === "submitted" || a.status === "graded");
    m.assignments_completed = completed.length;
    m.all_assignments_on_time = all.length > 0 && completed.length === all.length &&
      completed.every((a) => !a.due_date || new Date(a.created_date) <= new Date(a.due_date)) ? 1 : 0;
    m.all_assignments_completed = all.length > 0 && completed.length === all.length ? 1 : 0;
  } catch { m.assignments_completed = 0; m.all_assignments_on_time = 0; m.all_assignments_completed = 0; }

  // Grades / Exams
  try {
    const grades = await base44.asServiceRole.entities.Grade.filter(
      { created_by_id: userId },
      "-created_date",
      500
    );
    const all = grades || [];
    m.exams_completed = all.filter((g) => g.assessment_type === "exam").length;
    const bestPct = all.length > 0 ? Math.max(...all.map((g) => ((g.score || 0) / (g.max_score || 100)) * 100)) : 0;
    m.best_exam_score_pct = Math.round(bestPct);
    m.current_gpa = computeGPA(all);
    m.gpa_improved = checkGPAImprovement(all);
  } catch { m.exams_completed = 0; m.best_exam_score_pct = 0; m.current_gpa = 0; m.gpa_improved = 0; }

  // Notes
  try {
    const notes = await base44.asServiceRole.entities.Note.filter(
      { created_by_id: userId },
      "-created_date",
      500
    );
    m.notes_count = (notes || []).length;
  } catch { m.notes_count = 0; }

  // Flashcards / Quiz attempts
  try {
    const quizzes = await base44.asServiceRole.entities.QuizAttempt.filter(
      { created_by_id: userId },
      "-created_date",
      500
    );
    m.flashcard_sets_completed = (quizzes || []).filter((q) => q.completed).length;
    m.practice_tests_count = (quizzes || []).length;
  } catch { m.flashcard_sets_completed = 0; m.practice_tests_count = 0; }

  // Research projects
  try {
    const projects = await base44.asServiceRole.entities.ResearchProject.filter(
      { created_by_id: userId },
      "-created_date",
      100
    );
    m.research_projects_count = (projects || []).length;
  } catch { m.research_projects_count = 0; }

  // Study groups
  try {
    const groups = await base44.asServiceRole.entities.StudyGroup.filter(
      { "members.user_id": userId },
      "-created_date",
      100
    );
    m.study_groups_count = (groups || []).length;
    m.study_group_contributions = (groups || []).filter((g) =>
      (g.members || []).some((mem) => mem.user_id === userId && mem.role !== "member")
    ).length;
  } catch { m.study_groups_count = 0; m.study_group_contributions = 0; }

  // Projects
  try {
    const projects = await base44.asServiceRole.entities.Project.filter(
      { created_by_id: userId },
      "-created_date",
      100
    );
    m.projects_completed = (projects || []).filter((p) => p.status === "completed").length;
  } catch { m.projects_completed = 0; }

  // Events attended
  try {
    const events = await base44.asServiceRole.entities.CampusEvent.filter(
      { "rsvp_list.user_id": userId },
      "-date",
      100
    );
    m.events_attended = (events || []).length;
  } catch { m.events_attended = 0; }

  // Clubs joined
  try {
    const clubs = await base44.asServiceRole.entities.Club.filter(
      { "members.user_id": userId },
      "-created_date",
      100
    );
    m.clubs_joined = (clubs || []).length;
    m.leadership_roles = (clubs || []).filter((c) =>
      (c.members || []).some((mem) => mem.user_id === userId && ["president", "vice_president", "secretary", "treasurer", "officer"].includes(mem.role))
    ).length;
  } catch { m.clubs_joined = 0; m.leadership_roles = 0; }

  // Degree progress
  const level = parseInt(user.level || "0");
  if (level >= 400) m.degree_progress = 100;
  else if (level >= 300) m.degree_progress = 75;
  else if (level >= 200) m.degree_progress = 50;
  else if (level >= 100) m.degree_progress = 25;
  else m.degree_progress = 0;

  m.is_final_year = level >= 400 ? 1 : 0;
  m.semesters_completed = level >= 100 ? Math.floor(level / 100) : 0;

  // Internships (check PortfolioItem or Opportunity records)
  try {
    const portfolio = await base44.asServiceRole.entities.PortfolioItem.filter(
      { created_by_id: userId, type: "internship" },
      "-created_date",
      50
    );
    m.internships_completed = (portfolio || []).length;
  } catch { m.internships_completed = 0; }

  // Community helps (simplified — count posts marked as helpful or study group messages)
  m.community_helps_count = 0;

  // Volunteer (simplified)
  m.volunteer_count = 0;

  return m;
}

function countStudyDaysThisWeek(sessions) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days = new Set();
  for (const s of sessions) {
    const d = s.session_date || s.created_date;
    if (d && new Date(d) >= weekAgo) {
      days.add(new Date(d).toDateString());
    }
  }
  return days.size;
}

function computeGPA(grades) {
  if (!grades || grades.length === 0) return 0;
  let totalPoints = 0;
  let totalWeight = 0;
  for (const g of grades) {
    const pct = (g.score || 0) / (g.max_score || 100);
    const point = pct >= 0.7 ? 5 : pct >= 0.6 ? 4 : pct >= 0.5 ? 3 : pct >= 0.4 ? 2 : 1;
    const weight = g.weight || 10;
    totalPoints += point * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? parseFloat((totalPoints / totalWeight).toFixed(2)) : 0;
}

function checkGPAImprovement(grades) {
  // Group by semester and check if latest semester GPA > previous
  const bySemester = {};
  for (const g of grades) {
    const sem = g.semester || "unknown";
    if (!bySemester[sem]) bySemester[sem] = [];
    bySemester[sem].push(g);
  }
  const semesters = Object.keys(bySemester).sort();
  if (semesters.length < 2) return 0;
  const prev = computeGPA(bySemester[semesters[semesters.length - 2]]);
  const curr = computeGPA(bySemester[semesters[semesters.length - 1]]);
  return curr > prev ? 1 : 0;
}

/**
 * Inline copy of the achievement catalog — backend functions can't
 * import from src/, so the catalog is duplicated here.
 * Keep in sync with src/lib/academic/achievementCatalog.js
 */
function getCatalog() {
  return [
    { key: "first_study_session", title: "First Study Session", description: "You completed your first study session.", category: "study", icon: "BookOpen", color: "142 71% 45%", metric: "study_sessions_count", threshold: 1, bud: "You completed your first study session — the journey begins!" },
    { key: "study_streak_3", title: "3-Day Study Streak", description: "You studied for 3 consecutive days.", category: "study", icon: "Flame", color: "32 92% 50%", metric: "study_streak", threshold: 3, bud: "3-day study streak! Your consistency is building momentum." },
    { key: "study_streak_7", title: "7-Day Study Streak", description: "You studied for 7 consecutive days.", category: "study", icon: "Flame", color: "0 84% 60%", metric: "study_streak", threshold: 7, bud: "A full week of studying — outstanding dedication!" },
    { key: "study_streak_30", title: "30-Day Study Streak", description: "You studied for 30 consecutive days.", category: "study", icon: "Trophy", color: "46 74% 55%", metric: "study_streak", threshold: 30, bud: "30 days of consistent studying — you're building a powerful habit." },
    { key: "study_100_hours", title: "100 Hours Studied", description: "You've spent 100 hours studying.", category: "study", icon: "Clock", color: "142 71% 45%", metric: "total_study_hours", threshold: 100, bud: "100 hours of focused study — your effort is remarkable." },
    { key: "consistent_learner", title: "Consistent Learner", description: "Studied on 5 different days in a week.", category: "study", icon: "TrendingUp", color: "142 71% 45%", metric: "study_days_this_week", threshold: 5, bud: "You studied 5 days this week — consistency is your superpower." },
    { key: "first_assignment", title: "First Assignment Submitted", description: "You submitted your first assignment.", category: "assignments", icon: "FileCheck", color: "217 91% 60%", metric: "assignments_completed", threshold: 1, bud: "First assignment submitted — you're on your way!" },
    { key: "assignments_10", title: "10 Assignments Completed", description: "You've completed 10 assignments.", category: "assignments", icon: "CheckCircle2", color: "217 91% 60%", metric: "assignments_completed", threshold: 10, bud: "10 assignments done — steady progress pays off." },
    { key: "all_on_time", title: "Always On Time", description: "Submitted every assignment on time this semester.", category: "assignments", icon: "Timer", color: "142 71% 45%", metric: "all_assignments_on_time", threshold: 1, bud: "Every assignment submitted on time — that's excellence." },
    { key: "semester_champion", title: "Semester Assignment Champion", description: "Completed every assignment this semester.", category: "assignments", icon: "Crown", color: "46 74% 55%", metric: "all_assignments_completed", threshold: 1, bud: "You completed every assignment this semester — brilliant work!" },
    { key: "first_exam", title: "First Exam Completed", description: "You completed your first exam.", category: "exams", icon: "ClipboardCheck", color: "262 83% 58%", metric: "exams_completed", threshold: 1, bud: "First exam completed — you handled it well." },
    { key: "excellent_performance", title: "Excellent Performance", description: "Scored 80% or above on an exam.", category: "exams", icon: "Star", color: "46 74% 55%", metric: "best_exam_score_pct", threshold: 80, bud: "You scored over 80% — outstanding academic performance!" },
    { key: "continuous_improvement", title: "Continuous Improvement", description: "Your grades improved across semesters.", category: "exams", icon: "TrendingUp", color: "142 71% 45%", metric: "gpa_improved", threshold: 1, bud: "Your grades are trending upward — keep growing!" },
    { key: "semester_excellence", title: "Semester Excellence", description: "Achieved a CGPA of 4.5 or higher.", category: "exams", icon: "Award", color: "46 74% 55%", metric: "current_gpa", threshold: 4.5, bud: "CGPA of excellence — your hard work speaks for itself." },
    { key: "notes_creator", title: "Notes Creator", description: "You created your first note.", category: "learning", icon: "StickyNote", color: "32 92% 50%", metric: "notes_count", threshold: 1, bud: "First note created — building your knowledge library!" },
    { key: "notes_10", title: "10 Notes Created", description: "You've created 10 notes.", category: "learning", icon: "Notebook", color: "32 92% 50%", metric: "notes_count", threshold: 10, bud: "10 notes and counting — your study library is growing." },
    { key: "flashcards_master", title: "Flashcard Master", description: "Completed your first flashcard set.", category: "learning", icon: "Layers", color: "32 92% 50%", metric: "flashcard_sets_completed", threshold: 1, bud: "Flashcards mastered — active recall is a powerful tool." },
    { key: "practice_tests_5", title: "Practice Makes Perfect", description: "Completed 5 practice tests.", category: "learning", icon: "FileQuestion", color: "32 92% 50%", metric: "practice_tests_count", threshold: 5, bud: "5 practice tests done — preparation meets opportunity." },
    { key: "research_completed", title: "Research Completed", description: "Completed your first research project.", category: "learning", icon: "Microscope", color: "262 83% 58%", metric: "research_projects_count", threshold: 1, bud: "Research project completed — you're thinking like a scholar." },
    { key: "first_study_group", title: "First Study Group", description: "You joined your first study group.", category: "collaboration", icon: "Users", color: "173 75% 38%", metric: "study_groups_count", threshold: 1, bud: "You joined a study group — learning together is powerful." },
    { key: "helpful_teammate", title: "Helpful Teammate", description: "Contributed to a study group discussion.", category: "collaboration", icon: "HeartHandshake", color: "173 75% 38%", metric: "study_group_contributions", threshold: 1, bud: "You helped your study group — collaboration at its best." },
    { key: "project_contributor", title: "Project Contributor", description: "Completed a collaborative project.", category: "collaboration", icon: "FolderCheck", color: "173 75% 38%", metric: "projects_completed", threshold: 1, bud: "Project completed — great teamwork!" },
    { key: "community_helper", title: "Community Helper", description: "Helped a peer in the community.", category: "collaboration", icon: "HandHeart", color: "173 75% 38%", metric: "community_helps_count", threshold: 1, bud: "You helped a peer — that's the UNIBUD spirit." },
    { key: "first_event", title: "First Event Attended", description: "You attended your first campus event.", category: "campus_life", icon: "Calendar", color: "198 88% 45%", metric: "events_attended", threshold: 1, bud: "First campus event — you're part of the community!" },
    { key: "club_member", title: "Club Member", description: "You joined a campus club.", category: "campus_life", icon: "Users", color: "198 88% 45%", metric: "clubs_joined", threshold: 1, bud: "You joined a club — campus life just got richer." },
    { key: "campus_leader", title: "Campus Leader", description: "Took on a leadership role.", category: "campus_life", icon: "Crown", color: "46 74% 55%", metric: "leadership_roles", threshold: 1, bud: "You stepped into leadership — inspiring others." },
    { key: "volunteer", title: "Volunteer", description: "Completed volunteer service.", category: "campus_life", icon: "HandHeart", color: "0 84% 60%", metric: "volunteer_count", threshold: 1, bud: "You gave back through volunteering — that matters." },
    { key: "degree_25", title: "25% Degree Progress", description: "You've completed a quarter of your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 25, bud: "You're 25% through your degree — a quarter of the way there!" },
    { key: "degree_50", title: "50% Degree Progress", description: "You're halfway through your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 50, bud: "Halfway through your degree — the finish line is in sight!" },
    { key: "degree_75", title: "75% Degree Progress", description: "You've completed three-quarters of your degree.", category: "milestone", icon: "Flag", color: "0 84% 60%", metric: "degree_progress", threshold: 75, bud: "75% done — you're nearly at graduation!" },
    { key: "degree_100", title: "Degree Completed", description: "You've completed your degree.", category: "milestone", icon: "GraduationCap", color: "46 74% 55%", metric: "degree_progress", threshold: 100, bud: "Congratulations — you've completed your degree!" },
    { key: "first_semester", title: "First Semester Completed", description: "You completed your first semester.", category: "milestone", icon: "CalendarCheck", color: "198 88% 45%", metric: "semesters_completed", threshold: 1, bud: "First semester completed — you've settled into university life." },
    { key: "first_internship", title: "First Internship", description: "Completed your first internship.", category: "milestone", icon: "Briefcase", color: "217 91% 60%", metric: "internships_completed", threshold: 1, bud: "Internship completed — real-world experience earned." },
    { key: "final_year", title: "Final Year", description: "You've reached your final year.", category: "milestone", icon: "Trophy", color: "46 74% 55%", metric: "is_final_year", threshold: 1, bud: "Final year — the last stretch before graduation. You've got this!" },
  ];
}