import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Award, BookOpen, CalendarClock,
  Target, Flame, CheckCircle, GraduationCap, ChevronDown,
  AlertCircle, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function BudAcademicInsights() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [expandedId, setExpandedId] = React.useState(null);

  const { data: grades } = useQuery({
    queryKey: ["insights", "grades"],
    queryFn: () => base44.entities.Grade.list("-created_date", 20),
    enabled: isOnline,
  });

  const { data: assignments } = useQuery({
    queryKey: ["insights", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 30),
    enabled: isOnline,
  });

  const { data: courses } = useQuery({
    queryKey: ["insights", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 20),
    enabled: isOnline,
  });

  const { data: achievements } = useQuery({
    queryKey: ["insights", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 20),
    enabled: isOnline,
  });

  const { data: studySessions } = useQuery({
    queryKey: ["insights", "study"],
    queryFn: () => base44.entities.StudySession.list("-created_date", 30),
    enabled: isOnline,
  });

  const { data: attendance } = useQuery({
    queryKey: ["insights", "attendance"],
    queryFn: () => base44.entities.AttendanceRecord.list("-created_date", 30),
    enabled: isOnline,
  });

  const { data: goals } = useQuery({
    queryKey: ["insights", "goals"],
    queryFn: () => base44.entities.StudentGoal.list("-created_date", 10),
    enabled: isOnline,
  });

  const insights = useMemo(() => {
    const list = [];

    // GPA trend
    if (grades && grades.length >= 2) {
      const recent = grades.slice(0, 2).reverse();
      const prevGpa = parseFloat(recent[0]?.grade || recent[0]?.gpa || 0);
      const currGpa = parseFloat(recent[1]?.grade || recent[1]?.gpa || 0);
      if (prevGpa > 0 && currGpa > 0) {
        const improved = currGpa > prevGpa;
        list.push({
          id: "gpa-trend",
          icon: improved ? TrendingUp : TrendingDown,
          title: improved ? "Your GPA has improved" : "Your GPA needs attention",
          summary: improved
            ? `Your GPA went from ${prevGpa.toFixed(2)} to ${currGpa.toFixed(2)} — keep it up!`
            : `Your GPA dipped from ${prevGpa.toFixed(2)} to ${currGpa.toFixed(2)}. Bud can help you bounce back.`,
          tone: improved ? "positive" : "attention",
          expandable: true,
          detail: improved
            ? "This upward trend shows your study strategies are working. Consider maintaining your current routine and focusing on upcoming assessments."
            : "Consider reviewing your study schedule and reaching out for tutoring in challenging subjects. Small adjustments can make a big difference.",
          action: { label: "View Grades", path: "/academics/results" },
        });
      }
    }

    // Assignment completion rate
    if (assignments && assignments.length > 0) {
      const submitted = assignments.filter(a => a.status === "submitted" || a.status === "completed" || a.submitted).length;
      const rate = Math.round((submitted / assignments.length) * 100);
      if (rate >= 80) {
        list.push({
          id: "assignment-rate",
          icon: CheckCircle,
          title: `You've submitted ${rate}% of assignments on time`,
          summary: "Excellent consistency with your coursework submissions.",
          tone: "positive",
          expandable: true,
          detail: `You've submitted ${submitted} out of ${assignments.length} assignments. Maintaining this rate throughout the semester will positively impact your final grades.`,
          action: { label: "View Assignments", path: "/assignments" },
        });
      }
    }

    // Study streak
    if (studySessions && studySessions.length > 0) {
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasSession = studySessions.some(s => {
          const sd = new Date(s.date || s.scheduled_date || s.created_date);
          return sd.toDateString() === checkDate.toDateString();
        });
        if (hasSession) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      if (streak >= 3) {
        list.push({
          id: "study-streak",
          icon: Flame,
          title: `${streak}-day study streak`,
          summary: streak >= 14
            ? `You've maintained a ${streak}-day study streak. Outstanding dedication!`
            : `You've studied ${streak} days in a row. Keep the momentum going!`,
          tone: "positive",
          expandable: true,
          detail: "Consistent daily study, even for short periods, is more effective than cramming. You're building a powerful habit.",
          action: { label: "Study Sessions", path: "/study-sessions" },
        });
      }
    }

    // Course progress
    if (courses && courses.length > 0) {
      const totalCourses = courses.length;
      const completed = courses.filter(c => c.status === "completed" || c.progress >= 100).length;
      if (totalCourses > 0) {
        const pct = Math.round((completed / totalCourses) * 100);
        list.push({
          id: "course-progress",
          icon: BookOpen,
          title: `${completed} of ${totalCourses} courses completed`,
          summary: `You're ${pct}% through your enrolled courses this period.`,
          tone: "neutral",
          expandable: true,
          detail: `Course completion tracking helps you see the big picture of your academic journey. ${totalCourses - completed} course${totalCourses - completed === 1 ? "" : "s"} remaining.`,
          action: { label: "View Courses", path: "/courses" },
        });
      }
    }

    // Attendance trend
    if (attendance && attendance.length > 0) {
      const present = attendance.filter(a => a.status === "present" || a.attended).length;
      const rate = Math.round((present / attendance.length) * 100);
      if (rate >= 75) {
        list.push({
          id: "attendance",
          icon: CheckCircle,
          title: `${rate}% attendance rate`,
          summary: rate >= 90
            ? "Excellent attendance! You're rarely missing classes."
            : "Good attendance. A few more classes would push you to excellent.",
          tone: "positive",
          expandable: true,
          detail: `You've attended ${present} out of ${attendance.length} recorded sessions. Regular attendance strongly correlates with academic success.`,
          action: { label: "View Attendance", path: "/attendance" },
        });
      } else if (rate < 75 && rate > 0) {
        list.push({
          id: "attendance-low",
          icon: AlertCircle,
          title: "Attendance needs attention",
          summary: `Your attendance is at ${rate}%. Consider attending more classes.`,
          tone: "attention",
          expandable: true,
          detail: `Low attendance can impact your understanding of course material and your grades. You've attended ${present} out of ${attendance.length} sessions.`,
          action: { label: "View Attendance", path: "/attendance" },
        });
      }
    }

    // Achievements count
    if (achievements && achievements.length > 0) {
      list.push({
        id: "achievements",
        icon: Award,
        title: `${achievements.length} achievements earned`,
        summary: "Your academic milestones are being recognized.",
        tone: "positive",
        expandable: true,
        detail: `You've earned ${achievements.length} achievement${achievements.length === 1 ? "" : "s"} so far. Each one represents a meaningful step in your academic journey.`,
        action: { label: "View Achievements", path: "/achievements" },
      });
    }

    // Active goals
    if (goals && goals.length > 0) {
      const active = goals.filter(g => g.status === "active" || g.status === "in_progress");
      if (active.length > 0) {
        list.push({
          id: "goals",
          icon: Target,
          title: `${active.length} active goal${active.length === 1 ? "" : "s"}`,
          summary: "Stay focused on your academic targets.",
          tone: "neutral",
          expandable: true,
          detail: "Setting and tracking goals helps you stay motivated and measure progress. Review your goals regularly to stay on track.",
          action: { label: "View Goals", path: "/me" },
        });
      }
    }

    return list;
  }, [grades, assignments, courses, achievements, studySessions, attendance, goals]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        <h3 className="text-[15px] font-bold text-foreground tracking-tight">Bud Insights</h3>
      </div>

      <div className="space-y-2">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          const isExpanded = expandedId === insight.id;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-[18px] bg-card overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <button
                onClick={() => insight.expandable && setExpandedId(isExpanded ? null : insight.id)}
                className="w-full flex items-start gap-2.5 p-3.5 text-left"
              >
                <div
                  className={`w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                    insight.tone === "positive"
                      ? "bg-success/10"
                      : insight.tone === "attention"
                      ? "bg-warning/10"
                      : "bg-primary/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      insight.tone === "positive"
                        ? "text-success"
                        : insight.tone === "attention"
                        ? "text-warning"
                        : "text-primary"
                    }`}
                    strokeWidth={2.2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground">{insight.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{insight.summary}</p>
                </div>
                {insight.expandable && (
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    strokeWidth={2.2}
                  />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5">
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">{insight.detail}</p>
                        {insight.action && (
                          <button
                            onClick={() => navigate(insight.action.path)}
                            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary active:scale-95 transition-transform"
                          >
                            {insight.action.label}
                            <ChevronDown className="w-3 h-3 -rotate-90" strokeWidth={2.2} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}