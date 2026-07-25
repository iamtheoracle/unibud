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
import HomeMessages from "@/components/home/HomeMessages";
import HomePayments from "@/components/home/HomePayments";
import HomeCommunity from "@/components/home/HomeCommunity";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Home (Campus) — Bud's adaptive dashboard.
 * Bud observes context, predicts needs, and proactively rearranges
 * the widget order. The layout is never static.
 */
export default function Home() {
  const ctx = useUnibudContext();
  const plan = orchestrateHome(ctx);

  const widgets = {
    weather: <WeatherWidget />,
    today: <TodayCard courses={ctx.courses} assignments={ctx.assignments} exams={ctx.exams} />,
    quickActions: <QuickActions />,
    academics: <AcademicSnapshot user={ctx.user} sessions={ctx.sessions} />,
    deadlines: <UpcomingDeadlines assignments={ctx.assignments} exams={ctx.exams} />,
    bud: <BudCard />,
    messages: <HomeMessages count={ctx.unreadMessages} total={ctx.conversations?.length || 0} />,
    payments: <HomePayments count={ctx.upcomingPayments} overdue={ctx.overdueFees} fees={ctx.pendingFees} />,
    community: <HomeCommunity count={ctx.communityActivity} posts={ctx.quadPosts} />,
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <HomeHeader user={ctx.user} />
      <div className="mt-4">
        <FloatingSearch />
      </div>
      <div className="mt-5">
        <BudContextBar label={plan.label} message={plan.message} />
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
  );
}