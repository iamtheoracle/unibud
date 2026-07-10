import React from "react";
import { Flame, Users, TrendingUp, MessageCircle, Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_PULSE = [
  { title: "CSC 302 Study Group forming — Data Structures exam prep", activity: "32 discussing", type: "study", path: "/study-groups" },
  { title: "Inter-University Hackathon registration opens Friday", activity: "128 interested", type: "event", path: "/challenges" },
  { title: "Scholarship alert: MTN Foundation Science Scholarship", activity: "56 saved", type: "opportunity", path: "/opportunities" },
];

export default function CampusPulse() {
  const { isDemoMode } = useDemoMode();

  const { data: groups } = useQuery({
    queryKey: ["pulseGroups"],
    queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }, "-created_date", 3),
    enabled: !isDemoMode,
  });
  const { data: challenges } = useQuery({
    queryKey: ["pulseChallenges"],
    queryFn: () => base44.entities.Challenge.filter({ status: "active" }, "-created_date", 3),
    enabled: !isDemoMode,
  });
  const { data: opportunities } = useQuery({
    queryKey: ["pulseOpportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 3),
    enabled: !isDemoMode,
  });

  let pulseItems = [];

  if (isDemoMode) {
    pulseItems = DEMO_PULSE;
  } else {
    (groups || []).forEach((g) => {
      pulseItems.push({
        title: g.name + (g.subject ? " — " + g.subject : ""),
        activity: (g.members_count || 0) + " members",
        type: "study",
        path: "/study-groups",
      });
    });
    (challenges || []).forEach((c) => {
      pulseItems.push({
        title: c.title,
        activity: (c.participants_count || 0) + " joined",
        type: "event",
        path: "/challenges",
      });
    });
    (opportunities || []).forEach((o) => {
      pulseItems.push({
        title: o.title,
        activity: o.organization || "New",
        type: "opportunity",
        path: "/opportunities",
      });
    });
    pulseItems = pulseItems.slice(0, 4);
  }

  if (pulseItems.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Campus Pulse</h3>
        <Flame className="w-4 h-4 text-warning" />
      </div>
      <div className="space-y-2.5">
        {pulseItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to={item.path}>
              <div className="bg-card rounded-[20px] soft-shadow border border-border/20 overflow-hidden flex items-center gap-3.5 p-3 card-hover">
                <div className="w-14 h-14 rounded-[14px] overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {item.type === "study" && <Users className="w-5 h-5 text-muted-foreground" />}
                  {item.type === "event" && <Trophy className="w-5 h-5 text-muted-foreground" />}
                  {item.type === "opportunity" && <Award className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[13px] text-foreground leading-snug line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {item.type === "study" && <Users className="w-3 h-3 text-muted-foreground" />}
                    {item.type === "event" && <TrendingUp className="w-3 h-3 text-muted-foreground" />}
                    {item.type === "opportunity" && <MessageCircle className="w-3 h-3 text-muted-foreground" />}
                    <span className="text-[10px] text-muted-foreground font-medium">{item.activity}</span>
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