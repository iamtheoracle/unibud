import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Megaphone, Pin, AlertCircle } from "lucide-react";
import { UniCard } from "@/components/uni-portal/UniPortalUI";
import UniEmptyState from "@/components/uni-portal/UniEmptyState";

const PRIORITY_TONE = {
  low: "text-muted-foreground",
  normal: "text-info",
  high: "text-warning",
  urgent: "text-error",
};

export default function PendingAnnouncementsCard({ user, delay = 0.15 }) {
  const navigate = useNavigate();
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["StaffAnnouncement", "pending"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 30),
  });

  const pending = (announcements || []).filter(
    (a) => a.status === "draft" || a.status === "scheduled"
  );

  return (
    <UniCard
      title="Pending Announcements"
      description="Drafts & scheduled"
      delay={delay}
      padding={false}
    >
      {isLoading ? (
        <div className="p-5 space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-12 rounded-[12px] bg-muted/40 shimmer" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <UniEmptyState
          icon={Megaphone}
          title="No pending announcements"
          description="Drafts and scheduled announcements will show up here."
          actionLabel="New Announcement"
          onAction={() => navigate("/uni-portal/announcements")}
          accent="purple"
        />
      ) : (
        <div className="divide-y divide-border/20">
          {pending.slice(0, 5).map((a, i) => (
            <motion.div
              key={a.id || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/30 cursor-pointer"
              onClick={() => navigate("/uni-portal/announcements")}
            >
              <div className="w-9 h-9 rounded-[12px] bg-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {a.pinned ? (
                  <Pin className="w-4 h-4 text-purple" />
                ) : (
                  <Megaphone className="w-4 h-4 text-purple" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{a.title}</p>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {a.status} · {a.audience?.replace("_", " ")}
                  {a.target_name ? ` · ${a.target_name}` : ""}
                </p>
              </div>
              {a.priority === "urgent" && (
                <AlertCircle className={`w-4 h-4 ${PRIORITY_TONE[a.priority] || ""} flex-shrink-0`} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </UniCard>
  );
}