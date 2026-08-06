import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Star, Rocket, Award, ChevronRight, Users, Calendar,
  PartyPopper, Briefcase, BookOpen,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";

export default function CampusLifeSection() {
  const { data: traditions } = useQuery({
    queryKey: ["meTraditions"],
    queryFn: () => base44.entities.CampusTradition.list("-created_date", 50),
  });
  const { data: opportunities } = useQuery({
    queryKey: ["meOpps"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 50),
  });
  const { data: achievements } = useQuery({
    queryKey: ["meAchievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 50),
  });
  const { data: groups } = useQuery({
    queryKey: ["meGroups"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 50),
  });
  const { data: fyp } = useQuery({
    queryKey: ["meFyp"],
    queryFn: () => base44.entities.FYPProject.list("-created_date", 5),
  });

  const stats = [
    { icon: Users, label: "Study Groups", value: groups?.length || 0, color: "text-information", bg: "bg-information/10", path: "/study-groups" },
    { icon: Calendar, label: "Traditions", value: traditions?.length || 0, color: "text-success", bg: "bg-success/10", path: "/campus-traditions" },
    { icon: Briefcase, label: "Opportunities", value: opportunities?.length || 0, color: "text-warning", bg: "bg-warning/10", path: "/opportunities" },
    { icon: Award, label: "Achievements", value: achievements?.length || 0, color: "text-primary", bg: "bg-primary/10", path: "/achievements" },
  ];

  const hasData = groups?.length > 0 || traditions?.length > 0 || opportunities?.length > 0 || achievements?.length > 0 || fyp?.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Star className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[15px] text-foreground">Campus Journey</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={stat.path}>
              <GlassCard variant="solid" className="p-3.5 flex items-center gap-3 card-hover" delay={i * 0.04}>
                <div className={"w-10 h-10 rounded-[14px] " + stat.bg + " flex items-center justify-center flex-shrink-0"}>
                  <stat.icon className={"w-[18px] h-[18px] " + stat.color} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="font-heading font-bold text-[16px] text-foreground leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* FYP Progress */}
      {fyp && fyp.length > 0 && (
        <Link to="/fyp-hub">
          <GlassCard variant="solid" className="p-4 card-hover" delay={0.35}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[12px] font-semibold text-foreground">Final Year Project</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground">{fyp?.[0]?.title || "No project yet"}</p>
          </GlassCard>
        </Link>
      )}

      {/* Achievements timeline link */}
      <Link to="/achievements">
        <GlassCard variant="solid" className="p-4 flex items-center gap-3 card-hover" delay={0.45}>
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-foreground">Achievements Timeline</p>
            <p className="text-[10px] text-muted-foreground">{(achievements?.length || 0) + " milestones"}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </GlassCard>
      </Link>

      {!hasData && (
        <GlassCard variant="solid" className="p-6" delay={0.5}>
          <EmptyState
            icon={PartyPopper}
            title="Your campus journey starts here"
            description="Join study groups, attend traditions, and track achievements to build your story"
          />
        </GlassCard>
      )}
    </div>
  );
}