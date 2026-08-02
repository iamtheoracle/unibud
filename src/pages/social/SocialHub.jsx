import React, { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getCardsForWorkspace } from "@/lib/workspace/cardRegistry";
import { rankCards, buildContext } from "@/lib/workspace/cardRanker";
import WorkspaceRenderer from "@/components/workspace/WorkspaceRenderer";
import BudBriefingBar from "@/components/bud/home/BudBriefingBar";
import SocialTopNav from "@/components/social/SocialTopNav";
import OrbitHeader from "@/components/orbit/OrbitHeader";
import OrbitCategoryBar from "@/components/orbit/OrbitCategoryBar";
import OrbitCategoryFeed from "@/components/orbit/OrbitCategoryFeed";
import { useOrbitCategories } from "@/hooks/useOrbitCategories";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SocialHub — Bud's social workspace.
 *
 * Begins with Bud's contextual understanding (BudBriefingBar), then
 * presents ranked social cards. Bud prioritizes what the student
 * sees based on events, announcements, and community activity.
 */
export default function SocialHub() {
  const [activeCategory, setActiveCategory] = useState("foryou");
  const scrollPositions = useRef({});
  const { visibleCategories, favorites, trackVisit } = useOrbitCategories();

  // Fetch context signals for the card ranker
  const { data: events } = useQuery({
    queryKey: ["social-hub-events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 5),
    staleTime: 120000,
  });
  const { data: announcements } = useQuery({
    queryKey: ["social-hub-announcements"],
    queryFn: () => base44.entities.QuadPost.filter({ type: "news" }, "-created_date", 3),
    staleTime: 60000,
  });

  // Build context and rank cards
  const rankedCards = useMemo(() => {
    const baseCards = getCardsForWorkspace("social");
    const ctx = buildContext({
      events: events,
      announcements: announcements,
    });
    return rankCards(baseCards, ctx);
  }, [events, announcements]);

  const handleCategoryChange = (catId) => {
    scrollPositions.current[activeCategory] = window.scrollY;
    setActiveCategory(catId);
    trackVisit(catId);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPositions.current[catId] || 0, behavior: "instant" });
    });
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-32">
      {/* Sticky header + pinned category bar */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl safe-area-pt">
        <OrbitHeader />
        <OrbitCategoryBar
          categories={visibleCategories}
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
          favorites={favorites}
        />
      </div>

      <div className="px-5 pt-4">
        {/* Top navigation — Discover · Communities · Create · Messages · Events */}
        <SocialTopNav />

        {/* Bud presence — contextual briefing */}
        <BudBriefingBar />

        {/* Category-filtered content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {activeCategory === "foryou" ? (
              <WorkspaceRenderer cards={rankedCards} />
            ) : (
              <OrbitCategoryFeed category={activeCategory} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}