import React from "react";
import { useUnibudContext } from "@/lib/UnibudContext";
import { useExperience } from "@/lib/ExperienceContext";
import { orchestrateHome } from "@/lib/bud/homeOrchestrator";
import HomeHeader from "@/components/home/HomeHeader";
import FloatingSearch from "@/components/home/FloatingSearch";
import BudHero from "@/components/home/BudHero";
import HomeTodaySchedule from "@/components/home/HomeTodaySchedule";
import HomeAssignmentsDue from "@/components/home/HomeAssignmentsDue";
import HomeSparkActivity from "@/components/home/HomeSparkActivity";
import HomeUniversityNotifs from "@/components/home/HomeUniversityNotifs";
import HomeCampusPulse from "@/components/home/HomeCampusPulse";
import QuickActions from "@/components/home/QuickActions";
import HomeWeatherCompact from "@/components/home/HomeWeatherCompact";
import RecastCard from "@/components/recast/RecastCard";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { queryClientInstance } from "@/lib/query-client";

/**
 * Home (Campus) — the AI-powered University Operating System entry point.
 *
 * Fixed priority reflects the UNIBUD ecosystem:
 *   1. Bud AI            5. University Notifications
 *   2. Today's Schedule   6. Campus Pulse
 *   3. Assignments Due   7. Quick Actions
 *   4. Spark Team Activity 8. Weather (compact)
 */
export default function Home() {
  const ctx = useUnibudContext();
  const { mode } = useExperience();
  const plan = orchestrateHome({ ...ctx, experienceMode: mode });

  const refreshHome = async () => {
    await queryClientInstance.invalidateQueries();
  };

  return (
    <PullToRefresh onRefresh={refreshHome}>
      <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-36 safe-area-pt">
        {/* Greeting */}
        <HomeHeader user={ctx.user} greeting={plan.greeting} />

        {/* Search — the heart of the OS */}
        <div className="mt-6">
          <FloatingSearch />
        </div>

        {/* Bud — conversational AI entry */}
        <div className="mt-8">
          <BudHero message={plan.message} />
        </div>

        {/* ── Contextual Content ── */}
        <div className="h-px bg-border/40 mt-8" />

        {/* Today's Schedule */}
        <div className="mt-6">
          <HomeTodaySchedule nextLecture={ctx.nextLecture} nextLectureIn={ctx.nextLectureIn} />
        </div>

        <div className="h-px bg-border/40 mt-6" />

        {/* Assignments Due */}
        <div className="mt-6">
          <HomeAssignmentsDue assignments={ctx.assignments} />
        </div>

        <div className="h-px bg-border/40 mt-6" />

        {/* Spark Team Activity */}
        <div className="mt-6">
          <HomeSparkActivity />
        </div>

        <div className="h-px bg-border/40 mt-6" />

        {/* University Notifications */}
        <div className="mt-6">
          <HomeUniversityNotifs />
        </div>

        <div className="h-px bg-border/40 mt-6" />

        {/* Campus Pulse */}
        <div className="mt-6">
          <HomeCampusPulse quadPosts={ctx.quadPosts} />
        </div>

        <div className="h-px bg-border/40 mt-6" />

        {/* Quick Actions */}
        <div className="mt-6">
          <QuickActions />
        </div>

        {/* Bud Recast */}
        <RecastCard />

        <div className="h-px bg-border/40 mt-6" />

        {/* Weather (compact) */}
        <div className="mt-6">
          <HomeWeatherCompact />
        </div>
      </div>
    </PullToRefresh>
  );
}