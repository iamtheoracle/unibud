import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import { toast } from "@/components/ui/use-toast";
import EditProfileModal from "@/components/me/EditProfileModal";
import { BadgeCheck, Pencil, Share2, QrCode } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const PROFILE_FIELDS = [
  "avatar_url", "bio", "username", "department", "faculty",
  "university", "level", "matriculation_number", "phone",
];

export default function MeProfileHeader({ user }) {
  const [editing, setEditing] = useState(false);

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

  const { data: achievements = [] } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-created_date", 50),
  });

  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const handle = user?.username ? `@${user.username}` : null;
  const uni = [user?.university, user?.department, user?.level].filter(Boolean).join(" · ");

  const filledFields = PROFILE_FIELDS.filter((f) => {
    const val = user?.[f];
    return val && String(val).trim().length > 0;
  }).length;
  const completion = Math.round((filledFields / PROFILE_FIELDS.length) * 100);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Profile link copied" });
    }
  }, [name]);

  const stats = [
    { value: followers.length, label: "Followers" },
    { value: following.length, label: "Following" },
    { value: achievements.length, label: "Awards" },
  ];

  const actions = [
    { icon: Pencil, label: "Edit", onClick: () => setEditing(true) },
    { icon: Share2, label: "Share", onClick: handleShare },
    { icon: QrCode, label: "QR", onClick: () => toast({ title: "QR code coming soon" }) },
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
            className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/10 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" />
            ) : (
              <span className="text-[28px] font-bold text-white/80">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[20px] font-bold text-white truncate tracking-tight">{name}</h2>
              {user?.role && (
                <BadgeCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#FF8A00" }} strokeWidth={2.5} />
              )}
            </div>
            {handle && <p className="text-[12px] text-white/50 truncate">{handle}</p>}
            {uni && <p className="text-[12px] text-white/60 truncate mt-0.5">{uni}</p>}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center py-2.5 rounded-[14px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <p className="text-[18px] font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Profile completion */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-white/50">Profile Completion</span>
            <span className="text-[11px] font-bold text-white/70">{completion}%</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #FF8A00, #FFA64D)" }}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {actions.map((a) => (
            <motion.button
              key={a.label}
              whileTap={{ scale: 0.95 }}
              onClick={a.onClick}
              className="flex flex-col items-center gap-1.5 py-2.5 rounded-[14px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <a.icon className="w-4 h-4 text-white/80" strokeWidth={2.2} />
              <span className="text-[10px] font-semibold text-white/70">{a.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </motion.div>
  );
}