import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Users, UserPlus, FileText, Rocket, Trophy, Building2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function MeStatsGrid({ user }) {
  const { data: followers = [] } = useQuery({
    queryKey: ["me", "followers"],
    queryFn: () => base44.entities.Follow.filter({ followed_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["me", "following"],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["me", "posts-count"],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["me", "projects-count"],
    queryFn: () => base44.entities.Project.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["me", "achievements-count"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 50),
  });

  const { data: communities = [] } = useQuery({
    queryKey: ["me", "communities-count"],
    queryFn: () => base44.entities.Community.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const stats = [
    { icon: Users, value: followers.length, label: "Followers", color: "#3B82F6" },
    { icon: UserPlus, value: following.length, label: "Following", color: "#06B6D4" },
    { icon: FileText, value: posts.length, label: "Posts", color: "#8B5CF6" },
    { icon: Rocket, value: projects.length, label: "Projects", color: "#A855F7" },
    { icon: Trophy, value: achievements.length, label: "Awards", color: "#FACC15" },
    { icon: Building2, value: communities.length, label: "Communities", color: "#10B981" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
      className="grid grid-cols-3 gap-2"
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center py-3 rounded-[16px]"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <s.icon className="w-3.5 h-3.5 mb-1.5" style={{ color: s.color }} strokeWidth={2.2} />
          <p className="text-[18px] font-bold text-white">{s.value}</p>
          <p className="text-[9px] text-white/50">{s.label}</p>
        </div>
      ))}
    </motion.div>
  );
}