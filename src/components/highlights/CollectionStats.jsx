import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Bookmark, Users, MessageSquare, Heart, TrendingUp, CheckCircle2,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * CollectionStats — real-time statistics for shared collections.
 * Computes all metrics from actual database records — no fake data.
 * Shows: items, team size, cross-user saves, discussions, reactions,
 * and accepted answers.
 */
export default function CollectionStats({ collectionId, items = [], collaborators = [] }) {
  const sourceUrls = items.map((i) => i.source_url).filter(Boolean);

  const { data: comments = [] } = useQuery({
    queryKey: ["collection-stats", collectionId],
    queryFn: () => base44.entities.QuadComment.filter({ collection_id: collectionId }, "created_date", 500),
    enabled: !!collectionId,
    staleTime: 15000,
  });

  const { data: savesCount = 0 } = useQuery({
    queryKey: ["collection-saves", sourceUrls.join(",")],
    queryFn: async () => {
      if (sourceUrls.length === 0) return 0;
      const results = await base44.entities.Highlight.filter(
        { source_url: { $in: sourceUrls } },
        "-created_date",
        500
      );
      return results.length;
    },
    enabled: sourceUrls.length > 0,
    staleTime: 30000,
  });

  const discussions = comments.length;
  const reactions = comments.reduce((sum, c) => sum + (c.likes_count || 0), 0);
  const accepted = comments.filter((c) => c.is_answered).length;

  const stats = [
    { label: "Items", value: items.length, icon: Bookmark },
    { label: "Team", value: collaborators.length, icon: Users },
    { label: "Saves", value: savesCount, icon: TrendingUp },
    { label: "Discussions", value: discussions, icon: MessageSquare },
    { label: "Reactions", value: reactions, icon: Heart },
    { label: "Accepted", value: accepted, icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
            className="p-2.5 rounded-2xl glass-card flex flex-col items-center gap-1"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
            <span className="text-[16px] font-bold text-foreground tabular-nums">{s.value}</span>
            <span className="text-[9px] text-muted-foreground font-medium">{s.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}