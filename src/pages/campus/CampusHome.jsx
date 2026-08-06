import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, BookOpen, ClipboardList, FileText, FolderKanban, GraduationCap, FlaskConical, BarChart3 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAcademicData } from "@/lib/academic/useAcademicData";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import {
  AcademicSummary, UpcomingClasses, AssignmentsDue,
  DepartmentAnnouncements, ResearchOpportunities,
  CampusScholarships, CourseDiscussions, DepartmentHighlights,
} from "@/components/campus/AcademicFeedModules";
import { useCampusPlatformCore } from "@/lib/os/useCampusPlatformCore";

const NAV_CHIPS = [
  { label: "Courses", to: "/courses", icon: BookOpen },
  { label: "Assignments", to: "/assignments", icon: ClipboardList },
  { label: "Exams", to: "/exams", icon: FileText },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Study", to: "/study", icon: GraduationCap },
  { label: "Research", to: "/research", icon: FlaskConical },
  { label: "GPA", to: "/gpa-calculator", icon: BarChart3 },
];

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
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { nextClass, nextDeadline, gpa, today, loading } = useAcademicData();
  const { setOpen: setBudOpen } = useBudLauncher();
  const { orderedSections } = useCampusPlatformCore();

  const firstName = (user?.full_name || "Scholar").split(" ")[0];

  // Context-prioritized section renderer — sections are ordered by the
  // ContextProvider based on the active context (academic/social/hybrid).
  // Academic context: timetable, assignments, research, scholarships first.
  // Navigation is never changed — only module priority shifts.
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case "academic-summary":
        return <AcademicSummary nextClass={nextClass} nextDeadline={nextDeadline} gpa={gpa} loading={loading} />;
      case "announcements":
        return <DepartmentAnnouncements />;
      case "upcoming-classes":
        return <UpcomingClasses classes={today} loading={loading} />;
      case "course-discussions":
        return <CourseDiscussions />;
      case "assignments-due":
        return <AssignmentsDue loading={loading} />;
      case "research-opportunities":
        return <ResearchOpportunities />;
      case "department-highlights":
        return <DepartmentHighlights />;
      case "campus-scholarships":
        return <CampusScholarships />;
      default:
        return null;
    }
  };

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

      {/* ── Top Navigation Chips ── */}
      <div className="sticky top-[57px] z-20 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {NAV_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <button
                key={chip.to}
                onClick={() => navigate(chip.to)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-muted/40 border border-border/40 text-[12px] font-semibold whitespace-nowrap spring-tap text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Academic Community Feed ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 relative z-10 space-y-5">
        {/* Context-prioritized Academic Community Feed */}
        {/* Sections are reordered by Platform Core based on the active context. */}
        {/* Academic: timetable, assignments, research, scholarships prioritized. */}
        {orderedSections.map((sectionId) => (
          <React.Fragment key={sectionId}>
            {renderSection(sectionId)}
          </React.Fragment>
        ))}

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </div>
  );
}