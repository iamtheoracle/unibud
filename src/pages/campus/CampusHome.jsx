import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookOpen, ClipboardCheck, Compass, FlaskConical, Briefcase, Library,
  Award, ChevronRight,
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
 * Editorial flow: greeting → brief → pulse → domains → classes → focus → opportunities.
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
        transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
        className="mb-7"
      >
        <p className="text-[13px] text-muted-foreground font-medium">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-0.5">{firstName}</h1>
        <p className="text-[12px] text-muted-foreground/70 mt-1.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Today Brief */}
      <TodayBrief brief={brief} loading={loading} />

      {/* Academic Pulse */}
      <div className="mt-6">
        <AcademicPulse />
      </div>

      {/* Domain navigation — divider-based list */}
      <section className="mt-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Campus</span>
        <div className="divide-y divide-border border-t border-b border-border">
          {DOMAINS.map((d) => {
            const Icon = d.icon;
            return (
              <Link key={d.label} to={d.to} className="flex items-center gap-3 py-4 spring-tap group">
                <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground">{d.label}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{d.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Today's classes */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Classes</span>
          <Link to="/timetable" className="text-[12px] font-medium text-primary flex items-center gap-0.5 spring-tap">
            Timetable <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="h-12 rounded-lg shimmer" />
        ) : today && today.length > 0 ? (
          <div className="divide-y divide-border border-t border-b border-border">
            {today.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-4">
                <p className="text-[13px] font-semibold text-foreground tabular-nums w-14 shrink-0">{s.start}</p>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground truncate">{s.code}</p>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">{s.title} · {s.room}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-5 border-t border-b border-border">
            <p className="text-[14px] text-muted-foreground">No classes scheduled today — a great day for deep work.</p>
          </div>
        )}
      </section>

      {/* Focus recommendations */}
      {recommended.length > 0 && (
        <section className="mt-10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Focus For You</span>
          <div className="divide-y divide-border border-t border-b border-border">
            {recommended.map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.key} to={c.to} className="flex items-center gap-3 py-4 spring-tap group">
                  <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-foreground">{c.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 truncate">{c.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Opportunities */}
      <section className="mt-10 mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Opportunities</span>
        <div className="divide-y divide-border border-t border-b border-border">
          {OPPS.map((o) => {
            const Icon = o.icon;
            return (
              <Link key={o.label} to={o.to} className="flex items-center gap-3 py-4 spring-tap group">
                <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
                <span className="text-[15px] font-medium text-foreground flex-1">{o.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
              </Link>
            );
          })}
        </div>
      </section>
    </CampusShell>
  );
}