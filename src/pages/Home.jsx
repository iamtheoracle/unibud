import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnibudContext } from "@/lib/UnibudContext";
import { orchestrateHome } from "@/lib/bud/homeOrchestrator";
import HomeHeader from "@/components/home/HomeHeader";
import FloatingSearch from "@/components/home/FloatingSearch";
import BudContextBar from "@/components/home/BudContextBar";
import TodayCard from "@/components/home/TodayCard";
import QuickActions from "@/components/home/QuickActions";
import AcademicSnapshot from "@/components/home/AcademicSnapshot";
import UpcomingDeadlines from "@/components/home/UpcomingDeadlines";
import BudCard from "@/components/home/BudCard";
import WeatherWidget from "@/components/weather/WeatherWidget";
import HeroAcademicCard from "@/components/unibud/HeroAcademicCard";
import LivingBudCard from "@/components/unibud/LivingBudCard";
import AcademicPulseWidget from "@/components/unibud/AcademicPulseWidget";
import HomeMessages from "@/components/home/HomeMessages";
import HomePayments from "@/components/home/HomePayments";
import HomeCommunity from "@/components/home/HomeCommunity";
import PullToRefresh from "@/components/ui/PullToRefresh";
import ToolRecommendationStrip from "@/components/spark/ToolRecommendationStrip";
import { queryClientInstance } from "@/lib/query-client";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Home (Campus) — Bud's adaptive dashboard.
 * Bud observes context, predicts needs, and proactively rearranges
 * the widget order. The layout is never static.
 */
export default function Home() {
  const ctx = useUnibudContext();
  const plan = orchestrateHome(ctx);

  const refreshHome = async () => {
    await queryClientInstance.invalidateQueries();
  };

  const widgets = {
    weather: <WeatherWidget />,
    today: <HeroAcademicCard courses={ctx.courses} assignments={ctx.assignments} exams={ctx.exams} sessions={ctx.sessions} />,
    quickActions: <QuickActions />,
    academics: (
      <div className="space-y-4">
        <AcademicSnapshot user={ctx.user} sessions={ctx.sessions} />
        <AcademicPulseWidget sessions={ctx.sessions} />
      </div>
    ),
    deadlines: <UpcomingDeadlines assignments={ctx.assignments} exams={ctx.exams} />,
    bud: <LivingBudCard message={plan.message} label={plan.label} />,
    messages: <HomeMessages count={ctx.unreadMessages} total={ctx.conversations?.length || 0} />,
    payments: <HomePayments count={ctx.upcomingPayments} overdue={ctx.overdueFees} fees={ctx.pendingFees} />,
    community: <HomeCommunity count={ctx.communityActivity} posts={ctx.quadPosts} />,
  };

  return (
    <PullToRefresh onRefresh={refreshHome}>
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <HomeHeader user={ctx.user} greeting={plan.greeting} />
      <div className="mt-4">
        <FloatingSearch />
      </div>
      <div className="mt-5">
        <BudContextBar label={plan.label} message={plan.message} />
      </div>
      <div className="mt-4">
        <ToolRecommendationStrip
          surface="home"
          context={{
            deadline: ctx.assignments?.[0]?.due_date || ctx.exams?.[0]?.date,
            assignmentType: ctx.assignments?.[0]?.type,
            text: ctx.assignments?.[0]?.title,
            recentItemTypes: ctx.sessions?.length ? ["note"] : [],
          }}
        />
      </div>
      <AnimatePresence mode="popLayout">
        {plan.order.map((k, i) => (
          <motion.div
            key={k}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE, delay: i * 0.03 }}
            className="mt-5"
          >
            {widgets[k]}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  );
}