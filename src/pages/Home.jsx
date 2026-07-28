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
      <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
        <HomeHeader user={ctx.user} greeting={plan.greeting} />

        <div className="mt-4">
          <FloatingSearch />
        </div>

        {/* 1 — Bud AI */}
        <div className="mt-5">
          <BudHero message={plan.message} />
        </div>

        {/* 2 — Today's Schedule */}
        <div className="mt-4">
          <HomeTodaySchedule nextLecture={ctx.nextLecture} nextLectureIn={ctx.nextLectureIn} />
        </div>

        {/* 3 — Assignments Due */}
        <div className="mt-4">
          <HomeAssignmentsDue assignments={ctx.assignments} />
        </div>

        {/* 4 — Spark Team Activity */}
        <div className="mt-4">
          <HomeSparkActivity />
        </div>

        {/* 5 — University Notifications */}
        <div className="mt-4">
          <HomeUniversityNotifs />
        </div>

        {/* 6 — Campus Pulse */}
        <div className="mt-4">
          <HomeCampusPulse quadPosts={ctx.quadPosts} />
        </div>

        {/* 7 — Quick Actions */}
        <div className="mt-4">
          <QuickActions />
        </div>

        {/* 8 — Weather (compact) */}
        <div className="mt-4">
          <HomeWeatherCompact />
        </div>
      </div>
    </PullToRefresh>
  );
}