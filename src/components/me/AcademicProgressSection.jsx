import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, TrendingDown, Flame, Clock, Brain, GraduationCap,
  CheckCircle2, HelpCircle, BookOpen, Award, Sparkles, ChevronRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import GlassCard from "@/components/ui/GlassCard";
import CircularProgressRing from "@/components/academics/CircularProgressRing";

const gpaTrend = [
  { semester: "100·1", gpa: 3.8 },
  { semester: "100·2", gpa: 3.9 },
  { semester: "200·1", gpa: 4.1 },
  { semester: "200·2", gpa: 4.0 },
  { semester: "300·1", gpa: 4.2 },
  { semester: "300·2", gpa: 4.35 },
];

const weeklyStudyHours = [
  { day: "Mon", hours: 4.5 }, { day: "Tue", hours: 3 },
  { day: "Wed", hours: 5.5 }, { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 6 }, { day: "Sat", hours: 4 }, { day: "Sun", hours: 3.5 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function AcademicProgressSection() {
  const navigate = useNavigate();

  const { data: budInsight, isLoading } = useQuery({
    queryKey: ["budMeInsight"],
    queryFn: () =>
      base44.integrations.Core.InvokeLLM({
        prompt: "You are Bud, a supportive mentor. A CS 300-level student has CGPA 4.20 (2nd Class Upper), 12-day study streak, 92% attendance but quiz performance dropped 8% this week. In 2 warm sentences, acknowledge their progress and suggest one small action. Be encouraging.",
        response_json_schema: { type: "object", properties: { insight: { type: "string" }, action: { type: "string" } } },
      }),
    staleTime: 300000,
  });

  return (
    <div className="space-y-4">
      {/* Profile completion + CGPA */}
      <GlassCard variant="solid" className="p-4" delay={0.05}>
        <div className="flex items-center gap-4">
          <CircularProgressRing value={85} size={72} strokeWidth={6} color="hsl(var(--unibud-green))" label="85%" delay={0.1} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-success" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Profile Completion</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Complete your portfolio to reach 100%</p>
            <button onClick={() => navigate("/student-profile")} className="mt-1.5 text-[11px] font-semibold text-primary flex items-center gap-0.5">
              Complete profile <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* CGPA + Semester */}
      <GlassCard variant="solid" className="p-5" delay={0.1}>
        <div className="flex items-center gap-5">
          <CircularProgressRing value={4.2} max={5} size={88} strokeWidth={7} color="hsl(var(--primary))" label="4.20" sublabel="CGPA" delay={0.15} />
          <div className="flex-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold mb-1.5">2nd Class Upper</span>
            <div className="flex items-center gap-3">
              <div>
                <p className="font-heading font-bold text-[16px] text-foreground">4.35</p>
                <p className="text-[9px] text-muted-foreground">Semester GPA</p>
              </div>
              <div className="w-px h-7 bg-border/30" />
              <div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <p className="font-heading font-bold text-[16px] text-success">+0.15</p>
                </div>
                <p className="text-[9px] text-muted-foreground">vs last sem</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Metric rings grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricRing icon={CheckCircle2} color="text-info" ring="hsl(var(--unibud-blue))" value={92} label="92%" sub="Attendance" trend="+3%" up delay={0.2} />
        <MetricRing icon={BookOpen} color="text-success" ring="hsl(var(--unibud-green))" value={88} label="88%" sub="Assignments" trend="+5%" up delay={0.25} />
        <MetricRing icon={HelpCircle} color="text-warning" ring="hsl(var(--unibud-orange))" value={78} label="78%" sub="Quizzes" trend="-8%" up={false} delay={0.3} />
        <MetricRing icon={BookOpen} color="text-purple" ring="hsl(var(--unibud-purple))" value={61} label="61%" sub="Courses" trend="+12%" up delay={0.35} />
      </div>

      {/* Credits */}
      <GlassCard variant="solid" className="p-4" delay={0.4}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">Credits</span>
          </div>
          <span className="text-[11px] text-muted-foreground"><span className="font-bold text-foreground">68</span> / 120</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: "57%" }} transition={{ duration: 1, delay: 0.45 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">52 credits remaining to graduate</p>
      </GlassCard>

      {/* GPA trend */}
      <GlassCard variant="solid" className="p-4" delay={0.45}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-foreground">GPA Trend</span>
          </div>
          <span className="text-[10px] text-muted-foreground">6 semesters</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={gpaTrend} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
            <defs>
              <linearGradient id="meGpaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#meGpaGrad)" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Study hours + Streak */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard variant="solid" className="p-4" delay={0.5}>
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-3.5 h-3.5 text-info" />
            <span className="text-[11px] font-semibold text-foreground">Study Hours</span>
          </div>
          <p className="font-heading font-bold text-[20px] text-foreground">29h</p>
          <p className="text-[9px] text-muted-foreground mb-1.5">this week</p>
          <ResponsiveContainer width="100%" height={50}>
            <BarChart data={weeklyStudyHours} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Bar dataKey="hours" fill="hsl(var(--unibud-blue))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard variant="solid" className="p-4 flex flex-col items-center justify-center text-center" delay={0.55}>
          <div className="w-12 h-12 rounded-[18px] bg-warning/10 flex items-center justify-center mb-1.5">
            <Flame className="w-6 h-6 text-warning" />
          </div>
          <p className="font-heading font-bold text-[20px] text-foreground">12</p>
          <p className="text-[9px] text-muted-foreground">day streak</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-[9px] font-semibold text-success">Best!</span>
          </div>
        </GlassCard>
      </div>

      {/* Bud Insight */}
      <GlassCard variant="solid" className="p-4 border-primary/20" delay={0.6}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[13px] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-heading font-semibold text-[12px] text-foreground">Bud's Learning Insight</span>
            </div>
            {isLoading ? (
              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full shimmer" />
                <div className="h-2.5 w-4/5 rounded-full shimmer" />
              </div>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{budInsight?.insight || "You're progressing well. Keep your streak alive!"}</p>
                {budInsight?.action && <p className="text-[11px] text-primary font-medium mt-1">→ {budInsight.action}</p>}
                <button onClick={() => navigate("/bud")} className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">
                  <Sparkles className="w-3 h-3" /> Ask Bud
                </button>
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function MetricRing({ icon: Icon, color, ring, value, label, sub, trend, up, delay }) {
  return (
    <GlassCard variant="solid" className="p-3 flex flex-col items-center" delay={delay}>
      <div className="flex items-center gap-1.5 mb-1.5 self-start">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[9px] font-semibold text-muted-foreground">{sub}</span>
      </div>
      <CircularProgressRing value={value} size={64} strokeWidth={5} color={ring} label={label} delay={delay} />
      <div className="flex items-center gap-1 mt-1.5">
        {up ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
        <span className={`text-[9px] font-semibold ${up ? "text-success" : "text-destructive"}`}>{trend}</span>
      </div>
    </GlassCard>
  );
}