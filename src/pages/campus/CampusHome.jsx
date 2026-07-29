import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen, ClipboardCheck, Compass, FlaskConical, Briefcase, Library,
  Sparkles, ArrowRight, Award,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAcademicData } from "@/lib/academic/useAcademicData";
import { useAcademicRecommendations } from "@/hooks/useAcademicRecommendations";
import { ACADEMIC_CATEGORIES } from "@/lib/academics/registry";
import AcademicPulse from "@/components/academic/AcademicPulse";
import CampusShell from "@/components/campus/CampusShell";
import TodayBrief, { composeBrief } from "@/components/campus/TodayBrief";

const DOMAINS = [
  { label: "Learn", desc: "Courses & materials", to: "/courses", icon: BookOpen },
  { label: "Assess", desc: "Exams & assignments", to: "/exams", icon: ClipboardCheck },
  { label: "Plan", desc: "Agenda & timeline", to: "/agenda", icon: Compass },
  { label: "Research", desc: "Projects & papers", to: "/research", icon: FlaskConical },
  { label: "Career", desc: "Opportunities", to: "/career", icon: Briefcase },
  { label: "Library", desc: "Knowledge hub", to: "/knowledge", icon: Library },
];

const OPPS = [
  { label: "Scholarships", to: "/scholarships", icon: Award },
  { label: "Internships", to: "/opportunities", icon: Briefcase },
  { label: "Research", to: "/research", icon: FlaskConical },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * CampusHome — the Today Brief. The intelligent front door to Campus.
 * Answers, in order: what needs attention today → deadlines → classes →
 * recommendations → progress → opportunities. Calm, focused, distraction-free.
 */
export default function CampusHome() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { nextClass, nextDeadline, gpa, today, loading } = useAcademicData();
  const recs = useAcademicRecommendations();
  const brief = composeBrief(nextClass, nextDeadline, gpa, today);

  const firstName = (user?.full_name || "Scholar").split(" ")[0];
  const recommended = recs.slice(0, 3).map((k) => ACADEMIC_CATEGORIES.find((c) => c.key === k)).filter(Boolean);

  return (
    <CampusShell>
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-4"
      >
        <h1 className="text-[22px] font-bold text-foreground tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          {greeting()}, <span className="text-ice-gradient">{firstName}</span>
        </h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Today Brief — the single most important card */}
      <TodayBrief brief={brief} loading={loading} />

      {/* Academic Pulse — next class / next due / GPA */}
      <div className="mt-3">
        <AcademicPulse />
      </div>

      {/* Domain navigation */}
      <section className="mt-5">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">Campus</h2>
        <div className="grid grid-cols-3 gap-2">
          {DOMAINS.map((d) => {
            const Icon = d.icon;
            return (
              <Link key={d.label} to={d.to} className="crystal-card hover-lift p-3 spring-tap edge-light">
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
                </div>
                <p className="text-[12px] font-semibold text-foreground leading-tight">{d.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{d.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Today's classes */}
      <section className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Today's classes</h2>
          <Link to="/timetable" className="text-[11px] font-semibold text-primary spring-tap">Timetable</Link>
        </div>
        {loading ? (
          <div className="crystal-card p-4 h-16 shimmer" />
        ) : today && today.length > 0 ? (
          <div className="crystal-card divide-y divide-border/15">
            {today.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 spring-tap">
                <div className="w-1 h-8 rounded-full" style={{ background: `hsl(${s.color || "217 91% 60%"} / 0.6)` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{s.code}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold text-foreground">{s.start}</p>
                  <p className="text-[10px] text-muted-foreground">{s.room}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="crystal-card p-4 text-center">
            <p className="text-[12px] text-muted-foreground">No classes scheduled today — a great day for deep work.</p>
          </div>
        )}
      </section>

      {/* Spark focus — adaptive recommendations */}
      {recommended.length > 0 && (
        <section className="mt-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Focus for you</h2>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {recommended.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} to={c.to} className="flex-shrink-0 w-[150px] crystal-card hover-lift p-3 spring-tap edge-light">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `hsl(${c.color} / 0.14)` }}>
                    <Icon className="w-4 h-4" style={{ color: `hsl(${c.color})` }} strokeWidth={2} />
                  </div>
                  <p className="text-[12px] font-semibold text-foreground leading-tight">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{c.desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Opportunities */}
      <section className="mt-5 mb-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">Opportunities</h2>
        <div className="flex gap-2">
          {OPPS.map((o) => {
            const Icon = o.icon;
            return (
              <Link key={o.label} to={o.to} className="flex-1 flex items-center gap-2 crystal-card hover-lift p-3 spring-tap edge-light">
                <Icon className="w-4 h-4 text-foreground" strokeWidth={2} />
                <span className="text-[12px] font-semibold text-foreground">{o.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </Link>
            );
          })}
        </div>
      </section>
    </CampusShell>
  );
}