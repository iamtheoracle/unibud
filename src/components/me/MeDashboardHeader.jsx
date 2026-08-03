import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import { toast } from "@/components/ui/use-toast";
import EditProfileModal from "@/components/me/EditProfileModal";
import { BadgeCheck, Pencil, Share2, QrCode, Search, Settings } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function MeDashboardHeader({ user }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const handle = user?.username ? `@${user.username}` : null;
  const uni = [user?.university, user?.department, user?.level].filter(Boolean).join(" · ");

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Profile link copied" });
    }
  }, [name]);

  const actions = [
    { icon: Pencil, onClick: () => setEditing(true) },
    { icon: Share2, onClick: handleShare },
    { icon: QrCode, onClick: () => toast({ title: "QR code coming soon" }) },
    { icon: Search, onClick: () => navigate("/discover") },
    { icon: Settings, onClick: () => navigate("/settings") },
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
        {/* Profile row */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-[80px] h-[80px] rounded-full overflow-hidden ring-2 ring-white/10 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              {user?.avatar_url ? (
                <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" />
              ) : (
                <span className="text-[32px] font-bold text-white/80">{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {/* Online status dot */}
            <div
              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ring-2 ring-black/50"
              style={{ background: "#22C55E" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[22px] font-bold text-white truncate tracking-tight">{name}</h2>
              {user?.role && (
                <BadgeCheck className="w-5 h-5 flex-shrink-0" style={{ color: "#FF8A00" }} strokeWidth={2.5} />
              )}
            </div>
            {handle && <p className="text-[12px] text-white/40 truncate">{handle}</p>}
            {uni && <p className="text-[12px] text-white/50 truncate mt-0.5">{uni}</p>}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-4">
          {actions.map((a, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={a.onClick}
              className="flex-1 h-10 rounded-[14px] flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <a.icon className="w-4 h-4 text-white/70" strokeWidth={2.2} />
            </motion.button>
          ))}
        </div>
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </motion.div>
  );
}