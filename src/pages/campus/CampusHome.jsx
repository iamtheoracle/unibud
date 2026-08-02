import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAcademicData } from "@/lib/academic/useAcademicData";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import {
  AcademicSummary, UpcomingClasses, AssignmentsDue,
  DepartmentAnnouncements, ResearchOpportunities,
  CampusScholarships, CourseDiscussions, DepartmentHighlights,
} from "@/components/campus/AcademicFeedModules";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * CampusHome — the living academic community feed.
 * Not a dashboard. A flowing feed of academic life: summaries,
 * announcements, discussions, opportunities, and community activity.
 */
export default function CampusHome() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { nextClass, nextDeadline, gpa, today, loading } = useAcademicData();
  const { setOpen: setBudOpen } = useBudLauncher();

  const firstName = (user?.full_name || "Scholar").split(" ")[0];

  return (
    <div className="min-h-screen pb-32 safe-area-pt relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="ambient-orb absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[360px]" style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(0 0% 100% / 0.04), transparent 70%)" }} />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-muted-foreground font-medium">{greeting()},</p>
            <h1 className="text-[22px] font-bold tracking-tight text-foreground leading-tight">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/70">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <button
              onClick={() => setBudOpen(true)}
              className="w-9 h-9 rounded-full glass grid place-items-center spring-tap hover:shadow-premium transition-shadow"
              aria-label="Ask Bud"
            >
              <Sparkles className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Academic Community Feed ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 relative z-10 space-y-5">
        {/* Today's Academic Summary */}
        <AcademicSummary nextClass={nextClass} nextDeadline={nextDeadline} gpa={gpa} loading={loading} />

        {/* Announcements — the heart of the community */}
        <DepartmentAnnouncements />

        {/* Upcoming Classes */}
        <UpcomingClasses classes={today} loading={loading} />

        {/* Course Discussions — community activity */}
        <CourseDiscussions />

        {/* Assignments Due */}
        <AssignmentsDue loading={loading} />

        {/* Research Opportunities */}
        <ResearchOpportunities />

        {/* Department Highlights */}
        <DepartmentHighlights />

        {/* Scholarships */}
        <CampusScholarships />

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}