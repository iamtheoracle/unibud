import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Award, FolderKanban, TrendingUp, BookOpen, Flame,
  Trophy, Users, Sparkles, ChevronRight, CheckCircle2,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AcademicProgressCard — a comprehensive progress overview powered by
 * real student data only. Displays deadlines, exams, milestones, GPA,
 * study streak, achievements, and Bud's recommendation for the next goal.
 *
 * Props: assignments, exams, projects, grades, courses, sessions, achievements, studyGroups
 */
export default function AcademicProgressCard({
  assignments = [],
  exams = [],
  projects = [],
  grades = [],
  courses = [],
  sessions = [],
  achievements = [],
  studyGroups = [],
}) {
  const navigate = useNavigate();

  const data = useMemo(() => {
    const now = new Date();

    const upcomingAssignments = assignments
      .filter((a) => {
        const due = a.due_date ? new Date(a.due_date) : null;
        return due && due >= now && a.status !== "submitted" && a.status !== "graded";
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const upcomingExams = exams
      .filter((e) => {
        const d = e.date ? new Date(e.date) : null;
        return d && d >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const allMilestones = projects.flatMap((p) =>
      (p.milestones || []).map((m) => ({ ...m, projectTitle: p.title, projectId: p.id }))
    );
    const completedMilestones = allMilestones.filter((m) => m.done).length;
    const totalMilestones = allMilestones.length;
    const projectCompletion = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const completedProjects = projects.filter((p) => p.status === "completed").length;

    const completedCourses = courses.filter((c) => c.status === "completed");
    const totalCredits = courses.reduce((a, c) => a + (c.credits || 0), 0);
    const completedCredits = completedCourses.reduce((a, c) => a + (c.credits || 0), 0);
    const degreeCompletion = totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0;

    const semesterCourses = courses.filter((c) => c.status === "active" || c.status === "completed");
    const semesterCredits = semesterCourses.reduce((a, c) => a + (c.credits || 0), 0);

    let gpa = null;
    if (grades.length > 0) {
      const totalWeight = grades.reduce((a, g) => a + (g.weight || 10), 0);
      const weightedScore = grades.reduce((a, g) => {
        const pct = ((g.score || 0) / (g.max_score || 100)) * 100;
        return a + pct * (g.weight || 10);
      }, 0);
      const avgPct = weightedScore / totalWeight;
      gpa = (avgPct / 20).toFixed(2);
    }

    const studyStreak = sessions.length > 0
      ? sessions.slice().sort((a, b) => new Date(b.session_date || b.started_at) - new Date(a.session_date || a.started_at))[0].study_streak || 0
      : 0;

    const recentAchievements = achievements
      .slice()
      .sort((a, b) => new Date(b.date_earned || b.created_date) - new Date(a.date_earned || a.created_date))
      .slice(0, 3);

    const certifications = achievements.filter((a) => a.category === "milestone" || a.category === "learning");

    const studyGroupCount = studyGroups.length;
    const activeStudyGroups = studyGroups.filter((sg) => sg.status === "active" || !sg.status).length;

    let budRec = "Keep up the great work! Your academic journey is on track.";
    if (upcomingAssignments.length > 0) {
      const next = upcomingAssignments[0];
      const days = Math.ceil((new Date(next.due_date) - now) / (1000 * 60 * 60 * 24));
      if (days <= 2) {
        budRec = `"${next.title}" is due ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}. Focus on this first — you've got this.`;
      } else {
        budRec = `Your next assignment "${next.title}" is due in ${days} days. Start early to stay ahead.`;
      }
    } else if (upcomingExams.length > 0) {
      const next = upcomingExams[0];
      const days = Math.ceil((new Date(next.date) - now) / (1000 * 60 * 60 * 24));
      budRec = `${next.title} is coming up in ${days} day${days === 1 ? "" : "s"}. Begin your revision plan with Bud.`;
    } else if (totalMilestones > 0 && completedMilestones < totalMilestones) {
      budRec = `You're ${projectCompletion}% through your project milestones. Tackle the next milestone this week.`;
    } else if (studyStreak === 0) {
      budRec = "Start a study session today to build your streak. Even 25 minutes makes a difference.";
    }

    return {
      upcomingAssignments, upcomingExams, completedMilestones, totalMilestones,
      projectCompletion, completedProjects, degreeCompletion, completedCredits,
      totalCredits, semesterCredits, gpa, studyStreak, recentAchievements,
      certifications: certifications.length, studyGroupCount, activeStudyGroups, budRec,
    };
  }, [assignments, exams, projects, grades, courses, sessions, achievements, studyGroups]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="liquid-mirror rounded-[24px] p-5 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[17px] font-bold text-foreground tracking-tight">Academic Progress</h2>
          <p className="text-[11px] text-muted-foreground">Your real-time academic standing</p>
        </div>
        <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-chocolate flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <MetricTile icon={Award} value={data.gpa ? data.gpa : "—"} label="GPA" color="text-primary" bg="bg-primary/10" />
        <MetricTile icon={Flame} value={data.studyStreak} label="Day Streak" color="text-error" bg="bg-error/10" />
        <MetricTile icon={BookOpen} value={`${data.degreeCompletion}%`} label="Degree" color="text-accent" bg="bg-accent/10" />
        <MetricTile icon={Trophy} value={data.certifications} label="Milestones" color="text-warning" bg="bg-warning/10" />
      </div>

      {/* Progress bars */}
      <div className="space-y-2.5 mb-4">
        <ProgressBar label="Degree Completion" value={data.completedCredits} max={data.totalCredits} percent={data.degreeCompletion} color="bg-primary" onClick={() => navigate("/courses")} />
        <ProgressBar label="Project Milestones" value={data.completedMilestones} max={data.totalMilestones} percent={data.projectCompletion} color="bg-accent" onClick={() => navigate("/projects")} />
        <ProgressBar
          label="Semester Credits"
          value={data.semesterCredits}
          max={data.totalCredits || data.semesterCredits}
          percent={data.totalCredits > 0 ? Math.round((data.semesterCredits / data.totalCredits) * 100) : 100}
          color="bg-success"
          onClick={() => navigate("/courses")}
        />
      </div>

      {/* Upcoming deadlines & exams */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] font-bold text-foreground">Assignments Due</p>
          </div>
          {data.upcomingAssignments.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No upcoming deadlines</p>
          ) : (
            <div className="space-y-1.5">
              {data.upcomingAssignments.slice(0, 2).map((a) => {
                const days = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={a.id} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${days <= 1 ? "bg-error" : days <= 3 ? "bg-warning" : "bg-success"}`} />
                    <p className="text-[10px] text-foreground/80 truncate flex-1">{a.title}</p>
                    <span className="text-[9px] font-bold text-muted-foreground">{days === 0 ? "today" : `${days}d`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Award className="w-3.5 h-3.5 text-chocolate" />
            <p className="text-[11px] font-bold text-foreground">Upcoming Exams</p>
          </div>
          {data.upcomingExams.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No exams scheduled</p>
          ) : (
            <div className="space-y-1.5">
              {data.upcomingExams.slice(0, 2).map((e) => {
                const days = Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={e.id} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${days <= 3 ? "bg-error" : "bg-warning"}`} />
                    <p className="text-[10px] text-foreground/80 truncate flex-1">{e.title}</p>
                    <span className="text-[9px] font-bold text-muted-foreground">{days === 0 ? "today" : `${days}d`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent achievements */}
      {data.recentAchievements.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-warning" />
              <p className="text-[11px] font-bold text-foreground">Recent Achievements</p>
            </div>
            <button onClick={() => navigate("/achievements")} className="text-[10px] font-bold text-primary spring-tap">See all</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {data.recentAchievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                className="shrink-0 w-24 glass-card p-2.5 text-center"
              >
                <div className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center"
                  style={{ background: a.accent_color ? `hsl(${a.accent_color} / 0.15)` : "hsl(var(--warning) / 0.15)" }}>
                  <Trophy className="w-4 h-4" style={{ color: a.accent_color ? `hsl(${a.accent_color})` : "hsl(var(--warning))" }} />
                </div>
                <p className="text-[9px] font-semibold text-foreground line-clamp-2 leading-tight">{a.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Study groups & projects summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={() => navigate("/study-groups")} className="glass-card p-2.5 text-center spring-tap">
          <Users className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-[14px] font-bold text-foreground tabular-nums">{data.studyGroupCount}</p>
          <p className="text-[8px] text-muted-foreground">Study Groups</p>
        </button>
        <button onClick={() => navigate("/projects")} className="glass-card p-2.5 text-center spring-tap">
          <FolderKanban className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-[14px] font-bold text-foreground tabular-nums">{data.completedProjects}</p>
          <p className="text-[8px] text-muted-foreground">Projects Done</p>
        </button>
        <button onClick={() => navigate("/academics/insights")} className="glass-card p-2.5 text-center spring-tap">
          <CheckCircle2 className="w-4 h-4 text-success mx-auto mb-1" />
          <p className="text-[14px] font-bold text-foreground tabular-nums">{data.completedMilestones}</p>
          <p className="text-[8px] text-muted-foreground">Milestones</p>
        </button>
      </div>

      {/* Bud recommendation */}
      <div className="flex items-start gap-2.5 p-3 rounded-[16px] bg-gradient-to-br from-primary/5 to-chocolate/5 border border-primary/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-0.5">Bud's Recommendation</p>
          <p className="text-[12px] text-foreground/80 leading-relaxed">{data.budRec}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-1.5" onClick={() => navigate("/bud")} />
      </div>
    </motion.div>
  );
}

function MetricTile({ icon: Icon, value, label, color, bg }) {
  return (
    <div className="text-center">
      <div className={`w-8 h-8 rounded-[12px] ${bg} flex items-center justify-center mx-auto mb-1`}>
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.2} />
      </div>
      <p className="font-heading font-extrabold text-[15px] text-foreground tabular-nums leading-tight">{value}</p>
      <p className="text-[8px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, percent, color, onClick }) {
  return (
    <button onClick={onClick} className="block w-full text-left spring-tap">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
        <span className="text-[10px] font-bold text-foreground tabular-nums">{value}/{max || value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </button>
  );
}