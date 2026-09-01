import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, Clock, GraduationCap, CheckCircle2, BookOpen, Award,
  Brain, Sparkles, Target, Flame, Zap, AlertCircle,
} from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function AnalyticsDashboard() {
  const { data: grades } = useQuery({ queryKey: ["grades"], queryFn: () => base44.entities.Grade.list("-date", 100) });
  const { data: sessions } = useQuery({ queryKey: ["studySessions"], queryFn: () => base44.entities.StudySession.list("-session_date", 50) });
  const { data: exams } = useQuery({ queryKey: ["upcomingExams"], queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }) });

  const { data: prediction } = useQuery({
    queryKey: ["budPerformancePrediction"],
    queryFn: () => base44.integrations.Core.InvokeLLM({
      prompt: "You are Bud, a data-driven academic mentor. A CS 300-level student has CGPA 4.20, study hours declining slightly (32→29/week), quiz scores at 78%. Predict their end-of-semester performance and give 2 actionable recommendations. Be specific and encouraging.",
      response_json_schema: {
        type: "object",
        properties: {
          predicted_cgpa: { type: "number" },
          confidence: { type: "string" },
          recommendation_1: { type: "string" },
          recommendation_2: { type: "string" },
          risk_level: { type: "string" },
        },
      },
    }),
    staleTime: 600000,
  });

  const gpaTrend = [
    { sem: "100·1", gpa: 3.8 }, { sem: "100·2", gpa: 3.9 },
    { sem: "200·1", gpa: 4.1 }, { sem: "200·2", gpa: 4.0 },
    { sem: "300·1", gpa: 4.2 }, { sem: "300·2", gpa: 4.35 },
  ];

  const weeklyStudy = [
    { day: "Mon", hours: 4.5 }, { day: "Tue", hours: 3 },
    { day: "Wed", hours: 5.5 }, { day: "Thu", hours: 2.5 },
    { day: "Fri", hours: 6 }, { day: "Sat", hours: 4 }, { day: "Sun", hours: 3.5 },
  ];

  const courseProgress = [
    { course: "CSC 301", progress: 68 }, { course: "MTH 201", progress: 45 },
    { course: "PHY 203", progress: 72 }, { course: "CSC 305", progress: 30 },
    { course: "ENG 201", progress: 90 },
  ];

  const performanceRadar = [
    { metric: "Assignments", value: 88 },
    { metric: "Quizzes", value: 78 },
    { metric: "Attendance", value: 92 },
    { metric: "Labs", value: 85 },
    { metric: "Projects", value: 91 },
    { metric: "Exams", value: 82 },
  ];

  const heatmapData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    hours: [4.5, 3, 5.5, 2.5, 6, 4, 3.5][i],
  }));

  const totalSessions = sessions?.length || 0;
  const totalHours = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
  const avgProductivity = totalSessions > 0
    ? Math.round((sessions || []).reduce((sum, s) => sum + (s.productivity_score || 0), 0) / totalSessions)
    : 75;

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <GlassCard variant="solid" className="p-5">
          <div className="flex items-center gap-5">
            <CircularProgressRing value={4.2} max={5} size={100} strokeWidth={8} color="hsl(var(--primary))" label="4.20" sublabel="CGPA" delay={0.1} />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Academic Standing</span>
              </div>
              <p className="font-heading font-bold text-[16px] text-foreground">2nd Class Upper Division</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <p className="font-heading font-bold text-[16px] text-foreground">4.35</p>
                  <p className="text-[9px] text-muted-foreground">Sem GPA</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <p className="font-heading font-bold text-[16px] text-success">+0.15</p>
                  </div>
                  <p className="text-[9px] text-muted-foreground">Trend</p>
                </div>
                <div>
                  <p className="font-heading font-bold text-[16px] text-foreground">68/120</p>
                  <p className="text-[9px] text-muted-foreground">Credits</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: CheckCircle2, label: "Attendance", value: "92%", color: "hsl(var(--unibud-blue))", ringColor: "hsl(var(--unibud-blue))", pct: 92, delay: 0.15 },
          { icon: BookOpen, label: "Assignments", value: "88%", color: "hsl(var(--unibud-green))", ringColor: "hsl(var(--unibud-green))", pct: 88, delay: 0.2 },
          { icon: Brain, label: "Quizzes", value: "78%", color: "hsl(var(--unibud-orange))", ringColor: "hsl(var(--unibud-orange))", pct: 78, delay: 0.25 },
          { icon: Clock, label: "Course Avg", value: "61%", color: "hsl(var(--unibud-purple))", ringColor: "hsl(var(--unibud-purple))", pct: 61, delay: 0.3 },
        ].map((m, i) => (
          <GlassCard key={i} variant="solid" className="p-3.5 flex flex-col items-center" delay={m.delay}>
            <div className="flex items-center gap-1.5 mb-2 self-start">
              <m.icon className={`w-3.5 h-3.5`} style={{ color: m.color }} />
              <span className="text-[10px] font-semibold text-muted-foreground">{m.label}</span>
            </div>
            <CircularProgressRing value={m.pct} size={72} strokeWidth={5} color={m.ringColor} label={m.value} delay={m.delay} />
          </GlassCard>
        ))}
      </div>

      <GlassCard variant="solid" className="p-4" delay={0.35}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">GPA Trend</span>
          </div>
          <span className="text-[10px] text-muted-foreground">6 semesters</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={gpaTrend} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="analyticsGpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
            <XAxis dataKey="sem" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis domain={[3, 5]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#analyticsGpa)" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard variant="solid" className="p-4" delay={0.4}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-info" />
            <span className="text-[11px] font-semibold text-foreground">Study Hours</span>
          </div>
          <p className="font-heading font-bold text-[20px] text-foreground">{totalHours.toFixed(1)}h</p>
          <p className="text-[9px] text-muted-foreground mb-2">total logged</p>
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={weeklyStudy} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="hours" fill="hsl(var(--unibud-blue))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard variant="solid" className="p-4 flex flex-col items-center justify-center text-center" delay={0.45}>
          <div className="w-12 h-12 rounded-[18px] bg-warning/10 flex items-center justify-center mb-1.5">
            <Flame className="w-6 h-6 text-warning" />
          </div>
          <p className="font-heading font-bold text-[20px] text-foreground">12</p>
          <p className="text-[9px] text-muted-foreground">day streak</p>
          <div className="flex items-center gap-1 mt-1">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-semibold text-primary">{avgProductivity} avg</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="solid" className="p-4" delay={0.5}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Course Progress</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={courseProgress} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="course" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={50} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard variant="solid" className="p-4" delay={0.55}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Performance Map</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={performanceRadar}>
            <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
            <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </GlassCard>

      <GlassCard variant="solid" className="p-4 border-primary/20" delay={0.6}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-heading font-semibold text-[12px] text-foreground">Bud's Performance Prediction</span>
              {prediction?.risk_level === "high" && <AlertCircle className="w-3 h-3 text-error" />}
            </div>
            {prediction ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-heading font-bold text-[16px] text-primary">{prediction.predicted_cgpa?.toFixed(2)}</span>
                  <span className="text-[10px] text-muted-foreground">predicted CGPA · {prediction.confidence}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-1">→ {prediction.recommendation_1}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">→ {prediction.recommendation_2}</p>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full shimmer" />
                <div className="h-2.5 w-4/5 rounded-full shimmer" />
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard variant="solid" className="p-3.5 text-center" delay={0.65}>
          <Award className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="font-heading font-bold text-[16px] text-foreground">{exams?.length || 0}</p>
          <p className="text-[9px] text-muted-foreground">Upcoming Exams</p>
        </GlassCard>
        <GlassCard variant="solid" className="p-3.5 text-center" delay={0.7}>
          <Clock className="w-5 h-5 text-info mx-auto mb-1" />
          <p className="font-heading font-bold text-[16px] text-foreground">{totalSessions}</p>
          <p className="text-[9px] text-muted-foreground">Study Sessions</p>
        </GlassCard>
      </div>
    </div>
  );
}