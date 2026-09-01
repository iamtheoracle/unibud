import React from "react";
import { ChevronRight, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_COMMUNITIES = [
  { id: "d1", name: "Computer Science Hub", members_count: 1200, subject: "Computer Science" },
  { id: "d2", name: "Chess Club", members_count: 89, subject: "Chess" },
  { id: "d3", name: "Entrepreneurship Hub", members_count: 312, subject: "Business" },
  { id: "d4", name: "Music Lovers", members_count: 204, subject: "Music" },
];

export default function CommunitiesPreview() {
  const { isDemoMode } = useDemoMode();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["communitiesPreview"],
    queryFn: () => base44.entities.StudyGroup.filter({ type: "public" }, "-members_count", 10),
    enabled: !isDemoMode,
  });

  const communities = isDemoMode ? DEMO_COMMUNITIES : (groups || []);

  if (isLoading && !isDemoMode) {
    return (
      <div className="px-4 pb-8">
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Communities</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map((i) => <div key={i} className="w-[135px] h-[120px] rounded-[20px] shimmer flex-shrink-0" />)}
        </div>
      </div>
    );
  }

  if (communities.length === 0) return null;

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Communities</h3>
        <Link to="/study-groups" className="text-[12px] font-semibold text-primary flex items-center spring-tap">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {communities.map((c, i) => (
          <motion.div
            key={c.id || i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={"/study-groups/" + (c.id || "")}>
              <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex-shrink-0 w-[135px] text-center card-hover">
                <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center text-2xl mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-[11px] text-foreground leading-tight">{c.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.members_count || 0} members</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}