import React from "react";
import { base44 } from "@/api/base44Client";
import HomeHeader from "@/components/home/HomeHeader";
import StudyStreakCard from "@/components/home/StudyStreakCard";
import GPASummaryCard from "@/components/home/GPASummaryCard";
import TodayScheduleCard from "@/components/home/TodayScheduleCard";
import DeadlinesCard from "@/components/home/DeadlinesCard";
import QuickActionsRow from "@/components/home/QuickActionsRow";
import BudRecommendation from "@/components/home/BudRecommendation";
import AnnouncementsCard from "@/components/home/AnnouncementsCard";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  return (
    <div className="min-h-screen">
      <HomeHeader user={user} />
      <div className="px-4 space-y-5 pb-8">
        {/* Zone 1: Context & Status */}
        <div className="grid grid-cols-2 gap-2.5">
          <StudyStreakCard />
          <GPASummaryCard />
        </div>

        {/* Quick Actions */}
        <QuickActionsRow />

        {/* Zone 2: Primary Content */}
        <BudRecommendation />
        <TodayScheduleCard />
        <DeadlinesCard />

        {/* Zone 3: Supporting */}
        <AnnouncementsCard />
      </div>
    </div>
  );
}