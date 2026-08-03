import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import EditProfileModal from "@/components/me/EditProfileModal";
import { BadgeCheck, Pencil } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function MeProfileHeader({ user }) {
  const [editing, setEditing] = useState(false);

  const { data: followers = [] } = useQuery({
    queryKey: ["me", "followers"],
    queryFn: () => base44.entities.Follow.filter({ followed_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["me", "following"],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 50),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["me", "projects"],
    queryFn: () => base44.entities.Project.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["me", "portfolio"],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const uni = [user?.university, user?.department].filter(Boolean).join(" · ");

  const stats = [
    { value: followers.length, label: "Followers" },
    { value: connections.length, label: "Connections" },
    { value: achievements.length, label: "Awards" },
    { value: projects.length, label: "Projects" },
    { value: portfolio.length, label: "Portfolio" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div
        className="rounded-[24px] p-5 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Profile photo + identity */}
        <div className="flex items-center gap-4">
          <div
            className="w-[80px] h-[80px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" />
            ) : (
              <span className="text-[32px] font-bold text-white/80">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[22px] font-bold text-white truncate tracking-tight">{name}</h2>
              {user?.role && (
                <BadgeCheck className="w-5 h-5 flex-shrink-0" style={{ color: "#FF8A00" }} strokeWidth={2.5} />
              )}
            </div>
            {uni && <p className="text-[13px] text-white/50 truncate mt-0.5">{uni}</p>}
          </div>
        </div>

        {/* Quick stats — scrollable */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 -mx-1 px-1">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-shrink-0 text-center py-2.5 px-3 rounded-[12px]"
              style={{ background: "rgba(255,255,255,0.03)", minWidth: 64 }}
            >
              <p className="text-[16px] font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-white/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setEditing(true)}
          className="w-full py-3 mt-4 rounded-[16px] text-[14px] font-bold text-white flex items-center justify-center gap-2"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
          Edit Profile
        </motion.button>
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </motion.div>
  );
}