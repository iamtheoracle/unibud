import { TrendingUp, TrendingDown, Minus, Award, BookOpen, CheckCircle2, CalendarCheck, Flame, Clock, Target } from "lucide-react";

function pct(v) {
  return `${Math.round(v * 100)}%`;
}

function Metric({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="rounded-[18px] p-3.5 glass-card">
      <div className="flex items-center justify-between mb-1.5">
        <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: `hsl(${accent} / 0.14)` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: `hsl(${accent})` }} />
        </div>
        {sub && <span className="text-[10px] text-muted-foreground">{sub}</span>}
      </div>
      <p className="font-heading font-extrabold text-[20px] text-foreground tracking-tight leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function ReportMetrics({ report }) {
  const trendUp = report.gpaTrend > 0.01;
  const trendDown = report.gpaTrend < -0.01;
  const trendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
  const trendColor = trendUp ? "142 71% 45%" : trendDown ? "0 72% 51%" : "215 16% 45%";
  const trendVal = `${report.gpaTrend >= 0 ? "+" : ""}${report.gpaTrend.toFixed(2)}`;
  return (
    <div className="grid grid-cols-2 gap-3">
      <Metric label="Current GPA" value={report.currentGpa.toFixed(2)} icon={Award} accent="262 83% 58%" />
      <Metric label="Previous GPA" value={report.previousGpa != null ? report.previousGpa.toFixed(2) : "—"} icon={Award} accent="215 16% 45%" />
      <Metric label="GPA Trend" value={report.previousGpa != null ? trendVal : "—"} sub="vs last term" icon={trendIcon} accent={trendColor} />
      <Metric label="Semester Avg" value={report.semesterAvg ? `${Math.round(report.semesterAvg)}%` : "—"} icon={TrendingUp} accent="217 91% 60%" />
      <Metric label="Credits Done" value={String(report.creditsCompleted)} icon={CheckCircle2} accent="142 71% 45%" />
      <Metric label="Credits Left" value={String(report.creditsRemaining)} icon={BookOpen} accent="217 91% 60%" />
      <Metric label="Assignments" value={pct(report.assignmentCompletionRate)} sub={`${report.completedAssignments}/${report.totalAssignments}`} icon={CheckCircle2} accent="262 83% 58%" />
      <Metric label="Attendance" value={report.attendancePct != null ? `${Math.round(report.attendancePct * 100)}%` : "—"} icon={CalendarCheck} accent="142 71% 45%" />
      <Metric label="Study Streak" value={`${report.studyStreak}d`} sub={`best ${report.longestStreak}d`} icon={Flame} accent="38 92% 50%" />
      <Metric label="Longest Streak" value={`${report.longestStreak}d`} icon={Flame} accent="38 92% 50%" />
      <Metric label="Weekly Study" value={pct(report.weeklyConsistency)} icon={Clock} accent="217 91% 60%" />
      <Metric label="Goals Done" value={pct(report.goalCompletionPct)} sub={`${report.completedGoals}/${report.totalGoals}`} icon={Target} accent="262 83% 58%" />
    </div>
  );
}