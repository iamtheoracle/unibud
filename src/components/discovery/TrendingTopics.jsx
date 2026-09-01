import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame, Hash } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Trending topics — computed from real hashtags in recent posts, ranked by
// engagement (likes + comments). No hardcoded trends.
export default function TrendingTopics({ onPickTag }) {
  const { data: posts } = useQuery({
    queryKey: ["trendingPosts"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 100),
  });

  const trends = useMemo(() => {
    const map = new Map();
    for (const p of posts || []) {
      for (const h of p.hashtags || []) {
        if (!h) continue;
        const key = h.toLowerCase();
        const e = map.get(key) || { tag: h, count: 0, engagement: 0 };
        e.count += 1;
        e.engagement += (p.likes_count || 0) + (p.comments_count || 0);
        map.set(key, e);
      }
    }
    return [...map.values()]
      .sort((a, b) => b.engagement - a.engagement || b.count - a.count)
      .slice(0, 8);
  }, [posts]);

  if (trends.length === 0) return null;

  return (
    <section className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Flame className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Trending</h2>
      </div>
      <div className="space-y-1.5">
        {trends.map((t, i) => (
          <motion.button
            key={t.tag}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onPickTag?.(t.tag)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-card border border-border/30 spring-tap text-left"
          >
            <span className="text-[12px] font-bold text-muted-foreground w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-foreground truncate">#{t.tag}</p>
              <p className="text-[10px] text-muted-foreground">{t.count} post{t.count === 1 ? "" : "s"}</p>
            </div>
            <Hash className="w-3.5 h-3.5 text-muted-foreground/50" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}