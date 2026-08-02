import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import {
  ArrowLeft, TrendingUp, TrendingDown, Flame, Award, Target,
  CheckCircle, CalendarClock, BookOpen, GraduationCap, Sparkles,
  Clock, ChevronDown, Download, Loader2, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import StudyStreakIntelligence from "@/components/academics/StudyStreakIntelligence";
import ClassReminderSystem from "@/components/academics/ClassReminderSystem";
import { toast } from "@/components/ui/use-toast";

const TIME_RANGES = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "semester", label: "Semester" },
  { id: "yearly", label: "Yearly" },
];

function pctToGpa(pct) {
  // Nigerian 5.0 scale
  if (pct >= 70) return 5.0;
  if (pct >= 60) return 4.0;
  if (pct >= 50) return 3.0;
  if (pct >= 45) return 2.0;
  if (pct >= 40) return 1.0;
  return 0.0;
}

function formatDateShort(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function AcademicInsights() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [range, setRange] = useState("semester");
  const [exporting, setExporting] = useState(false);
  const reportRef = React.useRef(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`UNIBUD-Academic-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "Report exported", description: "Your academic report has been downloaded." });
    } catch (err) {
      toast({ title: "Export failed", description: "Could not generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const { data: grades } = useQuery({
    queryKey: ["insights", "grades", range],
    queryFn: () => base44.entities.Grade.list("-date", 100),
    enabled: isOnline,
  });

  const { data: sessions } = useQuery({
    queryKey: ["insights", "sessions", range],
    queryFn: () => base44.entities.StudySession.list("-created_date", 100),
    enabled: isOnline,
  });

  const { data: attendance } = useQuery({
    queryKey: ["insights", "attendance", range],
    queryFn: () => base44.entities.AttendanceRecord.list("-date", 100),
    enabled: isOnline,
  });

  const { data: assignments } = useQuery({
    queryKey: ["insights", "assignments", range],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
    enabled: isOnline,
  });

  const { data: courses } = useQuery({
    queryKey: ["insights", "courses-insights", range],
    queryFn: () => base44.entities.Course.list("-created_date", 50),
    enabled: isOnline,
  });

  const { data: goals } = useQuery({
    queryKey: ["insights", "goals-insights", range],
    queryFn: () => base44.entities.StudentGoal.list("-created_date", 20),
    enabled: isOnline,
  });

  const { data: milestones } = useQuery({
    queryKey: ["insights", "milestones", range],
    queryFn: () => base44.entities.Milestone.list("-target_date", 20),
    enabled: isOnline,
  });

  const data = useMemo(() => {
    // GPA trend by date
    const gradesByDate = {};
    (grades || []).forEach((g) => {
      const key = g.date || g.created_date?.slice(0, 10);
      if (!key) return;
      if (!gradesByDate[key]) gradesByDate[key] = [];
      const pct = (g.score / g.max_score) * 100;
      gradesByDate[key].push(pctToGpa(pct));
    });
    const gpaTrend = Object.keys(gradesByDate).sort().map((k) => ({
      date: formatDateShort(k),
      gpa: gradesByDate[k].reduce((a, b) => a + b, 0) / gradesByDate[k].length,
    }));

    // Semester vs cumulative GPA
    const allGpas = (grades || []).map((g) => pctToGpa((g.score / g.max_score) * 100));
    const cumulativeGpa = allGpas.length > 0 ? allGpas.reduce((a, b) => a + b, 0) / allGpas.length : 0;

    const semesters = {};
    (grades || []).forEach((g) => {
      const s = g.semester || "Current";
      if (!semesters[s]) semesters[s] = [];
      semesters[s].push(pctToGpa((g.score / g.max_score) * 100));
    });
    const semesterGpas = Object.keys(semesters).map((s) => ({
      semester: s,
      gpa: semesters[s].reduce((a, b) => a + b, 0) / semesters[s].length,
    }));

    // Credits — use course credits if available, otherwise count courses
    const completedCourses = (courses || []).filter((c) => c.status === "completed" || c.progress >= 100);
    const totalCourses = (courses || []).length;
    const creditsCompleted = completedCourses.reduce((sum, c) => sum + (c.credit_units || c.credits || 0), 0);
    const totalCredits = (courses || []).reduce((sum, c) => sum + (c.credit_units || c.credits || 0), 0);
    const hasCredits = totalCredits > 0;
    const degreePct = hasCredits ? Math.round((creditsCompleted / totalCredits) * 100) : (totalCourses > 0 ? Math.round((completedCourses.length / totalCourses) * 100) : 0);

    // Assignment completion rate
    const totalAssignments = (assignments || []).length;
    const submittedAssignments = (assignments || []).filter((a) => a.status === "submitted" || a.status === "completed" || a.submitted).length;
    const assignmentRate = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

    // Attendance trend
    const attendanceByDate = {};
    (attendance || []).forEach((a) => {
      const key = a.date;
      if (!key) return;
      if (!attendanceByDate[key]) attendanceByDate[key] = { present: 0, total: 0 };
      attendanceByDate[key].total++;
      if (a.status === "present") attendanceByDate[key].present++;
    });
    const attendanceTrend = Object.keys(attendanceByDate).sort().map((k) => ({
      date: formatDateShort(k),
      rate: Math.round((attendanceByDate[k].present / attendanceByDate[k].total) * 100),
    }));
    const presentCount = (attendance || []).filter((a) => a.status === "present").length;
    const attendanceRate = (attendance || []).length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

    // Weekly study hours
    const studyByDay = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      studyByDay[d.toDateString()] = 0;
    }
    (sessions || []).forEach((s) => {
      const d = new Date(s.session_date || s.started_at || s.created_date);
      const key = d.toDateString();
      if (key in studyByDay) {
        studyByDay[key] += (s.duration_minutes || 0) / 60;
      }
    });
    const weeklyStudyHours = Object.keys(studyByDay).map((k) => ({
      day: new Date(k).toLocaleDateString("en", { weekday: "short" }),
      hours: Math.round(studyByDay[k] * 10) / 10,
    }));

    const totalWeeklyHours = weeklyStudyHours.reduce((sum, d) => sum + d.hours, 0);

    // Monthly progress — last 6 months
    const monthlyHours = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyHours[d.toLocaleDateString("en", { month: "short" })] = 0;
    }
    (sessions || []).forEach((s) => {
      const d = new Date(s.session_date || s.started_at || s.created_date);
      const key = d.toLocaleDateString("en", { month: "short" });
      if (key in monthlyHours) {
        monthlyHours[key] += (s.duration_minutes || 0) / 60;
      }
    });
    const monthlyProgress = Object.keys(monthlyHours).map((k) => ({
      month: k,
      hours: Math.round(monthlyHours[k] * 10) / 10,
    }));

    // Latest GPA vs previous
    const latestGpa = gpaTrend.length > 0 ? gpaTrend[gpaTrend.length - 1].gpa : 0;
    const prevGpa = gpaTrend.length > 1 ? gpaTrend[gpaTrend.length - 2].gpa : latestGpa;
    const gpaDelta = latestGpa - prevGpa;

    return {
      gpaTrend,
      semesterGpas,
      cumulativeGpa,
      latestGpa,
      gpaDelta,
      creditsCompleted,
      totalCredits,
      hasCredits,
      completedCourses: completedCourses.length,
      totalCourses,
      degreePct,
      assignmentRate,
      submittedAssignments,
      totalAssignments,
      attendanceTrend,
      attendanceRate,
      presentCount,
      totalAttendance: (attendance || []).length,
      weeklyStudyHours,
      totalWeeklyHours,
      monthlyProgress,
    };
  }, [grades, sessions, attendance, assignments, courses]);

  const budMessages = useMemo(() => {
    const msgs = [];
    if (data.gpaDelta !== 0 && data.latestGpa > 0) {
      msgs.push(
        data.gpaDelta > 0
          ? `Your GPA has improved by ${data.gpaDelta.toFixed(2)} recently — keep it up!`
          : `Your GPA dipped by ${Math.abs(data.gpaDelta).toFixed(2)}. Bud can help you bounce back.`
      );
    }
    if (data.hasCredits && data.totalCredits > 0) {
      msgs.push(`You have completed ${data.creditsCompleted} of ${data.totalCredits} required credits.`);
    } else if (data.totalCourses > 0) {
      msgs.push(`You have completed ${data.completedCourses} of ${data.totalCourses} enrolled courses.`);
    }
    if (data.degreePct > 0) {
      msgs.push(`You're ${data.degreePct}% through your degree programme.`);
    }
    if (data.totalWeeklyHours > 0) {
      msgs.push(`You studied ${data.totalWeeklyHours.toFixed(1)} hours this week.`);
    }
    if (data.assignmentRate > 0) {
      msgs.push(`Your assignment completion rate is ${data.assignmentRate}%.`);
    }
    return msgs;
  }, [data]);

  const hasAnyData = (grades?.length || 0) + (sessions?.length || 0) + (attendance?.length || 0) + (courses?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <ArrowLeft className="w-4 h-4 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[18px] font-bold text-foreground tracking-tight">Academic Insights</h1>
            <p className="text-[11px] text-muted-foreground">Bud's analysis of your academic progress</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={exporting || !hasAnyData}
              className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-[12px] font-bold flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} />
              ) : (
                <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
              )}
              PDF
            </button>
          </div>
        </div>

        {/* Time range selector */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          {TIME_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3.5 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                range === r.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground"
              }`}
              style={range !== r.id ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={reportRef} className="max-w-[640px] mx-auto px-4 pt-4 space-y-4">
        {/* Bud explanation */}
        {budMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] bg-gradient-to-br from-primary/5 to-chocolate/5 p-4 border border-primary/10"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
              <span className="text-[12px] font-bold text-foreground">Bud's Summary</span>
            </div>
            <div className="space-y-1.5">
              {budMessages.map((msg, i) => (
                <p key={i} className="text-[12px] text-muted-foreground leading-relaxed">{msg}</p>
              ))}
            </div>
          </motion.div>
        )}

        {!hasAnyData && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
              <BookOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
            </div>
            <h3 className="text-[16px] font-bold text-foreground mb-1.5">No academic data yet</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[280px]">
              Insights will appear once you have grades, study sessions, or attendance records.
            </p>
          </div>
        )}

        {/* GPA Trend */}
        {data.gpaTrend.length > 0 && (
          <InsightCard icon={data.gpaDelta >= 0 ? TrendingUp : TrendingDown} title="GPA Trend" bud={data.gpaDelta >= 0 ? "Your GPA is trending upward." : "Your GPA has dipped — let's get back on track."}>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-[28px] font-bold text-foreground tracking-tight">{data.latestGpa.toFixed(2)}</span>
              {data.gpaDelta !== 0 && (
                <span className={`text-[12px] font-bold flex items-center gap-0.5 ${data.gpaDelta > 0 ? "text-success" : "text-destructive"}`}>
                  {data.gpaDelta > 0 ? "+" : ""}{data.gpaDelta.toFixed(2)}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data.gpaTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(26 100% 50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(26 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Area type="monotone" dataKey="gpa" stroke="hsl(26 100% 50%)" strokeWidth={2.5} fill="url(#gpaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>
        )}

        {/* GPA comparison: Semester vs Cumulative */}
        {data.semesterGpas.length > 0 && (
          <InsightCard icon={GraduationCap} title="Semester vs Cumulative GPA" bud={`Your cumulative GPA is ${data.cumulativeGpa.toFixed(2)}.`}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="text-center p-3 rounded-[14px] bg-primary/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Cumulative</p>
                <p className="text-[22px] font-bold text-primary mt-1">{data.cumulativeGpa.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 rounded-[14px] bg-chocolate/5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Latest Semester</p>
                <p className="text-[22px] font-bold text-chocolate mt-1">{data.latestGpa.toFixed(2)}</p>
              </div>
            </div>
            {data.semesterGpas.length > 1 && (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={data.semesterGpas} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                  <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Bar dataKey="gpa" fill="hsl(26 100% 50%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </InsightCard>
        )}

        {/* Degree Progress */}
        {data.degreePct > 0 && (
          <InsightCard icon={GraduationCap} title="Degree Progress" bud={data.hasCredits ? `You've completed ${data.creditsCompleted} of ${data.totalCredits} required credits.` : `You've completed ${data.completedCourses} of ${data.totalCourses} enrolled courses.`}>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: data.degreePct }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={20} fill="hsl(26 100% 50%)" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[18px] font-bold text-foreground">{data.degreePct}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{data.hasCredits ? "Credits Completed" : "Courses Completed"}</span>
                  <span className="font-bold text-foreground">{data.hasCredits ? `${data.creditsCompleted}/${data.totalCredits}` : `${data.completedCourses}/${data.totalCourses}`}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{data.hasCredits ? "Credits Remaining" : "Courses Remaining"}</span>
                  <span className="font-bold text-foreground">{data.hasCredits ? data.totalCredits - data.creditsCompleted : data.totalCourses - data.completedCourses}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Graduation Progress</span>
                  <span className="font-bold text-primary">{data.degreePct}%</span>
                </div>
              </div>
            </div>
          </InsightCard>
        )}

        {/* Class Reminder System */}
        <ClassReminderSystem />

        {/* Calendar Sync shortcut */}
        <button
          onClick={() => navigate("/settings/calendar-sync")}
          className="w-full flex items-center gap-2.5 p-3 rounded-[16px] bg-card text-left active:scale-[0.98] transition-transform"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-bold text-foreground">Calendar Sync</p>
            <p className="text-[10px] text-muted-foreground">Connect Google, Outlook & Apple calendars</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
        </button>

        {/* Study Streak Intelligence */}
        <StudyStreakIntelligence sessions={sessions} />

        {/* Weekly Study Hours */}
        {data.totalWeeklyHours > 0 && (
          <InsightCard icon={Clock} title="Weekly Study Hours" bud={`You studied ${data.totalWeeklyHours.toFixed(1)} hours this week.`}>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data.weeklyStudyHours} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Bar dataKey="hours" fill="hsl(21 45% 20%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </InsightCard>
        )}

        {/* Monthly Academic Progress */}
        {data.monthlyProgress.some((m) => m.hours > 0) && (
          <InsightCard icon={TrendingUp} title="Monthly Progress" bud="Your study consistency over the last 6 months.">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data.monthlyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Line type="monotone" dataKey="hours" stroke="hsl(26 100% 50%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(26 100% 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </InsightCard>
        )}

        {/* Assignment Completion Rate */}
        {data.totalAssignments > 0 && (
          <InsightCard icon={CheckCircle} title="Assignment Completion" bud={`You've submitted ${data.submittedAssignments} of ${data.totalAssignments} assignments.`}>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: data.assignmentRate }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={20} fill="hsl(142 71% 45%)" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] font-bold text-foreground">{data.assignmentRate}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-bold text-foreground">{data.submittedAssignments}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">{data.totalAssignments}</span>
                </div>
                <button onClick={() => navigate("/assignments")} className="text-[11px] font-bold text-primary mt-1">View Assignments →</button>
              </div>
            </div>
          </InsightCard>
        )}

        {/* Attendance Trend */}
        {data.attendanceTrend.length > 0 && (
          <InsightCard icon={CheckCircle} title="Attendance Trend" bud={`Your attendance rate is ${data.attendanceRate}%.`}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data.attendanceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Area type="monotone" dataKey="rate" stroke="hsl(142 71% 45%)" strokeWidth={2.5} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </InsightCard>
        )}

        {/* Academic Goals */}
        {(goals?.length || 0) > 0 && (
          <InsightCard icon={Target} title="Academic Goals" bud="Track your academic targets here.">
            <div className="space-y-2.5">
              {goals.slice(0, 5).map((g) => {
                const pct = g.target_value > 0 ? Math.min(100, Math.round((g.current_value / g.target_value) * 100)) : 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12px] font-bold text-foreground">{g.title}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </InsightCard>
        )}

        {/* Upcoming Milestones */}
        {(milestones?.length || 0) > 0 && (
          <InsightCard icon={CalendarClock} title="Upcoming Milestones" bud="Your key academic milestones ahead.">
            <div className="space-y-2">
              {milestones.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-muted/50">
                  <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CalendarClock className="w-4 h-4 text-primary" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">{m.title}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDateShort(m.target_date || m.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </InsightCard>
        )}
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, bud, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[20px] bg-card p-4"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        </div>
        <h3 className="text-[14px] font-bold text-foreground tracking-tight">{title}</h3>
      </div>
      {bud && <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">{bud}</p>}
      {children}
    </motion.div>
  );
}