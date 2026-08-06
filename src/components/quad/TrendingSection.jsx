import React from "react";
import { Flame, TrendingUp, MessageCircle, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_TRENDING = [
  { title: "CSC 302 study group forming for exam prep", engagement: "32 discussing", type: "study" },
  { title: "Inter-University Hackathon registration opens Friday", engagement: "128 interested", type: "event" },
  { title: "Student Union election results announced", engagement: "89 reactions", type: "news" },
  { title: "Best study spots on campus — share yours", engagement: "45 comments", type: "discussion" },
];

export default function TrendingSection() {
  const { isDemoMode } = useDemoMode();

  const { data: groups } = useQuery({
    queryKey: ["trendingGroups"],
    queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }, "-members_count", 5),
    enabled: !isDemoMode,
  });
  const { data: challenges } = useQuery({
    queryKey: ["trendingChallenges"],
    queryFn: () => base44.entities.Challenge.filter({ status: "active" }, "-participants_count", 5),
    enabled: !isDemoMode,
  });

  let trending = [];
  if (isDemoMode) {
    trending = DEMO_TRENDING;
  } else {
    (groups || []).forEach((g) => {
      trending.push({ title: g.name, engagement: (g.members_count || 0) + " members", type: "study", path: "/study-groups" });
    });
    (challenges || []).forEach((c) => {
      trending.push({ title: c.title, engagement: (c.participants_count || 0) + " joined", type: "event", path: "/challenges" });
    });
    trending = trending.slice(0, 5);
  }

  if (trending.length === 0) return null;

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Flame className="w-4 h-4 text-warning" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Trending on Campus</h3>
      </div>
      <div className="space-y-2">
        {trending.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={item.path || "/discover"} className="block">
              <div className="w-full bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3 text-left card-hover">
                <span className="font-heading font-extrabold text-[18px] text-muted-foreground/60 w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-[12px] text-foreground leading-snug">{item.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {item.type === "study" && <TrendingUp className="w-3 h-3 text-muted-foreground" />}
                    {item.type === "discussion" && <MessageCircle className="w-3 h-3 text-muted-foreground" />}
                    {item.type === "event" && <Trophy className="w-3 h-3 text-muted-foreground" />}
                    <span className="text-[10px] text-muted-foreground font-medium">{item.engagement}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}