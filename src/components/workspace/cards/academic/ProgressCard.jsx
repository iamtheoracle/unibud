import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Award, Target, Flame, Clock, GraduationCap, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

function computeGPA(grades) {
  if (!grades || grades.length === 0) return null;
  let totalPoints = 0;
  let totalWeight = 0;
  for (const g of grades) {
    const pct = (g.score || 0) / (g.max_score || 100);
    const point = pct >= 0.7 ? 5 : pct >= 0.6 ? 4 : pct >= 0.5 ? 3 : pct >= 0.4 ? 2 : 1;
    const weight = g.weight || 10;
    totalPoints += point * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : null;
}

function degreeProgress(user) {
  const level = parseInt(user?.level || "0");
  if (level >= 400) return 100;
  if (level >= 300) return 75;
  if (level >= 200) return 50;
  if (level >= 100) return 25;
  const enrollYear = user?.enrollment_year;
  if (enrollYear) {
    const yearsElapsed = new Date().getFullYear() - enrollYear;
    return Math.min(100, Math.max(0, Math.round((yearsElapsed / 4) * 100)));
  }
  return 0;
}

function budEncouragement({ gpa, degreePct, assignmentRate, streak, goalsCompleted, goalsTotal }) {
  if (degreePct >= 90) return "You're nearly at the finish line — graduation is within reach!";
  if (assignmentRate === 100) return "Amazing! You've completed every assignment. That's excellence.";
  if (streak >= 7) return streak + "-day study streak! Your consistency is building real momentum.";
  if (gpa && parseFloat(gpa) >= 4.5) return "CGPA of " + gpa + " — outstanding work. Keep this standard up!";
  if (assignmentRate < 50) return "A few assignments are pending. Let's tackle them together — one at a time.";
  if (goalsCompleted > 0 && goalsCompleted === goalsTotal) return "Every goal achieved this period. Brilliant work!";
  if (degreePct >= 50) return "You're " + degreePct + "% through your degree. Halfway there — keep pushing!";
  return "Every study session brings you closer. Let's keep building together.";
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={"h-full " + (color || "bg-primary") + " rounded-full transition-all duration-700"}
        style={{ width: Math.min(100, Math.max(0, value)) + "%" }}
      />
    </div>
  );
}

function StatRow({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <span className="text-[12px] text-muted-foreground flex-1">{label}</span>
      <span className="text-[13px] font-bold text-foreground tabular-nums">{value}</span>
      {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function ProgressCard() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me(), staleTime: 300000 });
  const u = user?.data || user || {};

  const { data: grades, isLoading } = useQuery({
    queryKey: ["card-progress-grades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 50),
    staleTime: 120000,
  });
  const { data: assignments } = useQuery({
    queryKey: ["card-progress-assignments"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 50),
    staleTime: 60000,
  });
  const { data: sessions } = useQuery({
    queryKey: ["card-progress-sessions"],
    queryFn: () => base44.entities.StudySession.list("-created_date", 5),
    staleTime: 60000,
  });
  const { data: goals } = useQuery({
    queryKey: ["card-progress-goals"],
    queryFn: () => base44.entities.StudentGoal.list("-created_date", 10),
    staleTime: 120000,
  });

  const metrics = useMemo(() => {
    const gpa = computeGPA(grades);
    const degreePct = degreeProgress(u);
    const allAssignments = assignments || [];
    const completedAssignments = allAssignments.filter(function (a) { return a.status === "submitted" || a.status === "graded"; });
    const assignmentRate = allAssignments.length > 0
      ? Math.round((completedAssignments.length / allAssignments.length) * 100)
      : 0;
    const streak = (sessions && sessions[0] && sessions[0].study_streak) || 0;
    const allGoals = goals || [];
    const completedGoals = allGoals.filter(function (g) { return g.is_completed; });
    const upcomingMilestones = allAssignments
      .filter(function (a) { return a.status === "pending" && a.due_date; })
      .sort(function (a, b) { return new Date(a.due_date) - new Date(b.due_date); })
      .slice(0, 3);
    const encouragement = budEncouragement({
      gpa: gpa, degreePct: degreePct, assignmentRate: assignmentRate, streak: streak,
      goalsCompleted: completedGoals.length, goalsTotal: allGoals.length,
    });
    return { gpa: gpa, degreePct: degreePct, assignmentRate: assignmentRate, streak: streak, allGoals: allGoals, completedGoals: completedGoals, upcomingMilestones: upcomingMilestones, encouragement: encouragement };
  }, [grades, assignments, sessions, goals, u]);

  if (isLoading) return <ListSkeleton rows={4} />;

  var gpa = metrics.gpa;
  var degreePct = metrics.degreePct;
  var assignmentRate = metrics.assignmentRate;
  var streak = metrics.streak;
  var allGoals = metrics.allGoals;
  var completedGoals = metrics.completedGoals;
  var upcomingMilestones = metrics.upcomingMilestones;
  var encouragement = metrics.encouragement;
  var goalText = completedGoals.length + "/" + allGoals.length;
  var remainingPct = 100 - degreePct;

  return (
    <div className="space-y-4">
      {/* Bud's encouragement */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
        <span className="text-[13px] text-foreground leading-snug">{encouragement}</span>
      </div>

      {/* Degree progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-primary" /> Degree Progress
          </span>
          <span className="text-[15px] font-bold text-primary tabular-nums">{degreePct}%</span>
        </div>
        <ProgressBar value={degreePct} />
        <p className="text-[11px] text-muted-foreground">
          {degreePct >= 100 ? "Degree requirements met — congratulations!" : remainingPct + "% remaining before graduation"}
        </p>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-1">
        {gpa && <StatRow icon={Award} label="CGPA" value={gpa} sub="/ 5.0" />}
        <StatRow icon={CheckCircle2} label="Assignments" value={assignmentRate + "%"} sub="done" />
        <StatRow icon={Flame} label="Study streak" value={streak} sub="days" />
        <StatRow icon={Target} label="Goals" value={goalText} sub="met" />
      </div>

      {/* Upcoming milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Upcoming Milestones</span>
          {upcomingMilestones.map(function (m) {
            return (
              <div key={m.id} className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-[12px] text-foreground flex-1 truncate">{m.title}</span>
                <span className="text-[11px] text-muted-foreground">
                  {m.due_date ? new Date(m.due_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link to="/academics/results" className="block text-[12px] font-medium text-primary pt-1">
        Full academic report →
      </Link>
    </div>
  );
}