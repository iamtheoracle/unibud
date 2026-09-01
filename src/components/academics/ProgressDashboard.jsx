import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  TrendingUp, TrendingDown, Flame, Clock, Brain,
  GraduationCap, CheckCircle2, HelpCircle, BookOpen, Award, Sparkles,
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
  { day: "Mon", hours: 4.5 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 5.5 },
  { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 6 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 3.5 },
];

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function ProgressDashboard() {
  const navigate = useNavigate();

  const { data: budInsight, isLoading: insightLoading } = useQuery({
    queryKey: ["budAcademicInsight"],
    queryFn: () =>
      base44.integrations.Core.InvokeLLM({
        prompt:
          "You are Bud, a supportive student mentor at a university. The student's quiz performance dropped from 86% to 78% this week, and weekly study hours decreased from 32 to 29. CGPA is 4.20 (2nd Class Upper). In 2 short sentences, warmly explain what might be happening and suggest one simple action. Be encouraging, not preachy.",
        response_json_schema: {
          type: "object",
          properties: {
            insight: { type: "string" },
            action: { type: "string" },
          },
        },
      }),
    staleTime: 300000,
  });

  return (
    <div className="space-y-4">
      {/* CGPA Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard variant="solid" className="p-5">
          <div className="flex items-center gap-5">
            <CircularProgressRing
              value={4.2}
              max={5}
              size={96}
              strokeWidth={7}
              color="hsl(var(--primary))"
              label="4.20"
              sublabel="CGPA"
              delay={0.1}
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Academic Standing
                </span>
              </div>
              <p className="font-heading font-bold text-[15px] text-foreground">
                2nd Class Upper
              </p>
              <div className="flex items-center gap-3 mt-2.5">
                <div>
                  <p className="font-heading font-bold text-[18px] text-foreground">4.35</p>
                  <p className="text-[10px] text-muted-foreground">Semester GPA</p>
                </div>
                <div className="w-px h-8 bg-border/30" />
                <div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                    <p className="font-heading font-bold text-[18px] text-success">+0.15</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">vs last sem</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Metric Rings Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricRingCard
          icon={CheckCircle2}
          iconColor="text-info"
          ringColor="hsl(var(--unibud-blue))"
          value={92}
          label="92%"
          sublabel="Attendance"
          delay={0.15}
          trend="+3%"
          trendUp
        />
        <MetricRingCard
          icon={BookOpen}
          iconColor="text-success"
          ringColor="hsl(var(--unibud-green))"
          value={88}
          label="88%"
          sublabel="Assignments"
          delay={0.2}
          trend="+5%"
          trendUp
        />
        <MetricRingCard
          icon={HelpCircle}
          iconColor="text-warning"
          ringColor="hsl(var(--unibud-orange))"
          value={78}
          label="78%"
          sublabel="Quizzes"
          delay={0.25}
          trend="-8%"
          trendUp={false}
        />
        <MetricRingCard
          icon={BookOpen}
          iconColor="text-purple"
          ringColor="hsl(var(--unibud-purple))"
          value={61}
          label="61%"
          sublabel="Course Progress"
          delay={0.3}
          trend="+12%"
          trendUp
        />
      </div>

      {/* Credits */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard variant="solid" className="p-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-[12px] font-semibold text-foreground">Credits</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground">68</span> / 120 completed
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "57%" }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">52 credits remaining to graduate</p>
        </GlassCard>
      </motion.div>

      {/* GPA Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard variant="solid" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-[12px] font-semibold text-foreground">GPA Trend</span>
            </div>
            <span className="text-[10px] text-muted-foreground">6 semesters</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={gpaTrend} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
              <defs>
                <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="semester" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="gpa" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#gpaGrad)" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>

      {/* Study Hours + Streak */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard variant="solid" className="p-4 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-info" />
              <span className="text-[11px] font-semibold text-foreground">Study Hours</span>
            </div>
            <p className="font-heading font-bold text-[22px] text-foreground">29h</p>
            <p className="text-[10px] text-muted-foreground mb-2">this week</p>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={weeklyStudyHours} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Bar dataKey="hours" fill="hsl(var(--unibud-blue))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard variant="solid" className="p-4 h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-[20px] bg-warning/10 flex items-center justify-center mb-2">
              <Flame className="w-7 h-7 text-warning" />
            </div>
            <p className="font-heading font-bold text-[22px] text-foreground">12</p>
            <p className="text-[10px] text-muted-foreground">day streak</p>
            <div className="flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3 h-3 text-success" />
              <span className="text-[10px] font-semibold text-success">Personal best!</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Bud Insight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard variant="solid" className="p-4 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-heading font-semibold text-[12px] text-foreground">Bud's Insight</span>
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
              </div>
              {insightLoading ? (
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded-full shimmer" />
                  <div className="h-2.5 w-4/5 rounded-full shimmer" />
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {budInsight?.insight || "Your quiz performance dipped 8% this week. A short review session could help you bounce back."}
                  </p>
                  {budInsight?.action && (
                    <p className="text-[11px] text-primary font-medium mt-1.5">→ {budInsight.action}</p>
                  )}
                  <button
                    onClick={() => navigate("/bud")}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask Bud for a study plan
                  </button>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function MetricRingCard({ icon: Icon, iconColor, ringColor, value, label, sublabel, delay, trend, trendUp }) {
  return (
    <GlassCard variant="solid" className="p-3.5 flex flex-col items-center">
      <div className="flex items-center gap-1.5 mb-2 self-start">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-[10px] font-semibold text-muted-foreground">{sublabel}</span>
      </div>
      <CircularProgressRing
        value={value}
        size={72}
        strokeWidth={5}
        color={ringColor}
        label={label}
        delay={delay}
      />
      <div className="flex items-center gap-1 mt-2">
        {trendUp ? (
          <TrendingUp className="w-3 h-3 text-success" />
        ) : (
          <TrendingDown className="w-3 h-3 text-destructive" />
        )}
        <span className={`text-[10px] font-semibold ${trendUp ? "text-success" : "text-destructive"}`}>
          {trend}
        </span>
      </div>
    </GlassCard>
  );
}