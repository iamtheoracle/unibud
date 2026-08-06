import React from "react";
import { motion } from "framer-motion";
import { queryClientInstance } from "@/lib/query-client";
import PullToRefresh from "@/components/ui/PullToRefresh";
import HomeHeader from "@/components/home/HomeHeader";
import QuickActionStrip from "@/components/home/QuickActionStrip";
import PersonalHighlights from "@/components/home/PersonalHighlights";
import PinnedSection from "@/components/home/PinnedSection";
import HomeSocialFeed from "@/components/home/HomeSocialFeed";
import DiscoverForYou from "@/components/home/DiscoverForYou";
import StudyProgressWidget from "@/components/home/StudyProgressWidget";
import ContinueStrip from "@/components/insights/ContinueStrip";
import DailyInsights from "@/components/insights/DailyInsights";
import DailyBriefing from "@/components/autonomous/DailyBriefing";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

const EASE = [0.16, 1, 0.3, 1];

function SectionLabel({ children }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: CREAM_MUTED }}>
      {children}
    </span>
  );
}

export default function Home() {
  const refreshHome = async () => {
    await queryClientInstance.invalidateQueries();
  };

  return (
    <PullToRefresh onRefresh={refreshHome}>
      <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
        {/* 1. Greeting + Search + Notifications */}
        <HomeHeader />

        {/* 2. Quick Action Strip */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
          className="mt-6"
        >
          <QuickActionStrip />
        </motion.section>

        {/* Daily AI Briefing */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.11 }}
          className="mt-6"
        >
          <DailyBriefing />
        </motion.section>

        {/* Continue where you left off */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.11 }}
          className="mt-6"
        >
          <ContinueStrip />
        </motion.section>

        {/* Study Progress Tracker */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
          className="mt-6"
        >
          <StudyProgressWidget />
        </motion.section>

        {/* Daily Insights — AI summary + analytics + trending */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
          className="mt-8"
        >
          <DailyInsights />
        </motion.section>

        {/* 3. Personal Highlights */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="mt-8"
        >
          <SectionLabel>Highlights</SectionLabel>
          <PersonalHighlights />
        </motion.section>

        {/* 4. Pinned */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          className="mt-8"
        >
          <SectionLabel>Pinned</SectionLabel>
          <PinnedSection />
        </motion.section>

        {/* 5. Social Feed */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
          className="mt-8"
        >
          <SectionLabel>Feed</SectionLabel>
          <HomeSocialFeed />
        </motion.section>

        {/* 6. Discover For You */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          className="mt-8"
        >
          <SectionLabel>Discover For You</SectionLabel>
          <DiscoverForYou />
        </motion.section>
      </div>
    </PullToRefresh>
  );
}