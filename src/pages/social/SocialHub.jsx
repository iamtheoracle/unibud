import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getCardsForWorkspace } from "@/lib/workspace/cardRegistry";
import { rankCards, buildContext } from "@/lib/workspace/cardRanker";
import WorkspaceRenderer from "@/components/workspace/WorkspaceRenderer";

const EASE = [0.16, 1, 0.3, 1];

/**
 * SocialHub — one intelligent social workspace.
 *
 * Everything social (feed, friends, events, communities, marketplace,
 * opportunities, social accounts) lives as modular cards on this single
 * scrollable page. Bud ranks cards based on context.
 */
export default function SocialHub() {
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

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mb-5">
        <h1 className="font-heading font-bold text-[28px] text-foreground leading-tight">Social</h1>
        <p className="text-[12px] text-muted-foreground mt-1">Your campus life — one calm, intelligent feed.</p>
      </motion.div>

      <WorkspaceRenderer cards={rankedCards} />
    </div>
  );
}